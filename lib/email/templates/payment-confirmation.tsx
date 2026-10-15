import { Button, Text } from "@react-email/components";
import { EmailLayout, emailButtonStyle, emailTextStyle } from "./layout";
import { paidSentence } from "./delivery-copy";
import { formatPrice } from "@/lib/format";
import type { DeliveryMode } from "@/lib/catalog/types";

export function PaymentConfirmationEmail({
  clientName,
  productName,
  amount,
  quantity = 1,
  delivery = "numerique",
  orderRef,
  ctaUrl,
  licenceKey,
}: {
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  delivery?: DeliveryMode;
  /** Référence courte de la commande, à citer au support. */
  orderRef?: string;
  /** Lien direct vers l'achat dans l'espace client. */
  ctaUrl: string;
  /** Renseigné uniquement pour une livraison "licence-edn" — change le libellé du bouton,
   *  la licence elle-même et les liens de téléchargement restent sur la page dédiée. */
  licenceKey?: string | null;
}) {
  const label = quantity > 1 ? `${quantity} × ${productName}` : productName;
  return (
    <EmailLayout
      preview={`Paiement confirmé — ${productName}`}
      heading="Paiement confirmé !"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre paiement de <strong>{formatPrice(amount)}</strong> pour{" "}
        <strong>{label}</strong> a bien été reçu. {paidSentence(delivery)}
      </Text>
      <Button href={ctaUrl} style={emailButtonStyle}>
        {licenceKey ? "Accéder à ma licence" : "Accéder à mon espace"}
      </Button>
      {licenceKey ? (
        <Text style={{ ...emailTextStyle, marginTop: 10, fontSize: 13 }}>
          Votre licence, l&rsquo;application d&rsquo;activation, Windows, Office
          et le guide complet vous y attendent.
        </Text>
      ) : null}
      {orderRef ? (
        <Text style={{ ...emailTextStyle, marginTop: 18, fontSize: 13 }}>
          Référence de commande : {orderRef}
        </Text>
      ) : null}
    </EmailLayout>
  );
}
