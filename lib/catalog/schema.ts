import { z } from "zod";
import {
  COVER_TONES,
  DELIVERY_MODES,
  ICON_KEYS,
  PRODUCT_KIND_VALUES,
} from "./types";

/**
 * Validation du contenu éditorial d'un produit (tout sauf ce qui est
 * commercial : prix, promotion, activation, ordre — ceux-là vivent dans des
 * colonnes dédiées de la table `products`).
 *
 * Même forme que `Product` (lib/catalog/types.ts). Sert à deux endroits :
 *  - l'éditeur de produit de l'administration (validation avant enregistrement) ;
 *  - la lecture du catalogue (un contenu invalide en base est ignoré et le
 *    contenu du code reprend la main, plutôt que de casser la page).
 */

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: "Ce champ est obligatoire." })
    .max(max, { error: `${max} caractères maximum.` });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `${max} caractères maximum.` })
    .optional()
    .transform((value) => (value ? value : undefined));

export const productContentSchema = z.object({
  name: text(140),
  tagline: text(240),
  summary: text(200),
  kind: z.enum(PRODUCT_KIND_VALUES),
  delivery: z.enum(DELIVERY_MODES),
  /** Codes pays ISO (2 lettres). Vide = visible et achetable partout. */
  restrictedTo: z
    .array(
      z
        .string()
        .trim()
        .regex(/^[A-Za-z]{2}$/, { error: "Code pays à 2 lettres." }),
    )
    .max(10)
    .optional()
    .transform((codes) =>
      codes && codes.length > 0
        ? codes.map((code) => code.toUpperCase())
        : undefined,
    ),
  poster: z.object({ src: text(500), alt: text(200) }).optional(),
  cover: z.object({
    tone: z.enum(COVER_TONES),
    motif: z.enum(ICON_KEYS),
  }),
  facts: z.array(z.object({ icon: z.enum(ICON_KEYS), label: text(60) })).max(6),
  story: z
    .array(text(2000))
    .min(1, { error: "Au moins un paragraphe." })
    .max(10),
  highlights: z
    .array(text(240))
    .min(1, { error: "Au moins un point." })
    .max(24),
  contents: z
    .array(
      z.object({
        title: text(120),
        items: z
          .array(z.object({ name: text(160), detail: optionalText(240) }))
          .min(1)
          .max(60),
      }),
    )
    .max(20)
    .optional()
    .transform((groups) => (groups && groups.length > 0 ? groups : undefined)),
  forWho: z.array(text(240)).min(1, { error: "Au moins une ligne." }).max(12),
  notForWho: z
    .array(text(240))
    .max(12)
    .optional()
    .transform((lines) => (lines && lines.length > 0 ? lines : undefined)),
  faq: z.array(z.object({ question: text(240), answer: text(1500) })).max(20),
  testimonial: z
    .object({
      quote: text(600),
      author: text(80),
      city: optionalText(80),
    })
    .optional(),
  seo: z.object({
    title: text(90),
    description: text(200),
  }),
});

export type ProductContent = z.infer<typeof productContentSchema>;

/** Slug : minuscules, chiffres, tirets. Réservés : jamais un mot du site. */
export const RESERVED_PRODUCT_SLUGS = new Set([
  "admin",
  "api",
  "nouveau",
  "tout",
  "panier",
]);

export const productSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { error: "3 caractères minimum." })
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    error: "Lettres minuscules, chiffres et tirets uniquement.",
  })
  .refine((slug) => !RESERVED_PRODUCT_SLUGS.has(slug), {
    error: "Ce nom d'adresse est réservé.",
  });

/** Champs commerciaux d'un produit (colonnes de la table `products`). */
export const productCommercialSchema = z
  .object({
    price: z.coerce
      .number()
      .int({ error: "Un prix en F CFA est un nombre entier." })
      .min(100, { error: "Prix minimum : 100 F CFA." })
      .max(10_000_000),
    compareAtPrice: z
      .union([z.literal(""), z.coerce.number().int().min(100).max(10_000_000)])
      .optional()
      .transform((value) =>
        value === "" || value === undefined ? null : value,
      ),
    promoEndsAt: z
      .union([z.literal(""), z.string()])
      .optional()
      .transform((value) => (value ? new Date(value) : null))
      .refine((date) => date === null || !Number.isNaN(date.getTime()), {
        error: "Date de fin d'offre invalide.",
      }),
    badge: z
      .string()
      .trim()
      .max(40, { error: "40 caractères maximum." })
      .optional()
      .transform((value) => (value ? value : null)),
    active: z.boolean(),
    displayOrder: z.coerce.number().int().min(0).max(10_000),
  })
  .refine(
    (value) =>
      value.compareAtPrice === null || value.compareAtPrice > value.price,
    {
      error: "Le prix barré doit être supérieur au prix de vente.",
      path: ["compareAtPrice"],
    },
  );

export type ProductCommercial = z.infer<typeof productCommercialSchema>;
