import { discountPercent } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";

/**
 * « Recommandé pour vous » : ce que le client ne possède pas encore, classé
 * sans aucune donnée personnelle autre que ses achats.
 *
 *  - jamais un produit déjà acheté ;
 *  - on privilégie la famille déjà achetée (qui a pris un livre aime les
 *    livres), puis les produits mis en avant (badge) ou en promotion ;
 *  - l'acheteur d'une clé reçoit en priorité autre chose qu'une seconde clé :
 *    sa clé contient déjà de quoi apprendre ;
 *  - à égalité, l'ordre du catalogue décide (le classement voulu par l'équipe).
 *
 * Les produits proposés doivent déjà être filtrés par pays (voir
 * getVisibleProducts) : une offre réservée à un pays n'est jamais suggérée aux
 * autres.
 */
export function rankRecommendations(
  owned: Product[],
  candidates: Product[],
  limit = 3,
): Product[] {
  const ownedSlugs = new Set(owned.map((product) => product.slug));
  const ownedKinds = new Set(owned.map((product) => product.kind));
  const ownsKey = ownedKinds.has("cle");

  const score = (product: Product) => {
    let value = 0;
    if (product.kind !== "cle" && ownedKinds.has(product.kind)) value += 2;
    if (product.badge) value += 1;
    if (discountPercent(product)) value += 1;
    if (ownsKey && product.kind === "cle") value -= 5;
    return value;
  };

  return candidates
    .filter((product) => !ownedSlugs.has(product.slug))
    .map((product) => ({ product, score: score(product) }))
    .sort((a, b) => b.score - a.score || a.product.order - b.product.order)
    .slice(0, limit)
    .map(({ product }) => product);
}
