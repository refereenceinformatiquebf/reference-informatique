import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";

export function OrderConfirmationEmail({
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
      preview={`Commande reçue — ${productName}`}
      heading="Nous avons bien reçu votre commande"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre commande pour <strong>{productName}</strong> (
        {formatPrice(amount)}) est enregistrée. Dès confirmation de votre
        paiement, votre accès est activé automatiquement.
      </Text>
      <Text style={emailTextStyle}>
        Vous pouvez suivre l&apos;état de votre commande à tout moment depuis
        votre espace client.
      </Text>
    </EmailLayout>
  );
}
