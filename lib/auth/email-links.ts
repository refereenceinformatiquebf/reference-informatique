import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";

/**
 * Liens de connexion, de confirmation et de réinitialisation.
 *
 * Supabase ne nous envoie AUCUN email : on lui demande seulement de fabriquer
 * le jeton (API d'administration, clé de service côté serveur), puis c'est
 * Brevo qui envoie le message, avec nos gabarits français, depuis
 * hello@reference-informatique.com. Le lien pointe vers /auth/confirm, une
 * page qui demande un clic avant d'utiliser le jeton (les antivirus des
 * messageries ouvrent les liens : sans ce clic, ils les « consommeraient »).
 */

export type AuthLinkType = "signup" | "magiclink" | "recovery";

/** Chemin de retour accepté : relatif au site, jamais une adresse externe. */
export function safeNextPath(next?: string | null): string | undefined {
  if (!next) return undefined;
  const value = next.trim();
  if (
    value.length > 200 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("://") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return undefined;
  }
  return value;
}

export function buildConfirmUrl(
  tokenHash: string,
  type: string,
  next?: string | null,
) {
  const url = new URL("/auth/confirm", SITE.url);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  const safe = safeNextPath(next);
  if (safe) url.searchParams.set("next", safe);
  return url.toString();
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

type AuthUserRow = {
  id: string;
  email_confirmed_at: Date | null;
};

/** Compte d'authentification pour cet email (lecture directe de auth.users). */
export async function findAuthUser(email: string) {
  const rows = await prisma.$queryRaw<AuthUserRow[]>`
    SELECT id, email_confirmed_at FROM auth.users
    WHERE lower(email) = ${normalizeEmail(email)} LIMIT 1`;
  const row = rows[0];
  return row
    ? { id: row.id, confirmed: row.email_confirmed_at !== null }
    : null;
}

export type GeneratedLink = {
  url: string;
  /** Jeton brut du lien : sert à ouvrir une session directement (voir
   * lib/checkout/access.ts), sans passer par un email. */
  tokenHash: string;
  userId: string;
  /** Type réellement émis par Supabase (un lien de connexion vers une adresse
   * inconnue crée le compte et devient un lien « signup »). */
  verificationType: string;
};

/**
 * Demande à Supabase un jeton, sans qu'il envoie quoi que ce soit.
 * Renvoie null si l'adresse est inconnue (réinitialisation) ou en cas d'échec.
 */
export async function generateAuthLink(params: {
  kind: AuthLinkType;
  email: string;
  password?: string;
  data?: { name: string; phone?: string };
  next?: string | null;
}): Promise<GeneratedLink | null> {
  const email = normalizeEmail(params.email);
  const admin = createAdminClient();

  const { data, error } =
    params.kind === "signup"
      ? await admin.auth.admin.generateLink({
          type: "signup",
          email,
          password: params.password ?? "",
          options: { data: params.data },
        })
      : await admin.auth.admin.generateLink({ type: params.kind, email });

  if (error || !data?.properties?.hashed_token) {
    if (error && error.code !== "user_not_found") {
      console.error("[auth] génération du lien impossible :", error.message);
    }
    return null;
  }

  return {
    url: buildConfirmUrl(
      data.properties.hashed_token,
      data.properties.verification_type,
      params.next,
    ),
    tokenHash: data.properties.hashed_token,
    userId: data.user.id,
    verificationType: data.properties.verification_type,
  };
}

/** Prénom ou nom à afficher dans l'email (profil, sinon rien). */
export async function displayNameFor(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  if (!profile) return undefined;
  // Pour un compte créé par simple lien, le nom est la partie locale de
  // l'email : on ne l'affiche pas comme un prénom.
  if (profile.email && profile.name === profile.email.split("@")[0]) {
    return undefined;
  }
  return profile.name;
}
