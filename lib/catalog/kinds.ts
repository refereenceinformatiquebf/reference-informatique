import type { IconKey, ProductKind } from "./types";

/** Familles de la boutique : libellés, pluriels et descriptions pour les
 * filtres, les titres de page et les fiches. */
export const PRODUCT_KINDS: Record<
  ProductKind,
  { label: string; plural: string; description: string; icon: IconKey }
> = {
  cle: {
    label: "Clé de formations",
    plural: "Clés de formations",
    description:
      "Une clé USB livrée chez vous, avec les formations déjà dessus. Elle fonctionne sans internet.",
    icon: "cle-usb",
  },
  formation: {
    label: "Formation",
    plural: "Formations",
    description:
      "Des formations complètes, à suivre à votre rythme ou en direct, pour progresser vraiment.",
    icon: "formation",
  },
  ebook: {
    label: "Livre numérique",
    plural: "Livres numériques",
    description:
      "Des guides pratiques au format PDF, à lire sur téléphone, tablette ou ordinateur.",
    icon: "ebook",
  },
  pack: {
    label: "Pack d'outils",
    plural: "Packs d'outils",
    description:
      "Des outils prêts à l'emploi, regroupés pour gagner du temps dès le premier jour.",
    icon: "pack",
  },
  modele: {
    label: "Modèles",
    plural: "Modèles",
    description:
      "Des modèles professionnels à adapter : on ne repart plus de la page blanche.",
    icon: "modele",
  },
  outil: {
    label: "Outil",
    plural: "Outils",
    description:
      "Des outils pratiques pour diagnostiquer, dépanner et rester autonome.",
    icon: "outil",
  },
};

/** Ordre d'affichage des familles dans les filtres. */
export const PRODUCT_KIND_ORDER: ProductKind[] = [
  "cle",
  "formation",
  "ebook",
  "pack",
  "modele",
  "outil",
];
