import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ error: "Adresse email invalide." }),
  password: z.string().min(1, { error: "Le mot de passe est obligatoire." }),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Le nom doit contenir au moins 2 caractères." }),
  phone: z.string().trim().min(8, { error: "Numéro de téléphone invalide." }),
  email: z.email({ error: "Adresse email invalide." }),
  password: z
    .string()
    .min(8, { error: "Le mot de passe doit contenir au moins 8 caractères." }),
});

export const forgotPasswordSchema = z.object({
  email: z.email({ error: "Adresse email invalide." }),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, {
      error: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
