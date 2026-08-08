import { Text, Button } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";

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
      heading="Votre formation est prête"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre accès à <strong>{productName}</strong> est activé. Connectez-vous
        à votre espace client pour commencer.
      </Text>
      <Button
        href={`${siteUrl}/espace-client`}
        style={{
          backgroundColor: "#1e3a5f",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
          display: "inline-block",
          marginTop: 12,
        }}
      >
        Accéder à ma formation
      </Button>
    </EmailLayout>
  );
}
