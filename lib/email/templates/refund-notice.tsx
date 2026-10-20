import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";

export function RefundNoticeEmail({
  clientName,
  productName,
  amount,
  licence = false,
}: {
  clientName: string;
  productName: string;
  amount: number;
  /** Produit livré par licence (le pack) : le pied de page donne l'assistance dédiée. */
  licence?: boolean;
}) {
  return (
    <EmailLayout
      preview={`Remboursement — ${productName}`}
      heading="Votre remboursement"
      support={licence}
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
