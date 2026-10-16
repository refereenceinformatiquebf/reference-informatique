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
const PACK_ACTIVATION_SLUG = "pack-activation-windows11et10-et-office365-a-vie";

export const ROOT_PATH_PRODUCT_SLUGS: ReadonlySet<string> = new Set([
  PACK_ACTIVATION_SLUG,
]);

/**
 * Anciennes écritures de l'adresse d'un produit (en minuscules, décodées) →
 * slug actuel. Elles ont pu être partagées ou indexées : elles redirigent vers
 * la fiche, jamais en 404. Une Map (et non un objet) : « constructor » ne doit
 * pas passer pour un alias.
 */
const PRODUCT_SLUG_ALIASES: ReadonlyMap<string, string> = new Map([
  ["licence-expert-office-365-windows-11", PACK_ACTIVATION_SLUG],
  ["activation-windows11et10-et-office365-a-vie", PACK_ACTIVATION_SLUG],
  // Écrite avec « & » : valide en théorie, mais il casse les liens partagés
  // (WhatsApp, e-mail) et le plan du site XML — l'adresse officielle dit « et ».
  ["pack-activation-windows11&10-et-office365-a-vie", PACK_ACTIVATION_SLUG],
]);

export function productPath(slug: string): string {
  return ROOT_PATH_PRODUCT_SLUGS.has(slug) ? `/${slug}` : `/boutique/${slug}`;
}

/**
 * Adresse vers laquelle renvoyer `pathname` (/<slug>, /boutique/<slug> ou
 * /commande/<slug>) quand elle n'est pas écrite telle qu'elle doit l'être —
 * ancien slug, autre casse, « & » —, ou null s'il n'y a rien à faire.
 *
 * Fait dans proxy.ts et non dans next.config (redirects) : celui-ci compare
 * sans tenir compte de la casse, et renverrait l'adresse correcte sur
 * elle-même en boucle.
 */
export function canonicalProductRedirect(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname).toLowerCase();
  } catch {
    return null;
  }
  for (const prefix of ["", "/boutique", "/commande"]) {
    if (!decoded.startsWith(`${prefix}/`)) continue;
    const key = decoded.slice(prefix.length + 1);
    const slug =
      PRODUCT_SLUG_ALIASES.get(key) ??
      (ROOT_PATH_PRODUCT_SLUGS.has(key) ? key : undefined);
    if (!slug) continue;
    const target =
      prefix === "/commande" ? `/commande/${slug}` : productPath(slug);
    if (target !== pathname) return target;
  }
  return null;
}
