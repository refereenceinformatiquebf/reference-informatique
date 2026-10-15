import { SITE } from "@/lib/site";
import type { Faq, Product } from "./types";

/**
 * Les clés de formations — le produit historique de Référence Informatique :
 * une clé USB HP livrée chez le client. L'acheteur d'une clé n'a pas d'espace à activer
 * sur le site : on lui livre la clé ; s'il se connecte ensuite, il retrouve sa commande
 * et nos recommandations dans « Mon espace ».
 *
 * Elles ne sont proposées qu'au Burkina Faso (livraison physique, support
 * local) : `restrictedTo: ["BF"]`. Hors Burkina, ni la liste, ni les fiches,
 * ni le sitemap ne les montrent (voir lib/catalog/index.ts et lib/geo.ts).
 *
 * Sources : les données réelles de l'ancien site (table `produits`, contenus,
 * FAQ, témoignages) — reformulées, jamais enrichies de chiffres inventés.
 */

const BF = ["BF"] as const;

/* Réponses communes aux quatre clés : une seule formulation, vraie partout. */
const faqLivraison: Faq = {
  question: "Comment se passe la livraison ?",
  answer:
    "Elle est gratuite partout au Burkina Faso, à domicile ou au bureau, sous 24 à 48 h après la confirmation de votre paiement.",
};

const faqPaiement: Faq = {
  question: "Comment puis-je payer ?",
  answer:
    "En ligne, par carte bancaire ou Mobile Money, sur une page de paiement sécurisée. Vous pouvez aussi commander par WhatsApp : vous payez par Orange Money, Wave ou Moov Money, puis vous nous envoyez votre reçu.",
};

const faqSupport: Faq = {
  question: "Comment contacter le support ?",
  answer: `Par WhatsApp au ${SITE.phoneDisplay}. Une vraie personne vous répond, avant comme après l'achat.`,
};

const faqPerte: Faq = {
  question: "Que se passe-t-il si je perds ma clé ?",
  answer:
    "Écrivez-nous sur WhatsApp avec votre nom et la référence de votre commande : nous cherchons une solution ensemble.",
};

export const KEYS: Product[] = [
  /* ------------------------ Clé de Formations Complètes ------------------------ */
  {
    slug: "cle-formations-completes",
    name: "Clé de Formations Complètes",
    tagline:
      "Excel, Word, PowerPoint, IA, marketing digital, anglais… tout sur une seule clé USB de 64 Go.",
    summary:
      "11 modules pour maîtriser la bureautique, l'IA et le business en ligne. Fonctionne sans internet, livrée chez vous.",
    kind: "cle",
    price: 12000,
    compareAtPrice: 25000,
    poster: {
      src: "/produits/cles/cle-formations-completes.jpg",
      alt: "Affiche de la Clé de Formations Complètes : une clé USB HP de 64 Go, à 12 000 F au lieu de 25 000 F, livraison gratuite au Burkina Faso.",
    },
    cover: { tone: "navy", motif: "cle-usb" },
    restrictedTo: BF,
    delivery: "cle-physique",
    facts: [
      { icon: "cle-usb", label: "Clé USB 64 Go" },
      { icon: "formation", label: "Tous les contenus sur la clé" },
      { icon: "hors-ligne", label: "Fonctionne sans internet" },
      { icon: "livraison", label: "Livraison gratuite" },
    ],
    story: [
      "Excel, Word, PowerPoint : on les retrouve dans la plupart des métiers de bureau, et on ne les apprend presque jamais vraiment. Résultat, on perd des heures sur des tâches qui devraient prendre dix minutes.",
      "La Clé de Formations Complètes rassemble au même endroit les formations qui servent tout de suite : la bureautique de A à Z, l'intelligence artificielle et ChatGPT, le marketing digital, l'anglais, la création visuelle avec Canva et le montage vidéo avec CapCut. À cela s'ajoutent plus de 100 livres PDF pour entreprendre.",
      "Vous branchez la clé à votre ordinateur et vous apprenez, même sans connexion internet.",
    ],
    highlights: [
      "11 modules, du niveau débutant au niveau avancé",
      "Vidéos HD et manuels PDF",
      "Fonctionne sans internet : vous branchez, vous apprenez",
      "Accès à vie : la clé est à vous, pour toujours",
      "Une attestation de formation après chaque module terminé",
      "Contenus mis à jour sans frais supplémentaires",
      "Assistance WhatsApp après l'achat",
      "Livraison gratuite partout au Burkina Faso",
    ],
    contents: [
      {
        title: "Bureautique",
        items: [
          {
            name: "Excel simple",
            detail: "Du niveau débutant au niveau intermédiaire",
          },
          {
            name: "Excel avancé",
            detail: "Formules, tableaux croisés dynamiques, macros et analyses",
          },
          {
            name: "Word de A à Z",
            detail: "Mise en page, rédaction soignée, styles et publipostage",
          },
          {
            name: "PowerPoint de A à Z",
            detail: "Des présentations professionnelles et percutantes",
          },
        ],
      },
      {
        title: "Intelligence artificielle",
        items: [
          {
            name: "Intelligence artificielle",
            detail: "Comprendre l'IA et l'utiliser dans votre travail",
          },
          {
            name: "ChatGPT",
            detail: "Écrire de bons prompts et automatiser vos tâches",
          },
        ],
      },
      {
        title: "Business et communication",
        items: [
          {
            name: "Marketing digital et business en ligne",
            detail: "Trouver des clients et vendre sur internet",
          },
          { name: "Anglais", detail: "Débutant, intermédiaire et avancé" },
          {
            name: "100 meilleurs livres PDF pour entreprendre",
            detail: "Pour développer votre leadership et vos compétences",
          },
        ],
      },
      {
        title: "Création",
        items: [
          {
            name: "Infographie et design avec Canva",
            detail:
              "Affiches, visuels et documents soignés sans être graphiste",
          },
          {
            name: "Montage vidéo avec CapCut",
            detail:
              "Monter des vidéos professionnelles depuis votre ordinateur ou téléphone",
          },
        ],
      },
    ],
    forWho: [
      "Étudiants et lycéens qui veulent maîtriser les outils bureautiques",
      "Employés et fonctionnaires qui veulent progresser dans leur carrière",
      "Entrepreneurs qui veulent utiliser l'IA et le marketing digital",
      "Enseignants qui veulent des présentations professionnelles",
      "Toute personne qui veut être à l'aise avec l'informatique",
    ],
    notForWho: [
      "Cette clé ne délivre pas de diplôme officiel : l'attestation prouve que vous avez suivi la formation, elle ne remplace pas un diplôme d'État.",
    ],
    faq: [
      {
        question: "Combien de temps ai-je accès au contenu ?",
        answer:
          "À vie. La clé USB est à vous pour toujours, sans abonnement ni limite de durée.",
      },
      faqLivraison,
      faqPaiement,
      {
        question: "La clé fonctionne-t-elle sur tous les ordinateurs ?",
        answer:
          "Oui, sur les ordinateurs Windows et Mac, sans installation particulière.",
      },
      {
        question: "Les formations conviennent-elles aux débutants ?",
        answer:
          "Oui. Chaque module commence à zéro et progresse jusqu'au niveau avancé.",
      },
      {
        question: "Y a-t-il une attestation à la fin ?",
        answer:
          "Oui, une attestation de formation est disponible après chaque module terminé.",
      },
      faqPerte,
      faqSupport,
    ],
    testimonial: {
      quote: "C'est tout simplement excellent.",
      author: "Isaac",
      city: "Ouagadougou",
    },
    seo: {
      title:
        "Clé de Formations Complètes — clé USB 64 Go, livraison gratuite au Burkina Faso",
      description:
        "11 modules : Excel, Word, PowerPoint, IA, ChatGPT, marketing digital, anglais, Canva, CapCut. Clé USB 64 Go, sans abonnement. 12 000 F, livrée chez vous.",
    },
    order: 1,
  },

  /* ----------------------------- Clé de formations SMART ----------------------------- */
  {
    slug: "cle-formations-smart",
    name: "Clé de formations SMART",
    tagline:
      "Maîtrisez votre ordinateur, gagnez du temps au bureau et osez prendre la parole.",
    summary:
      "Ordinateur, prise de parole, 150 logiciels Excel et 5 500 diapositives PowerPoint. Clé USB 32 Go livrée chez vous.",
    kind: "cle",
    price: 14000,
    compareAtPrice: 20000,
    poster: {
      src: "/produits/cles/cle-formations-smart.jpg",
      alt: "Affiche de la Clé de formations SMART : une clé USB de 32 Go avec la maîtrise de l'ordinateur, la prise de parole, 150 logiciels Excel et 5 500 diapositives PowerPoint.",
    },
    cover: { tone: "blue", motif: "cle-usb" },
    restrictedTo: BF,
    delivery: "cle-physique",
    facts: [
      { icon: "cle-usb", label: "Clé USB 32 Go" },
      { icon: "formation", label: "Tous les contenus sur la clé" },
      { icon: "hors-ligne", label: "Fonctionne sans internet" },
      { icon: "livraison", label: "Livraison gratuite" },
    ],
    story: [
      "Au bureau, le temps se perd toujours dans les mêmes tâches : refaire une facture, monter un tableau de stock, préparer une présentation pour demain matin. La clé SMART vous met entre les mains des outils déjà prêts, pour que vous partiez d'un modèle solide au lieu de la page blanche.",
      "Elle réunit la maîtrise de l'ordinateur, une formation complète à la prise de parole en public (vidéos, livres PDF et livres audio), 150 logiciels Excel prêts à l'emploi et plus de 5 500 diapositives PowerPoint professionnelles.",
      "Vous ouvrez la clé, vous choisissez le modèle qui correspond à votre besoin, vous l'adaptez à votre activité. Même sans connexion internet.",
    ],
    highlights: [
      "Maîtrise complète de l'ordinateur : Windows, clavier, fichiers",
      "Prise de parole en public : vidéos, livres PDF et livres audio",
      "150 logiciels Excel prêts à l'emploi : facturation, ventes, comptabilité, stock, budget, paie, RH",
      "Plus de 5 500 diapositives PowerPoint professionnelles, modifiables",
      "Modèles pour bilans, réunions, soutenances et présentations",
      "Fonctionne sans internet",
      "Livraison gratuite partout au Burkina Faso",
      "Assistance WhatsApp après l'achat",
    ],
    contents: [
      {
        title: "Ordinateur et communication",
        items: [
          {
            name: "Maîtrise complète de l'ordinateur",
            detail: "Windows, clavier, gestion des fichiers et mises à jour",
          },
          {
            name: "Prise de parole en public",
            detail: "Vidéos, livres PDF et livres audio",
          },
          {
            name: "Vaincre la peur de parler en public",
            detail: "Devenir éloquent et convaincant",
          },
        ],
      },
      {
        title: "Outils prêts à l'emploi",
        items: [
          {
            name: "150 logiciels Excel : facturation, ventes, comptabilité",
          },
          {
            name: "150 logiciels Excel : gestion de stock, budget, paie, RH",
          },
          {
            name: "5 500 diapositives PowerPoint professionnelles",
            detail: "Prêtes à l'emploi et modifiables",
          },
          {
            name: "Modèles pour bilans, réunions et soutenances",
          },
        ],
      },
    ],
    forWho: [
      "Employés et fonctionnaires qui veulent être plus efficaces au bureau",
      "Managers et chefs de projet qui font souvent des présentations",
      "Comptables et gestionnaires qui travaillent avec Excel",
      "Étudiants en fin d'études qui préparent leur soutenance",
      "Toute personne qui veut vaincre sa timidité et parler avec assurance",
      "Entrepreneurs qui ont besoin d'outils professionnels clés en main",
    ],
    faq: [
      {
        question: "Combien de temps ai-je accès au contenu ?",
        answer:
          "À vie. La clé USB est à vous pour toujours, sans abonnement ni limite de durée.",
      },
      {
        question: "Les 150 logiciels Excel sont-ils vraiment inclus ?",
        answer:
          "Oui, tous sont dans la clé, prêts à utiliser, sans frais supplémentaires.",
      },
      {
        question: "Les diapositives PowerPoint sont-elles modifiables ?",
        answer:
          "Absolument. Vous pouvez les modifier et les adapter à votre activité : textes, couleurs, images.",
      },
      faqLivraison,
      faqPaiement,
      {
        question: "La clé fonctionne-t-elle sur tous les ordinateurs ?",
        answer:
          "Oui, sur les ordinateurs Windows et Mac, sans installation particulière.",
      },
      faqSupport,
    ],
    testimonial: {
      quote: "Merci pour votre promptitude, j'ai beaucoup aimé, merci.",
      author: "Bobo",
    },
    seo: {
      title:
        "Clé de formations SMART — ordinateur, prise de parole, Excel et PowerPoint",
      description:
        "Maîtrise de l'ordinateur, prise de parole, 150 logiciels Excel et 5 500 diapositives PowerPoint sur une clé USB 32 Go. 14 000 F, livraison gratuite au Burkina Faso.",
    },
    order: 2,
  },

  /* ------------------------------- Clé pour Enfants ------------------------------- */
  {
    slug: "cle-enfants",
    name: "Clé pour Enfants — Informatique et Anglais",
    tagline:
      "Offrez à votre enfant une longueur d'avance : informatique et anglais, en s'amusant.",
    summary:
      "Informatique et anglais pour les 6 à 16 ans, avec dessins animés et exercices. Clé USB 32 Go, sans internet.",
    kind: "cle",
    price: 10000,
    compareAtPrice: 15000,
    poster: {
      src: "/produits/cles/cle-enfants.jpg",
      alt: "Affiche de la Clé pour Enfants : informatique et anglais en s'amusant, clé USB de 32 Go, 10 000 F au lieu de 15 000 F.",
    },
    cover: { tone: "sky", motif: "formation" },
    restrictedTo: BF,
    delivery: "cle-physique",
    facts: [
      { icon: "cle-usb", label: "Clé USB 32 Go" },
      { icon: "formation", label: "De 6 à 16 ans" },
      { icon: "hors-ligne", label: "Fonctionne sans internet" },
      { icon: "livraison", label: "Livraison gratuite" },
    ],
    story: [
      "Votre enfant passe du temps devant un écran ? Autant que ce temps lui serve. La clé pour enfants transforme l'écran en classe : il apprend à se servir d'un ordinateur dès les bases et découvre l'anglais avec des dessins animés éducatifs.",
      "La méthode est ludique et progressive. On commence par les bases, on avance par petites étapes, et des exercices interactifs gardent l'enfant motivé. Les niveaux progressifs conviennent de 6 à 16 ans.",
      "Comme toutes nos clés, elle fonctionne sans internet : idéale même là où la connexion est faible ou chère. Le contenu est conçu pour que l'enfant avance seul ; un accompagnement parental, surtout au début, reste conseillé.",
    ],
    highlights: [
      "Informatique pour enfants : prise en main de l'ordinateur dès les premiers pas",
      "Anglais pour enfants, niveau débutant : vocabulaire et bases",
      "Anglais pour enfants, niveau intermédiaire : phrases et conversation",
      "Dessins animés éducatifs pour apprendre en s'amusant",
      "Exercices interactifs adaptés à l'âge de l'enfant",
      "Méthode ludique et progressive pour rester motivé",
      "Fonctionne sans internet",
      "Livraison gratuite partout au Burkina Faso",
      "Assistance WhatsApp pour accompagner les parents",
    ],
    contents: [
      {
        title: "Informatique",
        items: [
          {
            name: "Informatique pour enfants",
            detail: "Utiliser l'ordinateur dès le début, pas à pas",
          },
        ],
      },
      {
        title: "Anglais",
        items: [
          {
            name: "Anglais pour enfants : débutant",
            detail: "Vocabulaire et bases",
          },
          {
            name: "Anglais pour enfants : intermédiaire",
            detail: "Phrases et conversation",
          },
          {
            name: "Dessins animés éducatifs",
            detail: "Pour apprendre en s'amusant",
          },
        ],
      },
      {
        title: "Pour rester motivé",
        items: [
          {
            name: "Exercices interactifs",
            detail: "Adaptés à l'âge de l'enfant",
          },
          {
            name: "Méthode ludique et progressive",
          },
        ],
      },
    ],
    forWho: [
      "Enfants qui veulent apprendre l'informatique",
      "Enfants qui veulent apprendre l'anglais de façon amusante",
      "Parents qui veulent préparer leurs enfants pour l'école et pour l'avenir",
      "Écoles et centres de formation pour enfants",
    ],
    faq: [
      {
        question: "À partir de quel âge peut-on utiliser cette clé ?",
        answer:
          "La clé est adaptée aux enfants de 6 à 16 ans, avec des niveaux progressifs.",
      },
      {
        question: "Faut-il un ordinateur pour l'utiliser ?",
        answer:
          "Oui, un ordinateur Windows ou Mac est nécessaire. En revanche, la clé fonctionne sans internet.",
      },
      {
        question: "Mon enfant peut-il l'utiliser seul ?",
        answer:
          "Oui, le contenu est conçu pour être simple et autonome. Un accompagnement des parents est quand même conseillé, surtout au début.",
      },
      faqLivraison,
      faqPaiement,
      faqSupport,
    ],
    testimonial: {
      quote:
        "Avant, ma fille passait tout son temps sur le téléphone à faire défiler TikTok sans réel intérêt. Mais depuis que nous avons découvert votre clé éducative, tout a changé ! Aujourd'hui, elle est concentrée, motivée et prend du plaisir à apprendre. Je suis vraiment impressionné par cette transformation. Merci infiniment !",
      author: "Christine Oued.",
      city: "Ouagadougou",
    },
    seo: {
      title: "Clé pour Enfants — informatique et anglais, de 6 à 16 ans",
      description:
        "Informatique et anglais pour enfants, avec dessins animés éducatifs et exercices interactifs. Clé USB 32 Go, 10 000 F, livraison gratuite au Burkina Faso.",
    },
    order: 3,
  },

  /* --------------------------- Clé Complète Tout-en-Un --------------------------- */
  {
    slug: "cle-tout-en-un",
    name: "Clé Complète Tout-en-Un (64 Go)",
    tagline:
      "La Clé de Formations Complètes et la Clé SMART réunies sur une seule clé de 64 Go.",
    summary:
      "13 modules : bureautique, IA, marketing, anglais, Canva, CapCut, prise de parole, 150 logiciels Excel et 5 500 diapositives.",
    kind: "cle",
    price: 16000,
    // Prix de référence = la somme réelle des deux clés (12 000 + 14 000), le
    // seul chiffre que le client peut vérifier lui-même sur le site.
    compareAtPrice: 26000,
    badge: "Notre offre la plus complète",
    poster: {
      src: "/produits/cles/cle-tout-en-un.jpg",
      alt: "Affiche de l'offre Tout-en-Un : une clé USB HP de 64 Go avec la liste des modules, un antivirus offert et la livraison gratuite au Burkina Faso.",
    },
    cover: { tone: "deep", motif: "cle-usb" },
    restrictedTo: BF,
    delivery: "cle-physique",
    facts: [
      { icon: "cle-usb", label: "Clé USB 64 Go" },
      { icon: "pack", label: "13 modules" },
      { icon: "formation", label: "Tous les contenus sur la clé" },
      { icon: "livraison", label: "Livraison gratuite" },
    ],
    story: [
      "Vous hésitez entre la Clé de Formations Complètes et la Clé SMART ? Ne choisissez pas : la clé Tout-en-Un réunit les deux sur un seul support de 64 Go.",
      "Acheter les deux clés séparément coûte 26 000 F. Avec la Tout-en-Un, vous payez 16 000 F : 10 000 F d'économie, et un seul support à ranger au lieu de deux.",
      "C'est la clé de celles et ceux qui veulent tout apprendre d'un seul coup : bureautique, intelligence artificielle, marketing digital, anglais, création visuelle, prise de parole, et une bibliothèque d'outils prêts à l'emploi pour travailler plus vite dès le premier jour.",
    ],
    highlights: [
      "13 modules sur une seule clé de 64 Go",
      "10 000 F d'économie par rapport aux deux clés achetées séparément",
      "Bonus : antivirus Avast gratuit",
      "Fonctionne sans internet : vous branchez, vous apprenez",
      "Livraison gratuite partout au Burkina Faso",
      "Assistance WhatsApp après l'achat",
    ],
    contents: [
      {
        title: "Bureautique",
        items: [
          {
            name: "Excel simple et avancé",
            detail: "De débutant à expert",
          },
          {
            name: "Word de A à Z",
            detail: "Mise en page et publipostage",
          },
          {
            name: "PowerPoint de A à Z",
            detail: "Des présentations professionnelles",
          },
        ],
      },
      {
        title: "Intelligence artificielle et business",
        items: [
          {
            name: "Intelligence artificielle et ChatGPT",
            detail: "Comprendre, écrire de bons prompts, automatiser",
          },
          {
            name: "Marketing digital et business en ligne",
          },
          {
            name: "100 meilleurs livres PDF pour entreprendre",
          },
        ],
      },
      {
        title: "Langues et communication",
        items: [
          { name: "Anglais", detail: "Débutant, intermédiaire et avancé" },
          {
            name: "Prise de parole en public",
            detail: "Vidéos, livres PDF et livres audio",
          },
        ],
      },
      {
        title: "Ordinateur et création",
        items: [
          {
            name: "Maîtrise complète de l'ordinateur",
            detail: "Avec un antivirus Avast gratuit en bonus",
          },
          {
            name: "Infographie et design avec Canva",
          },
          {
            name: "Montage vidéo avec CapCut",
          },
        ],
      },
      {
        title: "Outils prêts à l'emploi",
        items: [
          {
            name: "150 logiciels Excel",
            detail: "Facturation, stock, comptabilité, budget",
          },
          {
            name: "5 500 diapositives PowerPoint",
            detail: "Professionnelles et prêtes à l'emploi",
          },
        ],
      },
    ],
    forWho: [
      "Toute personne qui veut tout apprendre en une seule fois",
      "Professionnels qui veulent gagner en productivité",
      "Entrepreneurs qui veulent maîtriser tous les outils numériques",
      "Étudiants qui veulent se démarquer sur le marché du travail",
      "Toute personne qui cherche le meilleur rapport qualité-prix",
    ],
    faq: [
      {
        question: "Quelle différence avec la Clé de Formations Complètes ?",
        answer:
          "La Tout-en-Un combine la Clé de Formations Complètes et la Clé SMART : c'est presque le double de contenu sur une seule clé.",
      },
      {
        question: "Combien est-ce que j'économise ?",
        answer:
          "Les deux clés achetées séparément coûtent 26 000 F ; la Tout-en-Un est à 16 000 F, soit 10 000 F d'économie.",
      },
      {
        question: "Combien de temps ai-je accès au contenu ?",
        answer:
          "À vie. La clé USB est à vous pour toujours, sans abonnement ni limite de durée.",
      },
      faqLivraison,
      faqPaiement,
      {
        question: "La clé fonctionne-t-elle sur tous les ordinateurs ?",
        answer:
          "Oui, sur les ordinateurs Windows et Mac, sans installation particulière.",
      },
      faqSupport,
    ],
    testimonial: {
      quote:
        "Franchement, j'étais sceptique au début, mais après avoir reçu la clé j'ai été bluffé par la quantité et la qualité du contenu. Je suis très satisfait, je vous recommande !",
      author: "Aristide Traoré",
      city: "Koudougou",
    },
    seo: {
      title:
        "Clé Complète Tout-en-Un 64 Go — 13 modules, livraison gratuite au Burkina Faso",
      description:
        "Formations Complètes + Clé SMART sur une seule clé USB de 64 Go : 13 modules, 150 logiciels Excel, 5 500 diapositives. 16 000 F au lieu de 26 000 F.",
    },
    order: 4,
  },
];
