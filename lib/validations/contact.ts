import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, { error: "Votre nom est obligatoire." }),
  email: z.email({ error: "Adresse email invalide." }),
  phone: z.string().trim().optional(),
  message: z
    .string()
    .trim()
    .min(10, { error: "Votre message doit contenir au moins 10 caractères." }),
});
