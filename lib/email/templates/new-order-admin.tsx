import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";

export function NewOrderAdminEmail({
  clientName,
  clientPhone,
  productName,
  amount,
  channel,
}: {
  clientName: string;
  clientPhone: string;
  productName: string;
  amount: number;
  channel: "BOUTIQUE" | "WHATSAPP";
}) {
  return (
    <EmailLayout
      preview={`Nouvelle commande — ${productName}`}
      heading="Nouvelle commande"
    >
      <Text style={emailTextStyle}>
        <strong>{clientName}</strong> — {clientPhone}
      </Text>
      <Text style={emailTextStyle}>
        {productName} — {formatPrice(amount)}
      </Text>
      <Text style={emailTextStyle}>
        Canal :{" "}
        {channel === "BOUTIQUE" ? "Paiement en ligne (SasPay)" : "WhatsApp"}
      </Text>
    </EmailLayout>
  );
}
