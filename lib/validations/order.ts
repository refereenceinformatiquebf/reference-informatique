import { z } from "zod";

/** Informations de livraison d'une clé USB. Obligatoires seulement pour les
 * produits à livraison physique (voir lib/actions/order.ts). */
export const shippingSchema = z.object({
  city: z.string().trim().min(2, {
    error: "Indiquez votre ville pour que nous puissions vous livrer.",
  }),
  address: z.string().trim().min(5, {
    error:
      "Indiquez votre quartier et un repère (par exemple « Cissin, près de la station »).",
  }),
  phone: z
    .string()
    .trim()
    .min(8, { error: "Indiquez un numéro joignable (WhatsApp si possible)." }),
});

/** Nombre maximal de clés USB par commande (une famille, un cadeau). */
export const MAX_KEY_QUANTITY = 5;

export type ShippingInput = z.infer<typeof shippingSchema>;
