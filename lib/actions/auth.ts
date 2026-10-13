"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import {
  displayNameFor,
  findAuthUser,
  generateAuthLink,
  normalizeEmail,
  safeNextPath,
} from "@/lib/auth/email-links";
import {
  forgotPasswordSchema,
  loginLinkSchema,
  profileSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validations/auth";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/honeypot";
import { sendAuthLink } from "@/lib/email/send";

export type AuthFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

const TEN_MINUTES = 10 * 60;

const LINK_SENT_MESSAGE =
  "Si cette adresse est valide, un lien de connexion vient de vous être envoyé. Pensez à regarder dans vos courriers indésirables.";

const SEND_FAILED_MESSAGE =
  "Nous n'avons pas pu envoyer l'email. Réessayez dans un instant, ou écrivez-nous sur WhatsApp : nous vous aidons tout de suite.";

/* ------------------------------ Connexion ------------------------------ */

export async function signIn(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await enforceRateLimit("sign-in", 10, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const validated = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message:
          "Votre adresse email n'est pas encore confirmée. Choisissez « Recevoir un lien de connexion » : le lien confirme votre adresse et vous connecte.",
      };
    }
    return { message: "Adresse email ou mot de passe incorrect." };
  }

  redirect(
    safeNextPath(String(formData.get("next") ?? "")) ?? "/espace-client",
  );
}

/**
 * Connexion par lien envoyé par email (sans mot de passe). Une adresse
 * inconnue crée le compte : le client n'a rien d'autre à faire que d'ouvrir
 * le message. La réponse est identique que l'adresse existe ou non.
 */
export async function requestLoginLink(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = loginLinkSchema.safeParse({ email: formData.get("email") });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  const email = normalizeEmail(validated.data.email);

  try {
    await enforceRateLimit("login-link", 6, TEN_MINUTES, email);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  if (isHoneypotFilled(formData)) {
    return { success: true, message: LINK_SENT_MESSAGE };
  }

  const link = await generateAuthLink({
    kind: "magiclink",
    email,
    next: String(formData.get("next") ?? ""),
  });
  if (!link) return { message: SEND_FAILED_MESSAGE };

  try {
    await sendAuthLink({
      kind: "magiclink",
      to: { email, name: await displayNameFor(link.userId) },
      url: link.url,
    });
  } catch (error) {
    console.error("[requestLoginLink] envoi impossible :", error);
    return { message: SEND_FAILED_MESSAGE };
  }

  return { success: true, message: LINK_SENT_MESSAGE };
}

/* ------------------------------ Inscription ------------------------------ */

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = signUpSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, phone, password } = validated.data;
  const email = normalizeEmail(validated.data.email);

  try {
    await enforceRateLimit("sign-up", 5, 60 * 60, email);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const created = {
    success: true,
    message:
      "Compte créé. Nous venons de vous envoyer un email : cliquez sur le lien qu'il contient pour confirmer votre adresse. Pensez à regarder dans vos courriers indésirables.",
  } as const;

  if (isHoneypotFilled(formData)) return created;

  const existing = await findAuthUser(email);

  // Compte déjà actif : on n'écrase RIEN (ni mot de passe, ni profil). On
  // envoie simplement un lien de connexion, et la réponse reste identique pour
  // ne pas révéler qu'un compte existe.
  if (existing?.confirmed) {
    const link = await generateAuthLink({ kind: "magiclink", email });
    if (link) {
      await sendAuthLink({
        kind: "magiclink",
        to: { email, name: await displayNameFor(link.userId) },
        url: link.url,
      }).catch((error) => console.error("[signUp] envoi impossible :", error));
    }
    return created;
  }

  // Compte jamais confirmé : il n'a ni commande ni donnée, et quelqu'un
  // d'autre a pu l'ouvrir avec cette adresse et SON mot de passe. On le
  // supprime et on le recrée avec les informations de cette demande : le
  // mot de passe de la personne qui confirme est bien le sien.
  if (existing) {
    const { error } = await createAdminClient().auth.admin.deleteUser(
      existing.id,
    );
    if (error) {
      console.error("[signUp] compte non confirmé non supprimé :", error);
      return { message: SEND_FAILED_MESSAGE };
    }
  }

  const link = await generateAuthLink({
    kind: "signup",
    email,
    password,
    data: { name, phone },
  });
  if (!link) {
    return {
      message: "Une erreur est survenue lors de l'inscription. Réessayez.",
    };
  }

  try {
    await sendAuthLink({
      kind: "signup",
      to: { email, name },
      url: link.url,
    });
  } catch (error) {
    console.error("[signUp] envoi impossible :", error);
    return { message: SEND_FAILED_MESSAGE };
  }

  return created;
}

/* ----------------------------- Mot de passe oublié ----------------------------- */

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  const email = normalizeEmail(validated.data.email);

  try {
    await enforceRateLimit("forgot-password", 5, TEN_MINUTES, email);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  // Message volontairement identique en cas de succès, d'adresse inconnue ou
  // d'échec : ne jamais révéler si une adresse email existe en base
  // (énumération de comptes).
  const done: AuthFormState = {
    success: true,
    message:
      "Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé. Pensez à regarder dans vos courriers indésirables.",
  };

  if (isHoneypotFilled(formData)) return done;

  const link = await generateAuthLink({ kind: "recovery", email });
  if (!link) return done;

  await sendAuthLink({
    kind: "recovery",
    to: { email, name: await displayNameFor(link.userId) },
    url: link.url,
  }).catch((error) =>
    console.error("[requestPasswordReset] envoi impossible :", error),
  );

  return done;
}

export async function updatePassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });

  if (error) {
    return {
      message: "Le lien a expiré ou est invalide. Demandez un nouveau lien.",
    };
  }

  redirect("/espace-client");
}

/* ------------------------- Clic sur le lien reçu par email ------------------------- */

const OTP_TYPES = ["signup", "magiclink", "recovery", "email"] as const;
type OtpType = (typeof OTP_TYPES)[number];

/**
 * Utilise le jeton du lien reçu par email. Appelée par le bouton de
 * /auth/confirm (jamais au simple chargement de la page).
 */
export async function confirmAuthLink(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = String(formData.get("type") ?? "") as OtpType;
  if (!tokenHash || !OTP_TYPES.includes(type)) {
    return { message: "Ce lien est incomplet. Demandez-en un nouveau." };
  }

  try {
    await enforceRateLimit("auth-confirm", 20, TEN_MINUTES);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error) {
    return {
      message:
        "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau depuis la page de connexion.",
    };
  }

  if (type === "recovery") redirect("/reinitialiser-mot-de-passe");

  const next = safeNextPath(String(formData.get("next") ?? ""));
  redirect(
    next ??
      (type === "signup" ? "/espace-client?bienvenue=1" : "/espace-client"),
  );
}

/* -------------------------------- Déconnexion -------------------------------- */

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/connexion");
}

/* ----------------------------------- Profil ----------------------------------- */

export async function updateProfile(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const profile = await requireProfile();
  const validated = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      name: validated.data.name,
      phone: validated.data.phone === "" ? null : validated.data.phone,
    },
  });
  revalidatePath("/espace-client");
  return { success: true, message: "Vos informations sont enregistrées." };
}

/** Définit ou change le mot de passe du compte connecté (connexion par lien
 * d'abord, mot de passe ensuite si le client le souhaite). */
export async function setAccountPassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  await requireProfile();
  const validated = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: validated.data.password,
  });
  if (error) {
    return {
      message:
        "Impossible de changer le mot de passe pour le moment. Réessayez, ou demandez un nouveau lien de connexion.",
    };
  }
  return { success: true, message: "Votre mot de passe est enregistré." };
}
