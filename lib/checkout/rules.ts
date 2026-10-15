/**
 * Règles pures de la commande sans compte (sans base de données, donc
 * testables seules). Voir aussi lib/checkout/access.ts et buyer.ts.
 */

import type { DeliveryMode } from "@/lib/catalog/types";

/** Durée pendant laquelle le lien personnel d'une commande ouvre l'achat. Au-delà,
 * le client demande un nouveau lien : un email ancien oublié dans une boîte ne
 * donne pas accès indéfiniment. */
export const ACCESS_LINK_TTL_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Forme d'un jeton d'accès (32 octets en base64url). Refuse tout le reste avant
 * même d'interroger la base. */
export function isAccessTokenShape(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

/** Identifiant de commande (UUID) : évite qu'une valeur quelconque dans
 * l'adresse fasse échouer la requête SQL. */
export function isOrderIdShape(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

/** Le lien personnel a-t-il dépassé sa durée de validité ? Compté depuis le
 * paiement (ou, à défaut, la création de la commande). */
export function accessLinkExpired(
  order: { paidAt: Date | null; createdAt: Date },
  now: Date = new Date(),
) {
  const from = (order.paidAt ?? order.createdAt).getTime();
  return now.getTime() - from > ACCESS_LINK_TTL_DAYS * DAY_MS;
}

/** Où le client arrive après avoir cliqué « Accéder à mon achat ». */
export function accessDestination(
  delivery: DeliveryMode | undefined,
  productSlug: string | undefined,
) {
  if (!productSlug) return "/espace-client";
  if (delivery === "numerique")
    return `/espace-client/formations/${productSlug}`;
  if (delivery === "licence-edn")
    return `/espace-client/licences/${productSlug}`;
  // Une clé se livre : il n'y a rien à ouvrir en ligne, le client retrouve sa
  // commande (état de la livraison) et nos recommandations.
  if (delivery === "cle-physique") return "/espace-client?onglet=commandes";
  return "/espace-client";
}

/** Un téléphone est indispensable quand l'équipe doit joindre le client
 * (livraison d'une clé, remise manuelle) ; il reste facultatif pour un accès
 * 100 % automatique. */
export function phoneRequired(delivery: DeliveryMode | undefined) {
  return delivery !== "numerique" && delivery !== "licence-edn";
}

/* --------------------------- Aides à la saisie --------------------------- */

const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outlook.con": "outlook.com",
  "icloud.con": "icloud.com",
  "iclod.com": "icloud.com",
};

/** Une faute de frappe courante dans le domaine (« gmial.com ») : renvoie
 * l'adresse corrigée à proposer, ou null si rien ne semble faux. Une faute
 * d'email = un achat inaccessible, d'où ce garde-fou. */
export function suggestEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1) return null;
  const fixed = DOMAIN_TYPOS[value.slice(at + 1)];
  return fixed ? `${value.slice(0, at)}@${fixed}` : null;
}

/** « jean.dupont@gmail.com » -> « j***@gmail.com » : confirme à l'acheteur où
 * part son lien d'accès, sans l'afficher en entier à qui regarde l'écran. */
export function maskEmail(email: string): string {
  const value = email.trim();
  const at = value.lastIndexOf("@");
  if (at < 1) return "votre adresse email";
  return `${value[0]}***${value.slice(at)}`;
}
