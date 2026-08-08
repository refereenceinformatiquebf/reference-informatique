import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";

export function DevisReceivedClientEmail({
  clientName,
  serviceName,
}: {
  clientName: string;
  serviceName: string;
}) {
  return (
    <EmailLayout
      preview="Votre demande de devis est bien reçue"
      heading="Demande de devis reçue"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Nous avons bien reçu votre demande concernant{" "}
        <strong>{serviceName}</strong>. Notre équipe revient vers vous sous 24h
        ouvrées avec un devis détaillé.
      </Text>
    </EmailLayout>
  );
}

export function DevisReceivedAdminEmail({
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  message,
  budget,
}: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  message: string;
  budget?: string;
}) {
  return (
    <EmailLayout
      preview={`Nouveau devis — ${serviceName}`}
      heading="Nouvelle demande de devis"
    >
      <Text style={emailTextStyle}>
        <strong>{clientName}</strong> ({clientEmail}, {clientPhone})
      </Text>
      <Text style={emailTextStyle}>
        Prestation : <strong>{serviceName}</strong>
        {budget ? ` — Budget indicatif : ${budget}` : ""}
      </Text>
      <Text style={emailTextStyle}>{message}</Text>
    </EmailLayout>
  );
}
