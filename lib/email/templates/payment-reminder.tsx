import { Button, Text } from "@react-email/components";
import { EmailLayout, emailButtonStyle, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";
import { supportPaymentMessage, supportWhatsappLink } from "@/lib/support";

/**
 * Relance d'une commande dont le paiement n'a pas été terminé. Un seul
 * rappel par commande, jamais de pression : le client reprend en un clic ou
 * ignore le message.
 */
export function PaymentReminderEmail({
  clientName,
  productName,
  amount,
  quantity = 1,
  trackUrl,
  licence = false,
  orderedOn,
}: {
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  /** Lien personnel de la commande : on y reprend le paiement en un clic. */
  trackUrl: string;
  /** Produit livré par licence (le pack) : le pied de page donne l'assistance dédiée. */
  licence?: boolean;
  /** Date de la commande, déjà formatée : elle remplit le message d'assistance. */
  orderedOn?: string;
}) {
  const label = quantity > 1 ? `${quantity} × ${productName}` : productName;
  return (
    <EmailLayout
      preview={`Votre commande vous attend — ${productName}`}
      heading="Votre commande vous attend"
      supportHref={
        licence
          ? supportWhatsappLink(supportPaymentMessage(clientName, orderedOn))
          : undefined
      }
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Vous avez commencé une commande pour <strong>{label}</strong> (
        {formatPrice(amount)}), mais le paiement n&apos;a pas été terminé. Vous
        pouvez le reprendre en un clic, au même prix.
      </Text>
      <Button href={trackUrl} style={emailButtonStyle}>
        Reprendre mon paiement
      </Button>
      <Text style={{ ...emailTextStyle, marginTop: 22, fontSize: 13 }}>
        Vous avez déjà payé ? Ignorez ce message : votre accès arrive tout seul
        dès que le paiement est confirmé. Une difficulté avec le paiement ?
        Répondez simplement à cet email, ou écrivez-nous sur WhatsApp : nous
        vous aidons tout de suite.
      </Text>
    </EmailLayout>
  );
}
