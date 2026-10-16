/**
 * Adresse publique de la fiche d'un produit.
 *
 * Par défaut, une fiche vit sous /boutique/<slug>. Quelques produits phares ont
 * une adresse courte à la racine du site (reference-informatique.com/<slug>),
 * pensée pour être lue, partagée et référencée. Chacun a alors sa propre page
 * dans app/<slug>/page.tsx ; /boutique/<slug> redirige vers elle.
 *
 * Toute construction d'un lien vers une fiche passe par `productPath` : ne
 * jamais écrire `/boutique/${slug}` à la main.
 */
export const ROOT_PATH_PRODUCT_SLUGS: ReadonlySet<string> = new Set([
  "activation-windows11et10-et-office365-a-vie",
]);

export function productPath(slug: string): string {
  return ROOT_PATH_PRODUCT_SLUGS.has(slug) ? `/${slug}` : `/boutique/${slug}`;
}
