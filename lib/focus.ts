import { ROOT_PATH_PRODUCT_SLUGS } from "@/lib/catalog/paths";

/**
 * Pages « sans distraction » : l'en-tête n'a plus de liens, le bandeau
 * d'annonce et le pied de page disparaissent. Le client ne doit voir
 * que la décision d'achat — pas une porte de sortie.
 *
 *  - les pages de vente à adresse courte (voir lib/catalog/paths.ts) ;
 *  - le formulaire de commande /commande/<produit>.
 *
 * Après le paiement, /commande/retour et /commande/suivi retrouvent la
 * navigation normale : le client y a besoin d'aller vers son espace.
 */
const CHECKOUT_FOLLOW_UP = new Set(["retour", "suivi"]);

export function isFocusPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (ROOT_PATH_PRODUCT_SLUGS.has(clean.slice(1))) return true;
  const checkout = /^\/commande\/([^/]+)$/.exec(clean);
  return checkout !== null && !CHECKOUT_FOLLOW_UP.has(checkout[1]);
}
