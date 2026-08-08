import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";

export function PaymentConfirmationEmail({
  clientName,
  productName,
  amount,
}: {
  clientName: string;
  productName: string;
  amount: number;
}) {
  return (
    <EmailLayout
      preview={`Paiement confirmé — ${productName}`}
      heading="Paiement confirmé !"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre paiement de <strong>{formatPrice(amount)}</strong> pour{" "}
        <strong>{productName}</strong> a bien été reçu. Votre accès est activé
        dès maintenant dans votre espace client.
      </Text>
    </EmailLayout>
  );
}
