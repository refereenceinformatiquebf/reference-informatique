import { Button, Section, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButtonStyle,
  emailStrongStyle,
  emailTextStyle,
} from "./layout";
import { paidSentence } from "./delivery-copy";
import { formatPrice } from "@/lib/format";
import type { DeliveryMode } from "@/lib/catalog/types";

export function PaymentConfirmationEmail({
  clientName,
  productName,
  amount,
  quantity = 1,
  delivery = "numerique",
  orderRef,
  ctaUrl,
  licenceKey,
  installerUrl,
}: {
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  delivery?: DeliveryMode;
  /** Référence courte de la commande, à citer au support. */
  orderRef?: string;
  /** Lien direct vers l'achat dans l'espace client. */
  ctaUrl: string;
  /** Renseignés uniquement pour une livraison "licence-edn" — affichés directement ici. */
  licenceKey?: string | null;
  installerUrl?: string | null;
}) {
  const label = quantity > 1 ? `${quantity} × ${productName}` : productName;
  return (
    <EmailLayout
      preview={`Paiement confirmé — ${productName}`}
      heading="Paiement confirmé !"
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        Votre paiement de <strong>{formatPrice(amount)}</strong> pour{" "}
        <strong>{label}</strong> a bien été reçu. {paidSentence(delivery)}
      </Text>
      {licenceKey ? (
        <>
          <Text style={emailTextStyle}>
            Votre <strong style={emailStrongStyle}>licence Expert</strong> —
            elle active à la fois Microsoft Office 365 et Windows 11 :
          </Text>
          <Section
            style={{
              background: "#eef3fb",
              border: "1px solid #c6d6ec",
              borderRadius: 10,
              padding: "12px 16px",
              margin: "0 0 18px",
            }}
          >
            <Text
              style={{
                ...emailTextStyle,
                margin: 0,
                fontWeight: 700,
                letterSpacing: 0.4,
                color: "#0b1f3a",
                fontFamily: "monospace",
              }}
            >
              {licenceKey}
            </Text>
          </Section>
          {installerUrl ? (
            <Button href={installerUrl} style={emailButtonStyle}>
              Télécharger l&rsquo;application
            </Button>
          ) : null}
        </>
      ) : null}
      <Button
        href={ctaUrl}
        style={{
          ...emailButtonStyle,
          ...(licenceKey ? { marginTop: 12 } : {}),
        }}
      >
        Accéder à mon espace
      </Button>
      {orderRef ? (
        <Text style={{ ...emailTextStyle, marginTop: 18, fontSize: 13 }}>
          Référence de commande : {orderRef}
        </Text>
      ) : null}
    </EmailLayout>
  );
}
