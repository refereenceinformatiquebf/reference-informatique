import { Text, Button } from "@react-email/components";
import { EmailLayout, emailButtonStyle, emailTextStyle } from "./layout";

export function AccessGrantedEmail({
  clientName,
  productName,
  siteUrl,
}: {
  clientName: string;
  productName: string;
  siteUrl: string;
}) {
  return (
    <EmailLayout
      preview={`Accès activé — ${productName}`}
      heading="Votre accès est prêt"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre accès à <strong>{productName}</strong> est activé. Connectez-vous
        à votre espace client pour commencer.
      </Text>
      <Button href={`${siteUrl}/espace-client`} style={emailButtonStyle}>
        Accéder à mon espace
      </Button>
    </EmailLayout>
  );
}
