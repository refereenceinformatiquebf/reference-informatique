/** Navigation principale. Aucune entrée ne mentionne une offre réservée à un
 * pays (les clés de formations) : l'en-tête est identique pour tous. */
export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/services", label: "Services" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;
