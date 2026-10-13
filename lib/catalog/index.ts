import { deepFr } from "@/lib/typography";
import { KEYS } from "./keys";
import { PRODUCTS } from "./products";
import { SERVICES, SERVICE_FAMILIES } from "./services";
import type {
  CountryCode,
  Product,
  ProductKind,
  Service,
  ServiceFamily,
  ServiceFamilySlug,
} from "./types";

export * from "./types";
export { PRODUCT_KINDS, PRODUCT_KIND_ORDER } from "./kinds";

/**
 * Point d'entrée UNIQUE du catalogue. Les contenus sont passés dans la
 * typographie française (espaces insécables) une seule fois au chargement.
 *
 * Règle d'accès par pays (voir lib/geo.ts) : un produit avec `restrictedTo`
 * n'est visible, listable et achetable que depuis ces pays. Toute page, tout
 * plan de site et toute action de commande doivent passer par
 * `isProductAvailable` — jamais lire `ALL_PRODUCTS` directement pour
 * l'afficher à un visiteur.
 */

export const ALL_PRODUCTS: Product[] = deepFr([...KEYS, ...PRODUCTS]).sort(
  (a, b) => a.order - b.order,
);

export const ALL_SERVICES: Service[] = deepFr(SERVICES).sort(
  (a, b) => a.order - b.order,
);

export const ALL_SERVICE_FAMILIES: ServiceFamily[] = deepFr(
  SERVICE_FAMILIES,
).sort((a, b) => a.order - b.order);

/** Un produit est-il accessible à un visiteur de ce pays ? Échec fermé :
 * un pays inconnu (`null`) n'accède pas aux produits restreints. */
export function isProductAvailable(
  product: Pick<Product, "restrictedTo">,
  country: CountryCode | null,
) {
  if (!product.restrictedTo || product.restrictedTo.length === 0) return true;
  return country !== null && product.restrictedTo.includes(country);
}

/** Produits visibles par un visiteur de ce pays. */
export function visibleProducts(country: CountryCode | null): Product[] {
  return ALL_PRODUCTS.filter((product) => isProductAvailable(product, country));
}

/** Un produit par son slug, SANS contrôle de pays — à réserver aux
 * traitements serveur qui font eux-mêmes le contrôle (commande, webhook). */
export function findProduct(slug: string): Product | undefined {
  return ALL_PRODUCTS.find((product) => product.slug === slug);
}

/** Un produit par son slug, seulement s'il est visible depuis ce pays. */
export function findVisibleProduct(
  slug: string,
  country: CountryCode | null,
): Product | undefined {
  const product = findProduct(slug);
  return product && isProductAvailable(product, country) ? product : undefined;
}

/** Produits de la même famille (puis les mieux classés), pour « Vous aimerez aussi ». */
export function relatedProducts(
  product: Product,
  country: CountryCode | null,
  limit = 3,
): Product[] {
  const others = visibleProducts(country).filter(
    (p) => p.slug !== product.slug,
  );
  const sameKind = others.filter((p) => p.kind === product.kind);
  const rest = others.filter((p) => p.kind !== product.kind);
  return [...sameKind, ...rest].slice(0, limit);
}

export function productsByKind(
  country: CountryCode | null,
  kind: ProductKind,
): Product[] {
  return visibleProducts(country).filter((product) => product.kind === kind);
}

export function findService(slug: string): Service | undefined {
  return ALL_SERVICES.find((service) => service.slug === slug);
}

export function findFamily(slug: string): ServiceFamily | undefined {
  return ALL_SERVICE_FAMILIES.find((family) => family.slug === slug);
}

export function servicesOfFamily(family: ServiceFamilySlug): Service[] {
  return ALL_SERVICES.filter((service) => service.family === family);
}

/** Réduction affichée, en pourcentage entier, ou null s'il n'y en a pas. */
export function discountPercent(
  product: Pick<Product, "price" | "compareAtPrice">,
) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) {
    return null;
  }
  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}
