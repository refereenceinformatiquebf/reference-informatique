/**
 * Faits d'identité du site — une seule source pour le nom, l'adresse, les
 * numéros de contact. Toute page ou tout email qui a besoin d'un de ces
 * éléments le lit ici, jamais en dur.
 */

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22675789737";

export const SITE = {
  name: "Référence Informatique",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Création de sites web, agents IA, automatisation et maintenance informatique. Formations et ressources numériques. Burkina Faso.",
  /** Numéro WhatsApp, sans « + » (format wa.me). */
  whatsapp: whatsappNumber,
  phoneInternational: `+${whatsappNumber}`,
  /** Même numéro, lisible : +226 75 78 97 37. */
  phoneDisplay: `+${whatsappNumber.replace(
    /^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    "$1\u00A0$2\u00A0$3\u00A0$4\u00A0$5",
  )}`,
  /** Pays où les clés de formations (livraison physique) sont proposées. */
  homeCountry: "BF",
} as const;

/** Lien WhatsApp avec message prérempli. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
