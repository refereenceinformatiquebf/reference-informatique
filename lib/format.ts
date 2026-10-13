const NBSP = "\u00A0";

/** Formate un montant en F CFA — jamais de décimales sur cette devise.
 * Espaces insécables : « 12 000 F CFA » ne se coupe jamais en fin de ligne. */
export function formatPrice(amount: number) {
  return `${amount.toLocaleString("fr-FR")}${NBSP}F${NBSP}CFA`;
}

type PriceableService = {
  priceType: "FIXED" | "FROM" | "QUOTE";
  priceFrom?: number | null;
};

/** Traduit le prix d'un service selon son type — jamais un prix affiché sans
 * son contexte. */
export function formatServicePrice(service: PriceableService) {
  if (service.priceType === "QUOTE" || !service.priceFrom) {
    return "Sur devis";
  }
  if (service.priceType === "FROM") {
    return `À partir de${NBSP}${formatPrice(service.priceFrom)}`;
  }
  return formatPrice(service.priceFrom);
}
