/**
 * Typographie française : espaces insécables avant « : ; ! ? » et « % »,
 * à l'intérieur des guillemets « », et dans les nombres (« 12 000 F »).
 * Évite qu'un « ? » ou un « F » se retrouve seul en début de ligne.
 *
 * Les contenus du catalogue sont écrits avec des espaces ordinaires (plus
 * lisibles dans le code) et passés dans `deepFr` une seule fois au chargement.
 */
const NBSP = "\u00A0";

export function fr(text: string): string {
  return text
    .replace(/ ([:;!?»%])/g, `${NBSP}$1`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/(\p{L})'(\p{L})/gu, "$1\u2019$2")
    .replace(/(\d) (\d{3})(?!\d)/g, `$1${NBSP}$2`)
    .replace(
      /(\d) (F CFA|F\b|Go\b|Mo\b|Ko\b|min\b|h\b|jours?\b|ans\b|vidéos?\b|modules?\b|logiciels\b|diapositives\b)/g,
      `$1${NBSP}$2`,
    )
    .replace(/F CFA/g, `F${NBSP}CFA`);
}

/** Applique `fr` à toutes les chaînes d'une structure (objets, tableaux). */
export function deepFr<T>(value: T): T {
  if (typeof value === "string") return fr(value) as T;
  if (Array.isArray(value)) return value.map((item) => deepFr(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        // Les identifiants techniques (slug, src, href…) ne sont jamais retouchés.
        [
          "slug",
          "src",
          "href",
          "tone",
          "kind",
          "icon",
          "family",
          "delivery",
          "priceType",
        ].includes(key)
          ? item
          : deepFr(item),
      ]),
    ) as T;
  }
  return value;
}
