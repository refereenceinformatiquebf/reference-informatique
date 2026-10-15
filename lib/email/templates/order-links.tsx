import { Button, Text } from "@react-email/components";
import { EmailLayout, emailButtonStyle, emailTextStyle } from "./layout";
import { formatPrice } from "@/lib/format";

export type OrderLinkItem = {
  productName: string;
  amount: number;
  paid: boolean;
  url: string;
};

/**
 * « Retrouver ma commande » : les liens personnels des commandes récentes
 * d'une adresse email. Envoyé uniquement à cette adresse, jamais affiché à
 * l'écran : c'est la boîte email qui prouve qui demande.
 */
export function OrderLinksEmail({
  name,
  items,
}: {
  name?: string;
  items: OrderLinkItem[];
}) {
  return (
    <EmailLayout
      preview="Vos commandes chez Référence Informatique"
      heading="Vos commandes"
    >
      <Text style={emailTextStyle}>
        {name ? `Bonjour ${name}, v` : "V"}oici le lien de chacune de vos
        commandes récentes. Un clic ouvre votre achat, sans mot de passe.
      </Text>
      {items.map((item) => (
        <div key={item.url} style={{ marginTop: 18 }}>
          <Text style={{ ...emailTextStyle, margin: "0 0 8px" }}>
            <strong>{item.productName}</strong> — {formatPrice(item.amount)}
            <br />
            <span style={{ fontSize: 13 }}>
              {item.paid ? "Paiement confirmé" : "Paiement non terminé"}
            </span>
          </Text>
          <Button href={item.url} style={emailButtonStyle}>
            {item.paid ? "Accéder à mon achat" : "Voir ma commande"}
          </Button>
        </div>
      ))}
      <Text style={{ ...emailTextStyle, marginTop: 24, fontSize: 13 }}>
        Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez cet
        email : personne ne peut accéder à vos commandes sans ces liens.
      </Text>
    </EmailLayout>
  );
}
