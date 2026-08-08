import { z } from "zod";

export const devisSchema = z.object({
  serviceId: z.uuid({ error: "Service invalide." }),
  name: z.string().trim().min(2, { error: "Votre nom est obligatoire." }),
  email: z.email({ error: "Adresse email invalide." }),
  phone: z.string().trim().min(8, { error: "Numéro de téléphone invalide." }),
  company: z.string().trim().optional(),
  message: z.string().trim().min(20, {
    error: "Décrivez votre besoin en quelques phrases (20 caractères minimum).",
  }),
  budget: z.string().trim().optional(),
});
