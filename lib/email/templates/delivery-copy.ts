import type { DeliveryMode } from "@/lib/catalog/types";

/**
 * Phrases communes aux emails, selon la façon dont le client reçoit son
 * achat. Elles reprennent EXACTEMENT les promesses déjà publiées sur le site
 * (components/shop/how-it-works.tsx, page de commande) : rien de plus.
 */
export function afterPaymentSentence(
  mode: DeliveryMode,
  shipping?: { city: string; address: string } | null,
) {
  switch (mode) {
    case "cle-physique":
      return shipping
        ? `votre clé USB vous est livrée gratuitement sous 24 à 48 h à l'adresse indiquée (${shipping.city}, ${shipping.address}).`
        : "votre clé USB vous est livrée gratuitement sous 24 à 48 h.";
    case "manuel":
      return "notre équipe vous contacte sur WhatsApp pour vous remettre votre accès.";
    case "licence-edn":
      return "votre licence d'activation est prête : retrouvez-la dans votre espace client.";
    default:
      return "votre accès est activé automatiquement : vous recevez un lien personnel par email, qui ouvre votre achat sans mot de passe.";
  }
}

export function paidSentence(mode: DeliveryMode) {
  switch (mode) {
    case "cle-physique":
      return "Votre clé USB vous est livrée gratuitement sous 24 à 48 h : nous vous contactons pour convenir de la remise.";
    case "manuel":
      return "Notre équipe vous contacte sur WhatsApp pour vous remettre votre accès.";
    case "licence-edn":
      return "Votre licence d'activation vous attend ci-dessous.";
    default:
      return "Votre accès est activé : le bouton ci-dessous l'ouvre, et vous le retrouvez ensuite dans votre espace client, à tout moment.";
  }
}
