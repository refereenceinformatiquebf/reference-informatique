import type { DeliveryMode } from "@/lib/catalog/types";
import { whatsappLink } from "@/lib/site";

/**
 * Assistance après achat du pack Activation : numéro WhatsApp DÉDIÉ, distinct du
 * numéro général du site (lib/site.ts). Affiché sur la page où le client reçoit
 * son pack (/espace-client/licences/<produit>).
 */
export const SUPPORT_WHATSAPP = "22666233733";

/** Même présentation que SITE.phoneDisplay : espaces insécables entre les groupes. */
export const SUPPORT_PHONE_DISPLAY = "+226 66 23 37 33";

/**
 * Message prérempli : le client se présente, rappelle qu'il a payé son pack et à
 * quelle date, pour que l'assistance retrouve sa commande sans lui poser de question.
 */
export function supportMessage(name: string, paidOn?: string): string {
  const who = name.trim() ? `je suis ${name.trim()}, ` : "";
  const when = paidOn ? ` le ${paidOn}` : "";
  return `Bonjour, ${who}j'ai payé mon pack avec Référence Informatique${when}, j'ai besoin de votre assistance.`;
}

/** Même idée pour un client dont le paiement n'a pas abouti (relance de paiement). */
export function supportPaymentMessage(
  name: string,
  orderedOn?: string,
): string {
  const who = name.trim() ? `je suis ${name.trim()}, ` : "";
  const when = orderedOn ? ` le ${orderedOn}` : "";
  return `Bonjour, ${who}j'ai commencé la commande de mon pack avec Référence Informatique${when}, j'ai besoin de votre assistance pour finaliser mon paiement.`;
}

/** Espaces insécables du catalogue -> espaces ordinaires, plus sûrs dans un message. */
const plain = (text: string) => text.replace(/[\u00A0\u202F]/g, " ");

/**
 * Message d'un client qui est au paiement (page de commande) : ses
 * coordonnées déjà saisies et la référence de sa commande, pour que
 * l'assistance le retrouve sans rien lui demander. Les champs vides sont omis.
 */
export function supportOrderMessage(details: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  productName: string;
  priceLabel: string;
  orderId: string;
}): string {
  const lines = [
    "Bonjour, j'ai commencé la commande de mon pack avec Référence Informatique, j'ai besoin de votre assistance pour finaliser mon paiement.",
  ];
  const name = details.name?.trim();
  const phone = details.phone?.trim();
  const email = details.email?.trim();
  if (name) lines.push(`Nom : ${name}`);
  if (phone) lines.push(`WhatsApp : ${phone}`);
  if (email) lines.push(`Email : ${email}`);
  lines.push(
    `Pack : ${details.productName} (${plain(details.priceLabel)})`,
    `Référence de commande : ${details.orderId}`,
  );
  return lines.join("\n");
}

/**
 * Messages du bouton « Contactez-nous » de la page de vente : le visiteur n'est
 * pas identifié, on laisse donc à compléter les lignes dont l'assistance a besoin.
 */
export function supportPaidFromSalesPageMessage(name?: string | null): string {
  return [
    "Bonjour, j'ai payé mon pack avec Référence Informatique, j'ai besoin de votre assistance.",
    `Mon nom : ${name?.trim() ?? ""}`,
    "Email utilisé pour la commande : ",
  ].join("\n");
}

export function supportPayOnWhatsappMessage(
  productName: string,
  priceLabel: string,
  name?: string | null,
): string {
  return [
    `Bonjour, je souhaite payer mon ${productName} (${plain(priceLabel)}) sur WhatsApp.`,
    `Mon nom : ${name?.trim() ?? ""}`,
    "Mon email (pour recevoir le pack) : ",
  ].join("\n");
}

export function supportWhatsappLink(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/**
 * Lien WhatsApp à proposer à un client selon ce qu'il a acheté : l'assistance
 * dédiée pour un produit livré par licence (le pack), le numéro général du site
 * pour tout le reste. Un client du pack ne doit jamais voir le numéro général.
 */
export function whatsappLinkForDelivery(
  delivery: DeliveryMode | undefined,
  message: string,
): string {
  return delivery === "licence-edn"
    ? supportWhatsappLink(message)
    : whatsappLink(message);
}
