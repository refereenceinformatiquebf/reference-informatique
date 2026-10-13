import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { deepFr } from "@/lib/typography";
import { ALL_PRODUCTS, ALL_SERVICES, isProductAvailable } from "./index";
import { productContentSchema } from "./schema";
import type {
  CountryCode,
  Product,
  ProductKind,
  Service,
  ServiceFamilySlug,
} from "./types";

/**
 * Catalogue « vivant » : le code (lib/catalog/*) donne la base, la base de
 * données donne ce que l'équipe a modifié depuis l'administration.
 *
 * Règle de priorité, simple et sans surprise :
 *  - tant que l'équipe n'a JAMAIS enregistré un produit (adminEditedAt vide),
 *    le code fait foi — une correction de texte ou de prix dans le code
 *    continue donc de s'appliquer ;
 *  - dès qu'elle l'enregistre, la base fait foi pour ce produit.
 *  - un produit créé depuis l'administration (source ADMIN) n'existe qu'en base.
 *
 * Si la base est injoignable, on retombe sur le code : le site reste
 * consultable. Les lectures sont mises en cache 60 s et invalidées à chaque
 * enregistrement de l'administration (étiquette « catalog »).
 */

export const CATALOG_TAG = "catalog";

/* ------------------------------ Tarification ----------------------------- */

export type ResolvedPricing = {
  price: number;
  compareAtPrice?: number;
  promoEndsAt?: Date;
  promoActive: boolean;
};

/**
 * Prix effectivement demandé au client à un instant donné.
 *  - prix barré + fin d'offre dépassée : l'offre est terminée, le prix revient
 *    au prix normal (l'ancien prix) et plus aucune remise n'est affichée ;
 *  - prix barré sans fin d'offre : remise permanente, affichée telle quelle ;
 *  - pas de prix barré : prix simple.
 */
export function resolvePricing(
  price: number,
  compareAtPrice: number | null | undefined,
  promoEndsAt: Date | string | null | undefined,
  now: Date = new Date(),
): ResolvedPricing {
  const ends = promoEndsAt ? new Date(promoEndsAt) : null;
  if (compareAtPrice && compareAtPrice > price) {
    if (ends && ends.getTime() <= now.getTime()) {
      return { price: compareAtPrice, promoActive: false };
    }
    return {
      price,
      compareAtPrice,
      promoEndsAt: ends ?? undefined,
      promoActive: true,
    };
  }
  return { price, promoActive: false };
}

/* ------------------------------- Produits -------------------------------- */

export type ProductRowRaw = {
  slug: string;
  name: string;
  source: string;
  price: number;
  compareAtPrice: number | null;
  active: boolean;
  badge: string | null;
  promoEndsAt: string | null;
  content: unknown;
  posterUrl: string | null;
  displayOrder: number;
  adminEditedAt: string | null;
};

const fetchProductRows = unstable_cache(
  async (): Promise<ProductRowRaw[]> => {
    const rows = await prisma.product.findMany({
      select: {
        slug: true,
        name: true,
        source: true,
        price: true,
        compareAtPrice: true,
        active: true,
        badge: true,
        promoEndsAt: true,
        content: true,
        posterUrl: true,
        displayOrder: true,
        adminEditedAt: true,
      },
    });
    return rows.map((row) => ({
      ...row,
      promoEndsAt: row.promoEndsAt?.toISOString() ?? null,
      adminEditedAt: row.adminEditedAt?.toISOString() ?? null,
    }));
  },
  ["catalog-product-rows-v1"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

async function loadProductRows(): Promise<ProductRowRaw[]> {
  // Tests unitaires : pas de base, le catalogue du code suffit.
  if (process.env.CATALOG_SKIP_DB === "1") return [];
  try {
    return await fetchProductRows();
  } catch (error) {
    console.error("[catalog] lecture des produits en base impossible :", error);
    return [];
  }
}

/** Produit construit à partir du contenu stocké en base, ou null si invalide. */
function buildFromContent(
  slug: string,
  row: ProductRowRaw,
  fallbackAlt: string,
): Product | null {
  const parsed = productContentSchema.safeParse(row.content);
  if (!parsed.success) return null;
  const content = deepFr(parsed.data);
  const pricing = resolvePricing(
    row.price,
    row.compareAtPrice,
    row.promoEndsAt,
  );
  return {
    ...content,
    slug,
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    promoEndsAt: pricing.promoEndsAt?.toISOString(),
    badge: row.badge ?? undefined,
    poster: row.posterUrl
      ? { src: row.posterUrl, alt: content.poster?.alt ?? fallbackAlt }
      : content.poster,
    order: row.displayOrder,
  };
}

/** Fusionne un produit du code avec sa ligne de base (si l'équipe l'a modifié). */
export function mergeProduct(base: Product, row: ProductRowRaw): Product {
  if (!row.adminEditedAt) return base;

  const fromContent = row.content
    ? buildFromContent(base.slug, row, base.poster?.alt ?? base.name)
    : null;
  if (fromContent) return fromContent;

  // Pas de contenu édité (ou contenu invalide) : seul le commercial change.
  const pricing = resolvePricing(
    row.price,
    row.compareAtPrice,
    row.promoEndsAt,
  );
  return {
    ...base,
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    promoEndsAt: pricing.promoEndsAt?.toISOString(),
    badge: row.badge ?? undefined,
    poster: row.posterUrl
      ? { src: row.posterUrl, alt: base.poster?.alt ?? base.name }
      : base.poster,
    order: row.displayOrder,
  };
}

/** Tous les produits ACTIFS, triés. Aucun contrôle de pays ici. */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const rows = await loadProductRows();
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const result: Product[] = [];

  for (const base of ALL_PRODUCTS) {
    const row = bySlug.get(base.slug);
    if (row && !row.active) continue;
    result.push(row ? mergeProduct(base, row) : base);
  }

  const baseSlugs = new Set(ALL_PRODUCTS.map((product) => product.slug));
  for (const row of rows) {
    if (row.source !== "ADMIN" || !row.active || baseSlugs.has(row.slug)) {
      continue;
    }
    const product = buildFromContent(row.slug, row, row.name);
    if (product) result.push(product);
    else
      console.error(
        `[catalog] contenu invalide pour le produit créé en administration « ${row.slug} » : ignoré.`,
      );
  }

  return result.sort((a, b) => a.order - b.order);
});

/** Un produit par son slug, SANS contrôle de pays — pour les traitements
 * serveur qui font eux-mêmes ce contrôle (commande, webhook). */
export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getAllProducts()).find((product) => product.slug === slug);
}

/** Produits visibles par un visiteur de ce pays. */
export async function getVisibleProducts(
  country: CountryCode | null,
): Promise<Product[]> {
  return (await getAllProducts()).filter((product) =>
    isProductAvailable(product, country),
  );
}

/** Un produit seulement s'il est visible depuis ce pays. */
export async function getVisibleProduct(
  slug: string,
  country: CountryCode | null,
): Promise<Product | undefined> {
  const product = await getProduct(slug);
  return product && isProductAvailable(product, country) ? product : undefined;
}

export async function getProductsByKind(
  country: CountryCode | null,
  kind: ProductKind,
): Promise<Product[]> {
  return (await getVisibleProducts(country)).filter(
    (product) => product.kind === kind,
  );
}

/** Produits de la même famille (puis les mieux classés). */
export async function getRelatedProducts(
  product: Product,
  country: CountryCode | null,
  limit = 3,
): Promise<Product[]> {
  const others = (await getVisibleProducts(country)).filter(
    (candidate) => candidate.slug !== product.slug,
  );
  const sameKind = others.filter(
    (candidate) => candidate.kind === product.kind,
  );
  const rest = others.filter((candidate) => candidate.kind !== product.kind);
  return [...sameKind, ...rest].slice(0, limit);
}

/* -------------------------------- Services -------------------------------- */

type ServiceRowRaw = {
  slug: string;
  name: string;
  description: string;
  priceType: "FIXED" | "FROM" | "QUOTE";
  priceFrom: number | null;
  active: boolean;
  displayOrder: number;
  tagline: string | null;
  priceNote: string | null;
  timeline: string | null;
  adminEditedAt: string | null;
};

const fetchServiceRows = unstable_cache(
  async (): Promise<ServiceRowRaw[]> => {
    const rows = await prisma.service.findMany({
      select: {
        slug: true,
        name: true,
        description: true,
        priceType: true,
        priceFrom: true,
        active: true,
        displayOrder: true,
        tagline: true,
        priceNote: true,
        timeline: true,
        adminEditedAt: true,
      },
    });
    return rows.map((row) => ({
      ...row,
      adminEditedAt: row.adminEditedAt?.toISOString() ?? null,
    }));
  },
  ["catalog-service-rows-v1"],
  { tags: [CATALOG_TAG], revalidate: 60 },
);

async function loadServiceRows(): Promise<ServiceRowRaw[]> {
  if (process.env.CATALOG_SKIP_DB === "1") return [];
  try {
    return await fetchServiceRows();
  } catch (error) {
    console.error("[catalog] lecture des services en base impossible :", error);
    return [];
  }
}

export function mergeService(base: Service, row: ServiceRowRaw): Service {
  if (!row.adminEditedAt) return base;
  return deepFr({
    ...base,
    name: row.name,
    summary: row.description,
    priceType: row.priceType,
    priceFrom: row.priceFrom ?? undefined,
    tagline: row.tagline ?? base.tagline,
    priceNote: row.priceNote ?? base.priceNote,
    timeline: row.timeline ?? base.timeline,
    order: row.displayOrder,
  });
}

/** Tous les services ACTIFS, triés. */
export const getAllServices = cache(async (): Promise<Service[]> => {
  const rows = await loadServiceRows();
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const result: Service[] = [];
  for (const base of ALL_SERVICES) {
    const row = bySlug.get(base.slug);
    if (row && !row.active) continue;
    result.push(row ? mergeService(base, row) : base);
  }
  return result.sort((a, b) => a.order - b.order);
});

export async function getService(slug: string): Promise<Service | undefined> {
  return (await getAllServices()).find((service) => service.slug === slug);
}

export async function getServicesOfFamily(
  family: ServiceFamilySlug,
): Promise<Service[]> {
  return (await getAllServices()).filter(
    (service) => service.family === family,
  );
}
