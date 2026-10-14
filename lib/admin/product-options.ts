import type { AdminProductEntry } from "@/lib/catalog/live";

/** Produits sous forme d'options de liste déroulante ; un produit masqué est signalé. */
export function optionsFrom(entries: AdminProductEntry[]) {
  return entries.map(({ product, active }) => ({
    slug: product.slug,
    name: active ? product.name : `${product.name} (masqué)`,
  }));
}
