"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireProfile } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { safeNextPath } from "@/lib/auth/email-links";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export type MfaState =
  | {
      ok?: boolean;
      message?: string;
      /** Étape d'activation : image du QR code (SVG en data:), clé de saisie manuelle, identifiant du facteur. */
      enroll?: { factorId: string; qr: string; secret: string };
    }
  | undefined;

const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, {
    error: "Saisissez les 6 chiffres affichés par l'application.",
  });

/** Démarre l'activation : renvoie le QR code à scanner. Remplace une activation abandonnée. */
export async function startMfaEnrollAction(): Promise<MfaState> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  // Un facteur commencé puis abandonné empêcherait d'en créer un nouveau.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const factor of factors?.all ?? []) {
    if (factor.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Application ${new Date().toISOString().slice(0, 10)}`,
    issuer: "Référence Informatique",
  });
  if (error || !data) {
    console.error("[mfa] activation impossible :", error);
    return {
      ok: false,
      message:
        error?.code === "mfa_totp_enroll_not_enabled"
          ? "La double vérification n'est pas activée sur le projet Supabase (Authentication → Sign In / Providers → Multi-Factor → TOTP)."
          : "Impossible de démarrer l'activation. Réessayez dans un instant.",
    };
  }
  await audit(
    admin,
    "mfa.enroll_start",
    "admin",
    admin.id,
    "Activation de la double vérification commencée",
  );
  return {
    enroll: {
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    },
  };
}

/** Termine l'activation avec le premier code affiché par l'application. */
export async function confirmMfaEnrollAction(
  _state: MfaState,
  formData: FormData,
): Promise<MfaState> {
  const admin = await requireAdmin();
  const factorId = String(formData.get("factorId") ?? "");
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success) {
    return {
      ok: false,
      message: code.error.issues[0]?.message,
      enroll: stillEnrolling(formData),
    };
  }
  try {
    await enforceRateLimit("mfa-confirm", 10, 10 * 60, admin.id);
  } catch (error) {
    if (error instanceof RateLimitError)
      return {
        ok: false,
        message: error.message,
        enroll: stillEnrolling(formData),
      };
    throw error;
  }
  const supabase = await createClient();
  const challenge = await supabase.auth.mfa.challenge({ factorId });
  if (challenge.error || !challenge.data) {
    return {
      ok: false,
      message: "Activation expirée : recommencez.",
      enroll: undefined,
    };
  }
  const verify = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.data.id,
    code: code.data,
  });
  if (verify.error) {
    return {
      ok: false,
      message:
        "Ce code n'est pas bon. Vérifiez l'heure de votre téléphone et saisissez le code qui s'affiche maintenant.",
      enroll: stillEnrolling(formData),
    };
  }
  await audit(
    admin,
    "mfa.enroll",
    "admin",
    admin.id,
    "Double vérification activée",
  );
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message:
      "Double vérification activée : elle vous sera demandée à chaque connexion à l'administration.",
  };
}

/** Conserve l'écran du QR code quand le code saisi est faux (le QR n'est jamais redemandé à Supabase). */
function stillEnrolling(formData: FormData) {
  const factorId = String(formData.get("factorId") ?? "");
  const qr = String(formData.get("qr") ?? "");
  const secret = String(formData.get("secret") ?? "");
  return factorId && qr && secret ? { factorId, qr, secret } : undefined;
}

/** Désactive la double vérification (la session est déjà vérifiée : requireAdmin l'exige). */
export async function disableMfaAction(
  _state: MfaState,
  formData: FormData,
): Promise<MfaState> {
  const admin = await requireAdmin();
  const factorId = String(formData.get("factorId") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) {
    return {
      ok: false,
      message: "Impossible de désactiver pour le moment. Réessayez.",
    };
  }
  await audit(
    admin,
    "mfa.disable",
    "admin",
    admin.id,
    "Double vérification désactivée",
  );
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Double vérification désactivée." };
}

/** À la connexion : saisie du code pour passer au niveau vérifié. Hors de /admin. */
export async function verifyMfaAction(
  _state: MfaState,
  formData: FormData,
): Promise<MfaState> {
  const profile = await requireProfile();
  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success)
    return { ok: false, message: code.error.issues[0]?.message };
  try {
    await enforceRateLimit("mfa-verify", 8, 10 * 60, profile.id);
  } catch (error) {
    if (error instanceof RateLimitError)
      return { ok: false, message: error.message };
    throw error;
  }

  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.[0];
  if (!factor) redirect("/admin");

  const challenge = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challenge.error || !challenge.data) {
    return {
      ok: false,
      message: "Impossible de vérifier pour le moment. Réessayez.",
    };
  }
  const verify = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.data.id,
    code: code.data,
  });
  if (verify.error) {
    return {
      ok: false,
      message:
        "Ce code n'est pas bon. Saisissez le code qui s'affiche maintenant dans l'application.",
    };
  }
  redirect(safeNextPath(String(formData.get("next") ?? "")) ?? "/admin");
}
