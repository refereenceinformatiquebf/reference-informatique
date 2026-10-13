import type { ReactNode } from "react";

/**
 * Jeu d'icônes « RI » — dessiné pour Référence Informatique, dans la
 * grammaire de la charte Boulga AI (contour fin, 24 px, héritage de couleur)
 * et la règle « pas d'icônes génériques » de 360 Digital.
 *
 * Grammaire commune (c'est ce qui fait que 50 dessins se lisent comme un
 * seul jeu) :
 *  - grille 24 × 24, marge de sécurité 2 px, trait 1,5 px, extrémités et
 *    jonctions arrondies, couleur = `currentColor` ;
 *  - UN élément d'accent par icône (point plein ou trait court), en bleu de
 *    marque via `--icon-accent` (clair automatiquement sur les fonds foncés,
 *    voir globals.css) — c'est la signature, l'écho du point bleu de « AI » ;
 *  - 3 éléments visuels maximum, aucun dégradé, aucune ombre.
 *
 * Deux familles : les icônes de MARQUE (avec accent) et les icônes
 * FONCTIONNELLES d'interface (flèche, croix, coche… sans accent, pour rester
 * reconnaissables instantanément).
 */

export type IconProps = {
  size?: number;
  className?: string;
  /** Nom accessible. Sans `title`, l'icône est décorative (aria-hidden). */
  title?: string;
};

const ACCENT = "var(--icon-accent, var(--brand))";

/** Point d'accent plein. */
function Dot({ cx, cy, r = 1.3 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill={ACCENT} stroke="none" />;
}

/** Trait d'accent. */
function Accent({ d }: { d: string }) {
  return <path d={d} stroke={ACCENT} />;
}

function create(displayName: string, children: ReactNode) {
  const Icon = ({ size = 24, className, title }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

/* ============================ Catalogue ============================ */

/** Clé USB : connecteur + boîtier, voyant d'accent. */
export const IconCleUsb = create(
  "IconCleUsb",
  <>
    <rect x="2.75" y="10" width="4.25" height="4" rx="0.8" />
    <rect x="7" y="7.25" width="14.25" height="9.5" rx="2.25" />
    <Dot cx={16.25} cy={12} r={1.35} />
  </>,
);

/** Formation : toque de diplômé, gland d'accent. */
export const IconFormation = create(
  "IconFormation",
  <>
    <path d="M2.5 9.25 12 4.75l9.5 4.5L12 13.75 2.5 9.25Z" />
    <path d="M6.5 11.6v4.2c0 1.3 2.5 2.9 5.5 2.9s5.5-1.6 5.5-2.9v-4.2" />
    <Accent d="M21.5 9.25v5" />
    <Dot cx={21.5} cy={16.3} r={1.1} />
  </>,
);

/** Ebook : livre ouvert. */
export const IconEbook = create(
  "IconEbook",
  <>
    <path d="M12 6.6C10.4 5.4 8.2 5 4.5 5v12.6c3.7 0 5.9.4 7.5 1.6 1.6-1.2 3.8-1.6 7.5-1.6V5C15.8 5 13.6 5.4 12 6.6Z" />
    <path d="M12 6.6v12.6" />
    <Accent d="M7.4 9.6h2.2M7.4 12.4h2.2" />
  </>,
);

/** Pack : coffret en perspective, centre d'accent. */
export const IconPack = create(
  "IconPack",
  <>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
    <Dot cx={12} cy={11} r={1.4} />
  </>,
);

/** Logiciel : fenêtre et curseur de commande. */
export const IconLogiciel = create(
  "IconLogiciel",
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="M3 9h18M8.2 12.8 10.6 15l-2.4 2.2" />
    <Accent d="M13 17.2h3.4" />
    <Dot cx={6.2} cy={6.75} r={0.85} />
  </>,
);

/** Modèles : diapositive sur pied. */
export const IconModele = create(
  "IconModele",
  <>
    <rect x="3" y="4.5" width="18" height="12" rx="2" />
    <path d="M12 16.5v3.2M8 20h8M7 9.2h6" />
    <Accent d="M7 12.4h10" />
  </>,
);

/** Outil de diagnostic : jauge à aiguille. */
export const IconOutil = create(
  "IconOutil",
  <>
    <path d="M4.2 17.5a8.6 8.6 0 1 1 15.6 0" />
    <path d="M12 14.2 15.6 9.4" />
    <Dot cx={12} cy={14.4} r={1.55} />
    <path d="M7.4 17.8h9.2" />
  </>,
);

/** Service : mallette de prestations. */
export const IconService = create(
  "IconService",
  <>
    <rect x="3" y="7.5" width="18" height="12" rx="2.5" />
    <path d="M9 7.5V6.2A2.2 2.2 0 0 1 11.2 4h1.6A2.2 2.2 0 0 1 15 6.2v1.3M3 13h18" />
    <Dot cx={12} cy={13} r={1.35} />
  </>,
);

/* ====================== Familles de services ====================== */

/** Conception web : chevrons de code, point au centre. */
export const IconCode = create(
  "IconCode",
  <>
    <path d="M8.6 7.6 4.2 12l4.4 4.4M15.4 7.6l4.4 4.4-4.4 4.4" />
    <Dot cx={12} cy={12} r={1.5} />
  </>,
);

/** Agent IA : tête de robot, antenne d'accent. */
export const IconAgentIa = create(
  "IconAgentIa",
  <>
    <rect x="4.75" y="8.5" width="14.5" height="10.5" rx="3.25" />
    <path d="M12 8.5V5.6M2.75 12.6v3M21.25 12.6v3M9.4 13v1.4M14.6 13v1.4" />
    <Dot cx={12} cy={4.4} r={1.35} />
  </>,
);

/** Automatisation : deux noeuds reliés par un flux, déclencheur d'accent. */
export const IconAutomatisation = create(
  "IconAutomatisation",
  <>
    <circle cx={6.2} cy={6.8} r={2.4} />
    <circle cx={16.2} cy={17.2} r={2.4} />
    <path d="M8.6 6.8h4.2a3.4 3.4 0 0 1 3.4 3.4v4.6" />
    <Dot cx={19} cy={6.2} r={1.4} />
  </>,
);

/** Maintenance : clé à molette, vis d'accent. */
export const IconMaintenance = create(
  "IconMaintenance",
  <>
    <path d="M15.6 4.4a4.3 4.3 0 0 0-3.9 5.8L4.9 17a1.95 1.95 0 0 0 2.8 2.8l6.8-6.8a4.3 4.3 0 0 0 5.8-3.9c0-.5-.1-.9-.2-1.3l-2.6 2.6-2.3-.6-.6-2.3 2.6-2.6c-.4-.1-.8-.2-1.3-.2Z" />
    <Dot cx={6.3} cy={18.4} r={0.95} />
  </>,
);

/* ======================== Réassurance / avantages ======================== */

/** Livraison : camion. */
export const IconLivraison = create(
  "IconLivraison",
  <>
    <path d="M2.75 6.75h10.5v9.5H2.75zM13.25 9.75h4.1l3.4 3.3v3.2h-7.5" />
    <circle cx={7} cy={17.6} r={1.85} />
    <circle cx={17} cy={17.6} r={1.85} />
    <Dot cx={8} cy={11.2} r={1.2} />
  </>,
);

/** Paiement Mobile Money : téléphone et pièce. */
export const IconPaiement = create(
  "IconPaiement",
  <>
    <rect x="3.75" y="3" width="9" height="18" rx="2.25" />
    <path d="M7.1 17.8h2.3" />
    <circle cx={17.4} cy={14.4} r={3.9} />
    <Dot cx={17.4} cy={14.4} r={1.15} />
  </>,
);

/** Paiement sécurisé : bouclier, coche d'accent. */
export const IconBouclier = create(
  "IconBouclier",
  <>
    <path d="M12 3 5 6v5.4c0 4.2 2.9 7.6 7 9.6 4.1-2 7-5.4 7-9.6V6l-7-3Z" />
    <Accent d="m9 12 2.2 2.2L15.6 9.8" />
  </>,
);

/** Accès à vie : boucle infinie. */
export const IconAccesAVie = create(
  "IconAccesAVie",
  <>
    <path d="M12 12c-1.6-2.3-3.2-3.6-5-3.6a3.6 3.6 0 1 0 0 7.2c1.8 0 3.4-1.3 5-3.6Zm0 0c1.6 2.3 3.2 3.6 5 3.6a3.6 3.6 0 1 0 0-7.2c-1.8 0-3.4 1.3-5 3.6Z" />
    <Dot cx={12} cy={12} r={1.15} />
  </>,
);

/** Fonctionne sans internet : ondes barrées. */
export const IconHorsLigne = create(
  "IconHorsLigne",
  <>
    <path d="M4 9.4a12 12 0 0 1 3.6-2.2M20 9.4a12 12 0 0 0-6.2-3.1M7.4 13a8 8 0 0 1 3-1.7M16.6 13a8 8 0 0 0-2.2-1.6" />
    <path d="M4 4.2 20 20" />
    <Dot cx={12} cy={16.8} r={1.4} />
  </>,
);

/** Support humain : bulle de dialogue à trois points. */
export const IconSupport = create(
  "IconSupport",
  <>
    <path d="M5.5 3.75h13A2.25 2.25 0 0 1 20.75 6v8.25A2.25 2.25 0 0 1 18.5 16.5h-6.9l-4.35 3.75V16.5H5.5A2.25 2.25 0 0 1 3.25 14.25V6A2.25 2.25 0 0 1 5.5 3.75Z" />
    <Dot cx={8.2} cy={10.1} r={1} />
    <Dot cx={12} cy={10.1} r={1} />
    <Dot cx={15.8} cy={10.1} r={1} />
  </>,
);

/** Attestation / certificat : feuille et sceau. */
export const IconCertificat = create(
  "IconCertificat",
  <>
    <path d="M13.2 19.25H5.5A2.25 2.25 0 0 1 3.25 17V6.75A2.25 2.25 0 0 1 5.5 4.5h13a2.25 2.25 0 0 1 2.25 2.25v5.1M7.2 9h9.6M7.2 12.4h4.4" />
    <circle cx={17} cy={16.6} r={2.7} stroke={ACCENT} />
    <path d="m15.7 19 -.7 2.7 2-1 2 1-.7-2.7" stroke={ACCENT} />
  </>,
);

/** Contenu vérifié : médaillon à coche. */
export const IconVerifie = create(
  "IconVerifie",
  <>
    <circle cx={12} cy={12} r={8.6} />
    <Accent d="m8.6 12.2 2.4 2.4 4.4-4.8" />
  </>,
);

/** Mise à jour offerte : flèche circulaire. */
export const IconActualisation = create(
  "IconActualisation",
  <>
    <path d="M19.5 11.5A7.5 7.5 0 0 0 6.2 7.2L4.5 9M4.5 12.5a7.5 7.5 0 0 0 13.3 4.3l1.7-1.8" />
    <path d="M4.5 4.75V9h4.25M19.5 19.25V15h-4.25" />
    <Dot cx={12} cy={12} r={1.3} />
  </>,
);

/** Horloge : disponibilité 24 h/24. */
export const IconHorloge = create(
  "IconHorloge",
  <>
    <circle cx={12} cy={12} r={8.6} />
    <path d="M12 7.2V12l3.1 1.9" />
    <Dot cx={12} cy={12} r={1.1} />
  </>,
);

/** Éclair : accès immédiat. */
export const IconEclair = create(
  "IconEclair",
  <>
    <path d="M13.2 2.75 5 13.4h6.1L10 21.25 18.9 10H12.7l.5-7.25Z" />
    <Dot cx={16.8} cy={5.4} r={1.1} />
  </>,
);

/** Ordinateur portable. */
export const IconOrdinateur = create(
  "IconOrdinateur",
  <>
    <rect x="4.5" y="5" width="15" height="10.5" rx="2" />
    <path d="M2.5 19h19" />
    <Dot cx={12} cy={10.25} r={1.3} />
  </>,
);

/** Plateforme en ligne : fenêtre de navigateur et nuage. */
export const IconPlateforme = create(
  "IconPlateforme",
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <path d="M3 9h18" />
    <path
      d="M8.4 16.2a2.6 2.6 0 0 1 .4-5.2 3.3 3.3 0 0 1 6.3.9 2.2 2.2 0 0 1 .3 4.3H8.4Z"
      stroke={ACCENT}
    />
  </>,
);

/** Téléchargement. */
export const IconTelecharger = create(
  "IconTelecharger",
  <>
    <path d="M4.5 15.5v2.2a1.8 1.8 0 0 0 1.8 1.8h11.4a1.8 1.8 0 0 0 1.8-1.8v-2.2" />
    <Accent d="M12 4.5v10M8 10.8l4 4 4-4" />
  </>,
);

/** Globe : disponibilité par pays. */
export const IconGlobe = create(
  "IconGlobe",
  <>
    <circle cx={12} cy={12} r={8.6} />
    <path d="M3.4 12h17.2M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.3-3.6-8.6s1.2-6.2 3.6-8.6Z" />
    <Dot cx={16.8} cy={7.2} r={1.2} />
  </>,
);

/** Localisation : repère. */
export const IconLieu = create(
  "IconLieu",
  <>
    <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z" />
    <Dot cx={12} cy={10} r={2.1} />
  </>,
);

/* ============================ Contact ============================ */

/** WhatsApp : bulle de conversation et combiné — le canal, pas le logo
 * déposé (à ne jamais redessiner). Le libellé et la couleur verte du
 * contexte suffisent à l'identifier. */
export const IconWhatsapp = create(
  "IconWhatsapp",
  <>
    <path d="M4 20.25l1.25-3.7A8.25 8.25 0 1 1 8.7 19L4 20.25Z" />
    <path
      d="M9.4 9.3c.1 2.9 2.4 5.2 5.3 5.4l.9-1.2-1.9-.9-.8.6a3.9 3.9 0 0 1-1.6-1.6l.6-.8-.9-1.9-1.3.9"
      stroke={ACCENT}
    />
  </>,
);

/** Téléphone : combiné. */
export const IconTelephone = create(
  "IconTelephone",
  <>
    <path d="M5.5 3.75h3l1.4 4-1.9 1.4a11 11 0 0 0 5.8 5.8l1.4-1.9 4 1.4v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3.5 6a2 2 0 0 1 2-2.25Z" />
    <Dot cx={17.2} cy={6.8} r={1.2} />
  </>,
);

/** Courriel : enveloppe, rabat d'accent. */
export const IconMail = create(
  "IconMail",
  <>
    <rect x="3" y="5.25" width="18" height="13.5" rx="2.5" />
    <Accent d="m3.8 7.6 8.2 6 8.2-6" />
  </>,
);

/* ======================== Commerce et compte ======================== */

/** Panier : roues d'accent. */
export const IconPanier = create(
  "IconPanier",
  <>
    <path d="M2.75 4h2.5l2 10.6h9.5l1.9-7.4H6.2" />
    <Dot cx={9.4} cy={19} r={1.35} />
    <Dot cx={16.6} cy={19} r={1.35} />
  </>,
);

/** Utilisateur : buste et pastille de statut. */
export const IconUtilisateur = create(
  "IconUtilisateur",
  <>
    <circle cx={11} cy={8.4} r={3.6} />
    <path d="M4.2 20c.8-3.6 3.5-5.6 6.8-5.6s6 2 6.8 5.6" />
    <Dot cx={18.4} cy={5.6} r={1.4} />
  </>,
);

/** Devis : document et trait de saisie. */
export const IconDevis = create(
  "IconDevis",
  <>
    <path d="M6.25 3.5h7.6l4.4 4.4v12.6H6.25V3.5Z" />
    <path d="M13.85 3.5v4.4h4.4M9.4 15.6h5.2" />
    <Accent d="M9.4 11.9h5.2" />
  </>,
);

/** Vidéo : écran de lecture. */
export const IconVideo = create(
  "IconVideo",
  <>
    <rect x="3" y="5.25" width="18" height="13.5" rx="3" />
    <path d="m10.4 9.5 4.6 2.5-4.6 2.5v-5Z" fill={ACCENT} stroke={ACCENT} />
  </>,
);

/** Document PDF. */
export const IconPdf = create(
  "IconPdf",
  <>
    <path d="M6.25 3.5h7.6l4.4 4.4v12.6H6.25V3.5Z" />
    <path d="M13.85 3.5v4.4h4.4" />
    <Accent d="M9.2 13.2h5.6M9.2 16.2h3.4" />
  </>,
);

/** Cadenas : contenu protégé. */
export const IconCadenas = create(
  "IconCadenas",
  <>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" />
    <Dot cx={12} cy={15.5} r={1.3} />
  </>,
);

/** Recherche : loupe. */
export const IconRecherche = create(
  "IconRecherche",
  <>
    <circle cx={10.6} cy={10.6} r={6.4} />
    <path d="m15.4 15.4 5.1 5.1" />
    <Dot cx={10.6} cy={10.6} r={1.2} />
  </>,
);

/** Étoile : appréciation / bonus. */
export const IconEtoile = create(
  "IconEtoile",
  <>
    <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.6Z" />
  </>,
);

/** Cadeau : bonus offert. */
export const IconCadeau = create(
  "IconCadeau",
  <>
    <rect x="3.5" y="9" width="17" height="11" rx="2" />
    <path d="M2.75 9h18.5" />
    <Accent d="M12 9v11" />
    <path d="M12 9C9.2 9 7.4 7.8 7.4 6.3 7.4 5 8.4 4.2 9.6 4.2c1.6 0 2.4 2.1 2.4 4.8Zm0 0c2.8 0 4.6-1.2 4.6-2.7 0-1.3-1-2.1-2.2-2.1-1.6 0-2.4 2.1-2.4 4.8Z" />
  </>,
);

/* ======================== Fonctionnelles d'interface ======================== */
/* Pas d'accent : ces icônes doivent rester instantanément reconnaissables. */

export const IconFleche = create(
  "IconFleche",
  <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />,
);

export const IconChevronBas = create(
  "IconChevronBas",
  <path d="m6 9.5 6 6 6-6" />,
);

export const IconCroix = create("IconCroix", <path d="m6 6 12 12M18 6 6 18" />);

export const IconMenu = create(
  "IconMenu",
  <path d="M4 7h16M4 12h16M4 17h16" />,
);

export const IconCoche = create(
  "IconCoche",
  <path d="m5 12.5 4.5 4.5L19 7.5" />,
);

export const IconPlus = create("IconPlus", <path d="M12 5v14M5 12h14" />);

export const IconInfo = create(
  "IconInfo",
  <>
    <circle cx={12} cy={12} r={8.6} />
    <path d="M12 11v5.2M12 7.9v.1" />
  </>,
);

export const IconAlerte = create(
  "IconAlerte",
  <>
    <path d="M12 3.6 2.8 19.4h18.4L12 3.6Z" />
    <path d="M12 10v4.4M12 16.8v.1" />
  </>,
);

export const IconLienExterne = create(
  "IconLienExterne",
  <path d="M13.5 4.5h6v6M19.5 4.5l-8 8M17 14v4.2a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18.2V8.8A1.8 1.8 0 0 1 5.8 7H10" />,
);
