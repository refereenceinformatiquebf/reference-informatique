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

/** Coordonnées de l'acheteur : tout ce qu'il faut pour commander SANS compte.
 * L'email sert à envoyer le lien d'accès à l'achat ; le téléphone (WhatsApp)
 * est vérifié séparément, selon le mode de livraison (voir lib/checkout/rules.ts). */
export const buyerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Indiquez votre nom complet." })
    .max(100, { error: "Ce nom est trop long." }),
  email: z
    .string()
    .trim()
    .max(200, { error: "Cette adresse est trop longue." })
    .pipe(
      z.email({
        error:
          "Cette adresse email semble incorrecte. C'est là que nous envoyons votre accès.",
      }),
    ),
  phone: z
    .string()
    .trim()
    .max(30, { error: "Ce numéro est trop long." })
    .refine((value) => value === "" || value.replace(/\D/g, "").length >= 8, {
      error: "Indiquez un numéro valide (au moins 8 chiffres).",
    }),
});

export type BuyerInput = z.infer<typeof buyerSchema>;

/** Nombre maximal de clés USB par commande (une famille, un cadeau). */
export const MAX_KEY_QUANTITY = 5;

export type ShippingInput = z.infer<typeof shippingSchema>;
