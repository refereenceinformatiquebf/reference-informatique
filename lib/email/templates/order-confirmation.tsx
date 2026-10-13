import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";
import { afterPaymentSentence } from "./delivery-copy";
import { formatPrice } from "@/lib/format";
import type { DeliveryMode } from "@/lib/catalog/types";

export function OrderConfirmationEmail({
  clientName,
  productName,
  amount,
  quantity = 1,
  delivery = "numerique",
  channel = "BOUTIQUE",
  shipping,
}: {
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  delivery?: DeliveryMode;
  channel?: "BOUTIQUE" | "WHATSAPP";
  shipping?: { city: string; address: string } | null;
}) {
  const label = quantity > 1 ? `${quantity} × ${productName}` : productName;
  return (
    <EmailLayout
      preview={`Commande reçue — ${productName}`}
      heading="Nous avons bien reçu votre commande"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre commande pour <strong>{label}</strong> ({formatPrice(amount)}) est
        enregistrée. Dès la confirmation de votre paiement,{" "}
        {afterPaymentSentence(delivery, shipping)}
      </Text>
      {channel === "WHATSAPP" ? (
        <Text style={emailTextStyle}>
          Vous avez choisi de commander par WhatsApp : si la conversation ne
          s&apos;est pas ouverte, écrivez-nous en indiquant votre nom, et nous
          vous indiquons comment régler.
        </Text>
      ) : null}
      <Text style={emailTextStyle}>
        Vous pouvez suivre l&apos;état de votre commande à tout moment depuis
        votre espace client.
      </Text>
    </EmailLayout>
  );
}
