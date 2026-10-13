import { Button, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButtonStyle,
  emailStrongStyle,
  emailTextStyle,
} from "./layout";
import { formatPrice } from "@/lib/format";

export type OrderAlertProps = {
  /** « created » : commande enregistrée ; « paid » : paiement confirmé. */
  event: "created" | "paid";
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  productName: string;
  amount: number;
  quantity?: number;
  channel: "BOUTIQUE" | "WHATSAPP";
  /** Présent pour une clé USB à livrer. */
  shipping?: { city: string; address: string; phone: string } | null;
  adminUrl: string;
};

export function NewOrderAdminEmail({
  event,
  clientName,
  clientPhone,
  clientEmail,
  productName,
  amount,
  quantity = 1,
  channel,
  shipping,
  adminUrl,
}: OrderAlertProps) {
  const toDeliver = event === "paid" && Boolean(shipping);
  const heading =
    event === "paid"
      ? toDeliver
        ? "Paiement reçu : clé à livrer"
        : "Paiement reçu"
      : "Nouvelle commande";
  return (
    <EmailLayout preview={`${heading} — ${productName}`} heading={heading}>
      <Text style={emailTextStyle}>
        <strong style={emailStrongStyle}>{clientName}</strong> — {clientPhone}
        {clientEmail ? ` — ${clientEmail}` : ""}
      </Text>
      <Text style={emailTextStyle}>
        {quantity > 1 ? `${quantity} × ` : ""}
        {productName} — {formatPrice(amount)}
      </Text>
      <Text style={emailTextStyle}>
        Canal :{" "}
        {channel === "BOUTIQUE" ? "Paiement en ligne (SasPay)" : "WhatsApp"}
        {event === "created"
          ? channel === "BOUTIQUE"
            ? " — en attente de paiement"
            : " — en attente de confirmation de votre part"
          : ""}
      </Text>
      {shipping ? (
        <Text style={emailTextStyle}>
          <strong style={emailStrongStyle}>Livraison</strong> : {shipping.city},{" "}
          {shipping.address}
          <br />
          Téléphone de livraison : {shipping.phone}
        </Text>
      ) : null}
      <Button href={adminUrl} style={emailButtonStyle}>
        Ouvrir la commande
      </Button>
    </EmailLayout>
  );
}
