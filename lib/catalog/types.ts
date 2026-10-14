/**
 * Typage du catalogue de la boutique et des services.
 *
 * Le catalogue vit dans le code (lib/catalog/*) plutôt qu'en base : ce sont
 * des contenus éditoriaux qui changent rarement, qu'on veut versionnés,
 * relus en revue de code et servis même si la base est injoignable. La base
 * ne garde que ce qui doit exister pour les commandes (Product, Service) ;
 * elles sont créées à la demande depuis ce catalogue (voir
 * lib/catalog/db-sync.ts), qui reste la source de vérité des prix.
 */

/** Code pays ISO 3166-1 alpha-2 (« BF » = Burkina Faso). */
export type CountryCode = string;

export const ICON_KEYS = [
  "cle-usb",
  "formation",
  "ebook",
  "pack",
  "logiciel",
  "modele",
  "outil",
  "service",
  "code",
  "agent-ia",
  "automatisation",
  "maintenance",
  "livraison",
  "paiement",
  "bouclier",
  "acces-a-vie",
  "hors-ligne",
  "support",
  "certificat",
  "verifie",
  "actualisation",
  "horloge",
  "eclair",
  "ordinateur",
  "plateforme",
  "telecharger",
  "globe",
  "lieu",
  "whatsapp",
  "cadeau",
  "devis",
  "video",
  "pdf",
  "panier",
  "utilisateur",
  "recherche",
  "mail",
  "telephone",
  "etoile",
  "cadenas",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

/** Famille de produits de la boutique. */
export const PRODUCT_KIND_VALUES = [
  "cle",
  "formation",
  "ebook",
  "pack",
  "modele",
  "outil",
] as const;
export type ProductKind = (typeof PRODUCT_KIND_VALUES)[number];

/** Teinte de la couverture générée (toutes issues de l'échelle bleue de la charte). */
export const COVER_TONES = ["navy", "blue", "deep", "sky"] as const;
export type CoverTone = (typeof COVER_TONES)[number];

/** Comment le client reçoit son achat. */
export const DELIVERY_MODES = [
  "cle-physique",
  "numerique",
  "manuel",
  "licence-edn",
] as const;
/**
 * - cle-physique : clé USB livrée chez le client + accès plateforme
 * - numerique    : accès par l'espace client (guide PDF, liens, fichiers)
 * - manuel       : l'équipe contacte le client sur WhatsApp après paiement
 * - licence-edn  : licence d'activation récupérée automatiquement auprès d'un fournisseur externe
 *                  (voir lib/licences/) — clé + application d'activation, pas de leçon à suivre
 */
export type DeliveryMode = (typeof DELIVERY_MODES)[number];

export type ProductContentGroup = {
  title: string;
  items: { name: string; detail?: string }[];
};

export type Faq = { question: string; answer: string };

export type Testimonial = {
  quote: string;
  author: string;
  city?: string;
};

export type Product = {
  slug: string;
  name: string;
  /** Une phrase de promesse, affichée sous le titre de la fiche. */
  tagline: string;
  /** Texte de la carte produit (≈ 130 caractères max). */
  summary: string;
  kind: ProductKind;
  /** F CFA, entier. */
  price: number;
  compareAtPrice?: number;
  /** Fin de l'offre (ISO). Passé cette date, le prix revient au prix barré. */
  promoEndsAt?: string;
  /** Mention courte et vraie (« Offre la plus complète »). */
  badge?: string;
  /** Affiche réelle du produit (fichier dans /public). Sans affiche, la
   * couverture générée à la charte prend le relais. */
  poster?: { src: string; alt: string };
  cover: { tone: CoverTone; motif: IconKey };
  /** Pays autorisés. Absent = visible et achetable partout. */
  restrictedTo?: readonly CountryCode[];
  delivery: DeliveryMode;
  /** Pastilles d'information rapide (3 à 4). */
  facts: { icon: IconKey; label: string }[];
  /** Le récit de la fiche : problème, promesse, façon de faire. */
  story: string[];
  /** « Ce que vous obtenez ». */
  highlights: string[];
  /** Contenu détaillé, regroupé par thème. */
  contents?: ProductContentGroup[];
  forWho: string[];
  /** Honnêteté : à qui ce produit ne convient pas. */
  notForWho?: string[];
  faq: Faq[];
  testimonial?: Testimonial;
  seo: { title: string; description: string };
  order: number;
};

/* ------------------------------- Services ------------------------------- */

export type ServiceFamilySlug =
  "conception-web" | "agents-ia" | "logiciels-automatisation" | "maintenance";

export type PriceType = "FIXED" | "FROM" | "QUOTE";

export type ServiceFamily = {
  slug: ServiceFamilySlug;
  name: string;
  icon: IconKey;
  /** Promesse en une phrase. */
  tagline: string;
  /** Présentation de la famille (paragraphes). */
  intro: string[];
  /** Pour qui, en puces. */
  forWho: string[];
  order: number;
  seo: { title: string; description: string };
};

export type Service = {
  slug: string;
  family: ServiceFamilySlug;
  name: string;
  /** Promesse en une phrase. */
  tagline: string;
  /** Texte de la carte (≈ 150 caractères). */
  summary: string;
  priceType: PriceType;
  priceFrom?: number;
  /** Ce que couvre le prix, ou comment il est établi. */
  priceNote: string;
  /** « Vous vous reconnaissez ? » — la situation du client, dans ses mots. */
  problem: { title: string; points: string[] };
  /** Ce qu'on livre concrètement. */
  deliverables: { title: string; text: string }[];
  /** Comment ça se passe, étape par étape. */
  process: { title: string; text: string }[];
  forWho: string[];
  /** Délai indicatif, formulé sans promesse ferme. */
  timeline: string;
  /** Les objections réelles et leurs réponses. */
  faq: Faq[];
  seo: { title: string; description: string };
  order: number;
};
