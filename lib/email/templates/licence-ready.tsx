import { Text, Button } from "@react-email/components";
import { EmailLayout, emailButtonStyle, emailTextStyle } from "./layout";
import { supportMessage, supportWhatsappLink } from "@/lib/support";

/**
 * Envoyé à un client qui avait payé mais dont la licence n'était pas encore
 * disponible : elle l'est maintenant (voir lib/licences/fulfil.ts).
 */
export function LicenceReadyEmail({
  clientName,
  productName,
  ctaUrl,
  paidOn,
}: {
  clientName: string;
  productName: string;
  /** Lien personnel de la commande : ouvre l'achat sans mot de passe. */
  ctaUrl: string;
  /** Date du paiement, déjà formatée : elle remplit le message d'assistance. */
  paidOn?: string;
}) {
  return (
    <EmailLayout
      preview={`Votre pack est prêt — ${productName}`}
      heading="Votre pack est prêt"
      supportHref={supportWhatsappLink(supportMessage(clientName, paidOn))}
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Merci de votre patience : votre pack <strong>{productName}</strong> est
        maintenant disponible. Votre licence, l&rsquo;application
        d&rsquo;activation, Windows, Office et le guide complet vous attendent.
      </Text>
      <Button href={ctaUrl} style={emailButtonStyle}>
        Accéder à mon pack
      </Button>
      <Text style={{ ...emailTextStyle, marginTop: 14, fontSize: 13 }}>
        Ce lien est personnel : il ouvre votre achat sans mot de passe, depuis
        n&rsquo;importe quel appareil. Ne le transmettez pas.
      </Text>
    </EmailLayout>
  );
}
