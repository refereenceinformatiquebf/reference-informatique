import { Button, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButtonStyle,
  emailStrongStyle,
  emailTextStyle,
} from "./layout";

export function ContactReceivedClientEmail({
  clientName,
}: {
  clientName: string;
}) {
  return (
    <EmailLayout
      preview="Nous avons bien reçu votre message"
      heading="Message bien reçu"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Merci de nous avoir écrit. Une vraie personne vous répond rapidement,
        par email ou par WhatsApp si vous nous avez laissé votre numéro. Pour
        une réponse plus rapide encore, vous pouvez aussi nous écrire
        directement sur WhatsApp.
      </Text>
    </EmailLayout>
  );
}

export function ContactMessageAdminEmail({
  name,
  email,
  phone,
  message,
  adminUrl,
}: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  adminUrl: string;
}) {
  return (
    <EmailLayout
      preview={`Nouveau message de ${name}`}
      heading="Nouveau message"
    >
      <Text style={emailTextStyle}>
        <strong style={emailStrongStyle}>{name}</strong> — {email}
        {phone ? ` — ${phone}` : ""}
      </Text>
      <Text style={{ ...emailTextStyle, whiteSpace: "pre-wrap" }}>
        {message}
      </Text>
      <Text style={{ ...emailTextStyle, fontSize: 13 }}>
        Répondre à cet email écrit directement au client.
      </Text>
      <Button href={adminUrl} style={emailButtonStyle}>
        Ouvrir dans l&apos;administration
      </Button>
    </EmailLayout>
  );
}
