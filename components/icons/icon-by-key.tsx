import type { IconKey } from "@/lib/catalog/types";
import * as I from "./icons";
import type { IconProps } from "./icons";

/** Clé de catalogue (IconKey) -> composant d'icône. Mapping explicite : une
 * clé mal orthographiée est une erreur TypeScript, pas un trou silencieux. */
const ICONS: Record<IconKey, (props: IconProps) => React.ReactElement> = {
  "cle-usb": I.IconCleUsb,
  formation: I.IconFormation,
  ebook: I.IconEbook,
  pack: I.IconPack,
  logiciel: I.IconLogiciel,
  modele: I.IconModele,
  outil: I.IconOutil,
  service: I.IconService,
  code: I.IconCode,
  "agent-ia": I.IconAgentIa,
  automatisation: I.IconAutomatisation,
  maintenance: I.IconMaintenance,
  livraison: I.IconLivraison,
  paiement: I.IconPaiement,
  bouclier: I.IconBouclier,
  "acces-a-vie": I.IconAccesAVie,
  "hors-ligne": I.IconHorsLigne,
  support: I.IconSupport,
  certificat: I.IconCertificat,
  verifie: I.IconVerifie,
  actualisation: I.IconActualisation,
  horloge: I.IconHorloge,
  eclair: I.IconEclair,
  ordinateur: I.IconOrdinateur,
  plateforme: I.IconPlateforme,
  telecharger: I.IconTelecharger,
  globe: I.IconGlobe,
  lieu: I.IconLieu,
  whatsapp: I.IconWhatsapp,
  cadeau: I.IconCadeau,
  devis: I.IconDevis,
  video: I.IconVideo,
  pdf: I.IconPdf,
  panier: I.IconPanier,
  utilisateur: I.IconUtilisateur,
  recherche: I.IconRecherche,
  mail: I.IconMail,
  telephone: I.IconTelephone,
  etoile: I.IconEtoile,
  cadenas: I.IconCadenas,
};

export function Icon({ name, ...props }: IconProps & { name: IconKey }) {
  const Component = ICONS[name];
  return <Component {...props} />;
}
