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

const SITE_TZ = "Africa/Ouagadougou";

/** « 14 octobre 2026 » */
export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SITE_TZ,
  });
}

/** « 14 oct. 2026, 09:30 » (heure du Burkina Faso, qui est aussi l'heure UTC). */
export function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: SITE_TZ,
  });
}

/** « il y a 5 min », « il y a 3 h », « il y a 2 j ». */
export function timeAgo(value: Date | string, now: Date = new Date()) {
  const minutes = Math.max(
    0,
    Math.round((now.getTime() - new Date(value).getTime()) / 60_000),
  );
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 1440) return `il y a ${Math.round(minutes / 60)} h`;
  return `il y a ${Math.round(minutes / 1440)} j`;
}
