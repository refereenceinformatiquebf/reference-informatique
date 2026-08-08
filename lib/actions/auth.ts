"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";

export type AuthFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

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
    return { message: "Adresse email ou mot de passe incorrect." };
  }

  const next = formData.get("next");
  redirect(
    typeof next === "string" && next.startsWith("/") ? next : "/espace-client",
  );
}

export async function signUp(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await enforceRateLimit("sign-up", 5, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const validated = signUpSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, phone, email, password } = validated.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { message: "Cette adresse email est déjà associée à un compte." };
    }
    return {
      message: "Une erreur est survenue lors de l'inscription. Réessayez.",
    };
  }

  // Si la confirmation par email est activée sur le projet Supabase, aucune
  // session n'existe encore à ce stade : on informe l'utilisateur au lieu de
  // le rediriger vers un espace client auquel il n'a pas encore accès.
  if (!data.session) {
    return {
      success: true,
      message:
        "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.",
    };
  }

  redirect("/espace-client");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/connexion");
}

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    await enforceRateLimit("forgot-password", 5, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return { message: error.message };
    throw error;
  }

  const validated = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/reinitialiser-mot-de-passe`;
  const { error } = await supabase.auth.resetPasswordForEmail(
    validated.data.email,
    { redirectTo },
  );

  if (error) {
    console.error("[requestPasswordReset]", error);
  }

  // Message volontairement identique en cas de succès ou d'échec : ne
  // jamais révéler si une adresse email existe en base (énumération de
  // comptes).
  return {
    success: true,
    message:
      "Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.",
  };
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
