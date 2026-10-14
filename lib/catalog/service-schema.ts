import { z } from "zod";

/**
 * Validation du formulaire de service de l'administration. Les limites sont
 * larges (elles protègent la mise en page, pas la rédaction) et un test
 * vérifie que TOUS les services actuels du catalogue les respectent : on ne
 * doit jamais pouvoir refuser l'enregistrement d'un service existant.
 */
export const serviceFormSchema = z
  .object({
    slug: z.string().min(1),
    name: z.string().trim().min(3, { error: "Indiquez le nom." }).max(140),
    summary: z
      .string()
      .trim()
      .min(10, { error: "Texte trop court." })
      .max(400, { error: "400 caractères maximum." }),
    tagline: z
      .string()
      .trim()
      .min(5, { error: "Indiquez la promesse." })
      .max(300, { error: "300 caractères maximum." }),
    priceType: z.enum(["FIXED", "FROM", "QUOTE"]),
    priceFrom: z
      .union([z.literal(""), z.coerce.number().int().min(100).max(100_000_000)])
      .optional()
      .transform((value) =>
        value === "" || value === undefined ? null : value,
      ),
    priceNote: z
      .string()
      .trim()
      .min(3, { error: "Indiquez ce que couvre le prix." })
      .max(900, { error: "900 caractères maximum." }),
    timeline: z
      .string()
      .trim()
      .min(3, { error: "Indiquez un délai indicatif." })
      .max(450, { error: "450 caractères maximum." }),
    active: z.boolean(),
    displayOrder: z.coerce.number().int().min(0).max(10_000),
  })
  .refine((value) => value.priceType === "QUOTE" || value.priceFrom !== null, {
    error: "Indiquez le prix, ou choisissez « Sur devis ».",
    path: ["priceFrom"],
  });

export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
