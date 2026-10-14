import { Button, Text } from "@react-email/components";
import {
  EmailLayout,
  emailButtonStyle,
  emailStrongStyle,
  emailTextStyle,
} from "./layout";

export type LicenceStockAlertProps = {
  milestone: "low" | "empty";
  available: number;
  adminUrl: string;
};

/** Alerte interne : le stock local de licences EDN (pack Windows + Office) est bas ou épuisé. */
export function LicenceStockAlertEmail({
  milestone,
  available,
  adminUrl,
}: LicenceStockAlertProps) {
  const empty = milestone === "empty";
  const heading = empty ? "Stock de licences épuisé" : "Stock de licences bas";
  return (
    <EmailLayout preview={heading} heading={heading}>
      <Text style={emailTextStyle}>
        {empty
          ? "Le stock local de licences du pack Windows + Office est épuisé. Les prochaines ventes basculeront sur un appel direct à L'Expert du Numérique — qui peut échouer si le quota est aussi atteint chez le fournisseur."
          : `Il ne reste que `}
        {!empty ? (
          <strong style={emailStrongStyle}>
            {available} licence{available > 1 ? "s" : ""}
          </strong>
        ) : null}
        {!empty ? " en stock local." : null}
      </Text>
      <Text style={emailTextStyle}>
        {empty
          ? "Récupérez un nouveau lot, ou contactez L'Expert du Numérique si le quota est atteint."
          : "Pensez à récupérer un nouveau lot avant la rupture."}
      </Text>
      <Button href={adminUrl} style={emailButtonStyle}>
        Gérer les licences
      </Button>
    </EmailLayout>
  );
}
