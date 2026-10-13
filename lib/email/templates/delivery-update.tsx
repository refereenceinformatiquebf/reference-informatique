import { Text } from "@react-email/components";
import { EmailLayout, emailTextStyle } from "./layout";

export function DeliveryUpdateEmail({
  clientName,
  productName,
  status,
}: {
  clientName: string;
  productName: string;
  status: "EN_LIVRAISON" | "LIVREE";
}) {
  const enRoute = status === "EN_LIVRAISON";
  return (
    <EmailLayout
      preview={
        enRoute
          ? "Votre clé USB est en route"
          : "Votre clé USB vous a été remise"
      }
      heading={
        enRoute ? "Votre clé est en route" : "Votre clé vous a été remise"
      }
    >
      <Text style={emailTextStyle}>Bonjour {clientName},</Text>
      <Text style={emailTextStyle}>
        {enRoute ? (
          <>
            Votre commande <strong>{productName}</strong> est en cours de
            livraison. Gardez votre téléphone à portée de main : nous pouvons
            vous appeler pour convenir de la remise.
          </>
        ) : (
          <>
            Votre commande <strong>{productName}</strong> vous a été remise.
            Bonne formation ! Si quoi que ce soit ne fonctionne pas, répondez à
            cet email ou écrivez-nous sur WhatsApp : nous vous aidons tout de
            suite.
          </>
        )}
      </Text>
    </EmailLayout>
  );
}
