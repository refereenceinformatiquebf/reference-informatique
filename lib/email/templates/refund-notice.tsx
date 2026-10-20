import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";
import { supportMessage, supportWhatsappLink } from "@/lib/support";

export function RefundNoticeEmail({
  clientName,
  productName,
  amount,
  licence = false,
  paidOn,
}: {
  clientName: string;
  productName: string;
  amount: number;
  /** Produit livré par licence (le pack) : le pied de page donne l'assistance dédiée. */
  licence?: boolean;
  /** Date du paiement, déjà formatée : elle remplit le message d'assistance. */
  paidOn?: string;
}) {
  return (
    <EmailLayout
      preview={`Remboursement — ${productName}`}
      heading="Votre remboursement"
      supportHref={
        licence
          ? supportWhatsappLink(supportMessage(clientName, paidOn))
          : undefined
      }
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre commande <strong>{productName}</strong> a été remboursée (
        {formatPrice(amount)}). L&apos;accès correspondant a été désactivé.
        Selon votre opérateur, le remboursement peut mettre un peu de temps à
        apparaître : si vous ne le voyez pas, écrivez-nous en répondant à cet
        email.
      </Text>
    </EmailLayout>
  );
}
