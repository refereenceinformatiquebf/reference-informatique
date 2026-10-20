/**
 * Décision pure (sans base de données) : à quelle commande payée rattacher la
 * licence d'un client dont l'accès n'en a pas encore.
 */
export type StockedLicence = { licenseKey: string; installerUrl: string };

export type PaidOrderForLicence = {
  id: string;
  /** Licence déjà prélevée dans le stock pour cette commande, s'il y en a une. */
  stock: StockedLicence | null;
};

export type FulfilmentPlan =
  | { kind: "none" }
  /** Une licence a déjà été prélevée pour une de ses commandes : on la lui remet, sans en consommer une autre. */
  | { kind: "reuse"; licence: StockedLicence }
  /** Aucune licence prélevée : on en prélève une pour cette commande. */
  | { kind: "claim"; orderId: string };

/**
 * `orders` : les commandes PAYÉES du client pour ce produit, de la plus
 * ancienne à la plus récente. Sans commande payée, il n'y a rien à livrer : un
 * accès accordé à la main (sans paiement) ne consomme jamais le stock.
 */
export function chooseFulfilmentOrder(
  orders: PaidOrderForLicence[],
): FulfilmentPlan {
  const alreadyStocked = orders.find((order) => order.stock !== null);
  if (alreadyStocked?.stock) {
    return { kind: "reuse", licence: alreadyStocked.stock };
  }
  const first = orders[0];
  return first ? { kind: "claim", orderId: first.id } : { kind: "none" };
}
