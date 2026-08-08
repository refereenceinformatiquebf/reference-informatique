/** Formate un montant en F CFA — jamais de décimales sur cette devise. */
export function formatPrice(amount: number) {
  return `${amount.toLocaleString("fr-FR")} F`;
}

type PriceableService = {
  priceType: "FIXED" | "FROM" | "QUOTE";
  priceFrom: number | null;
};

/** Traduit le prix d'un Service selon son PriceType — jamais un prix
 * affiché sans son contexte (voir PLAYBOOK-CONSTRUCTION.md, Étape 6). */
export function formatServicePrice(service: PriceableService) {
  if (service.priceType === "QUOTE" || service.priceFrom === null) {
    return "Sur devis";
  }
  if (service.priceType === "FROM") {
    return `À partir de ${formatPrice(service.priceFrom)}`;
  }
  return formatPrice(service.priceFrom);
}
