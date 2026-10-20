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
export function supportMessage(name: string, paidOn: string): string {
  const who = name.trim() ? `je suis ${name.trim()}, ` : "";
  return `Bonjour, ${who}j'ai payé mon pack avec Référence Informatique le ${paidOn}, j'ai besoin de votre assistance.`;
}

export function supportWhatsappLink(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
