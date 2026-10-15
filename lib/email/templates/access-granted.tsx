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
        à votre espace client avec votre adresse email pour commencer : un lien
        de connexion vous y est envoyé, sans mot de passe à retenir.
      </Text>
      <Button href={`${siteUrl}/connexion`} style={emailButtonStyle}>
        Me connecter
      </Button>
    </EmailLayout>
  );
}
