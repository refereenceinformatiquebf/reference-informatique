import { SITE } from "@/lib/site";
import type { Faq, Product } from "./types";

/**
 * Produits numériques, disponibles pour tous les visiteurs (aucune
 * restriction de pays), repris du catalogue d'Expert du Numérique puis
 * entièrement réécrits : présentation à la charte, rédaction à la manière
 * de 360 Digital (vouvoiement, phrases courtes, promesses vérifiables).
 *
 * Non repris volontairement : le « Pack Windows + Office, activation à vie »
 * (repose sur un outil de contournement de licence) et les huit logiciels
 * Sage 100 i7 vendus 4 900 F (aucune licence légale possible à ce prix).
 */

const faqLivraisonNumerique: Faq = {
  question: "Comment vais-je recevoir mon achat ?",
  answer:
    "Dès que votre paiement est confirmé, vous recevez un email avec un lien personnel : un clic ouvre votre achat, sans mot de passe ni compte à créer. Vous le retrouvez ensuite dans votre espace client, rubrique « Mes formations ». Aucune attente de livraison.",
};

const faqPaiementNumerique: Faq = {
  question: "Comment puis-je payer ?",
  answer:
    "Par carte bancaire ou Mobile Money, sur une page de paiement sécurisée : nous ne voyons jamais vos codes. Si vous préférez, vous pouvez aussi commander par WhatsApp.",
};

const faqAcces: Faq = {
  question: "Je n'arrive pas à ouvrir mon accès, que faire ?",
  answer: `Écrivez-nous sur WhatsApp au ${SITE.phoneDisplay} en indiquant votre nom et le produit commandé. Nous vérifions et nous vous aidons tout de suite.`,
};

export const PRODUCTS: Product[] = [
  /* ------------------------ Pack de Formations Complètes ------------------------ */
  {
    slug: "pack-formations-completes-office-ia",
    name: "Pack de Formations Complètes : Excel, Word, PowerPoint, Access et IA",
    tagline:
      "Les outils que les employeurs attendent de vous, et l'intelligence artificielle pour les utiliser plus vite.",
    summary:
      "Excel, Word, PowerPoint, Access et IA réunis dans un seul accès, à suivre à votre rythme.",
    kind: "formation",
    price: 9900,
    cover: { tone: "navy", motif: "formation" },
    poster: {
      src: "/produits/affiches/pack-formations-completes-office-ia.webp",
      alt: "Pack de Formations Complètes : Excel de A à Z, Excel et IA, Word, PowerPoint, Access et intelligence artificielle réunis dans un seul accès à vie.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "acces-a-vie", label: "Accès à vie" },
      { icon: "video", label: "Vidéos et supports" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Savoir « se débrouiller » sur un ordinateur ne suffit plus. On attend de vous un tableau clair, un rapport propre, une présentation qui tient la route, et de plus en plus souvent de savoir utiliser l'intelligence artificielle au quotidien.",
      "Ce pack réunit en un seul accès les formations qui servent chaque jour : Excel de A à Z, Excel combiné à l'IA pour automatiser vos calculs, Word, PowerPoint, Access pour vos bases de données, et une initiation pratique à l'intelligence artificielle.",
      "Vous avancez à votre rythme, vous revenez sur une leçon autant de fois que nécessaire, et vous appliquez tout de suite à votre travail ou à vos études.",
    ],
    highlights: [
      "Excel de A à Z : tableaux professionnels, formules avancées, graphiques clairs",
      "Excel et intelligence artificielle : automatiser vos calculs et gagner du temps sur l'analyse de données",
      "Word : mise en forme rapide, rapports et CV professionnels",
      "PowerPoint : présentations structurées et modernes pour vos réunions et soutenances",
      "Access : gérer vos bases de données efficacement",
      "Initiation à l'intelligence artificielle : les bases pour l'utiliser dans vos projets, sans être expert",
      "Accès à vie, à suivre à votre rythme",
    ],
    contents: [
      {
        title: "Les formations du pack",
        items: [
          {
            name: "Excel de A à Z",
            detail: "Tableaux professionnels, formules avancées, graphiques",
          },
          {
            name: "Excel et IA",
            detail: "Automatiser les calculs et l'analyse de données",
          },
          { name: "Word", detail: "Rapports, CV et documents professionnels" },
          {
            name: "PowerPoint",
            detail: "Présentations modernes pour réunions et soutenances",
          },
          { name: "Access", detail: "Créer et gérer des bases de données" },
          {
            name: "Intelligence artificielle",
            detail: "Les bases pour s'en servir dans vos projets",
          },
        ],
      },
    ],
    forWho: [
      "Étudiants et jeunes diplômés qui préparent leur entrée dans la vie active",
      "Salariés qui veulent gagner du temps et se rendre indispensables",
      "Entrepreneurs qui gèrent eux-mêmes leurs documents, leurs chiffres et leurs présentations",
      "Toute personne qui veut utiliser l'IA sans jargon",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Faut-il déjà savoir utiliser Excel ou Word ?",
        answer:
          "Non. Les formations partent des bases et vous emmènent vers un usage avancé : vous choisissez le point de départ qui vous convient.",
      },
      {
        question: "Combien de temps ai-je accès au pack ?",
        answer:
          "À vie : vous pouvez revoir les leçons quand vous voulez, sans limite de durée.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title:
        "Pack de Formations Complètes : Excel, Word, PowerPoint, Access et IA",
      description:
        "Excel, Word, PowerPoint, Access et intelligence artificielle réunis dans un seul accès à vie. 9 900 F, accès immédiat après paiement.",
    },
    order: 10,
  },

  /* ------------------------------ +120 logiciels Excel ------------------------------ */
  {
    slug: "pack-120-logiciels-excel",
    name: "Pack de plus de 120 logiciels Excel",
    tagline:
      "Facturation, stock, comptabilité, paie : des outils Excel prêts à l'emploi, sans repartir de zéro.",
    summary:
      "Plus de 120 outils Excel prêts à l'emploi pour facturer, gérer votre stock, votre budget, votre paie et votre comptabilité.",
    kind: "pack",
    price: 4900,
    cover: { tone: "blue", motif: "pack" },
    poster: {
      src: "/produits/affiches/pack-120-logiciels-excel.webp",
      alt: "Pack de plus de 120 logiciels Excel : facturation, stock, paie, budget et comptabilité, avec une formation Excel et 100 livres PDF en bonus.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "logiciel", label: "Fichiers modifiables" },
      { icon: "ordinateur", label: "Fonctionne sous Excel" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Entre deux clients, vous refaites une facture ? Vous recopiez votre stock dans un tableau qui se casse dès qu'on y touche ? Un bon fichier Excel déjà construit vous épargne des heures chaque semaine.",
      "Ce pack réunit plus de 120 outils Excel prêts à l'emploi : facturation, gestion de projet, comptabilité, gestion de stock, budget, paie, ressources humaines… Pas de configuration compliquée : vous ouvrez le fichier, vous remplacez les exemples par vos données, ça fonctionne.",
      "C'est une façon de professionnaliser votre gestion sans payer un logiciel coûteux, et de gagner un temps précieux au bureau.",
    ],
    highlights: [
      "Facturation et suivi des paiements clients",
      "Gestion de projet, budget prévisionnel et plan de financement",
      "Comptabilité générale, plan comptable SYSCOHADA révisé, rapprochement bancaire",
      "Gestion de stock, paie et ressources humaines",
      "Fichiers 100 % modifiables, à adapter à votre activité",
      "Bonus : une formation complète à Excel avec exercices pratiques",
      "Bonus : 100 livres PDF sur l'entrepreneuriat",
    ],
    contents: [
      {
        title: "Ce que vous trouvez dans le pack",
        items: [
          {
            name: "Facturation",
            detail: "Factures, devis et suivi des paiements clients",
          },
          {
            name: "Gestion de projet et budget",
            detail: "Planning, budget prévisionnel, plan de financement",
          },
          {
            name: "Comptabilité",
            detail:
              "Comptabilité générale, plan comptable SYSCOHADA révisé, rapprochement bancaire",
          },
          {
            name: "Stock, paie et RH",
            detail: "Suivi des stocks, bulletins de paie, gestion du personnel",
          },
          {
            name: "Bonus : formation Excel",
            detail: "Formation complète avec exercices pratiques",
          },
          { name: "Bonus : 100 livres PDF", detail: "Sur l'entrepreneuriat" },
        ],
      },
    ],
    forWho: [
      "Entrepreneurs et commerçants qui veulent structurer leur gestion sans logiciel coûteux",
      "Comptables, gestionnaires et assistants qui veulent des modèles fiables",
      "Salariés qui veulent gagner du temps au bureau",
      "Associations et petites structures qui suivent un budget ou un stock",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Faut-il Microsoft Excel pour utiliser ces fichiers ?",
        answer:
          "Oui, ce sont des classeurs Excel : il vous faut Excel installé sur votre ordinateur. Ils sont conçus pour fonctionner dès l'ouverture, sans configuration.",
      },
      {
        question: "Puis-je modifier les fichiers pour mon activité ?",
        answer:
          "Oui, ils sont entièrement modifiables : vous adaptez les libellés, les colonnes et les formules à votre manière de travailler.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title:
        "Pack de plus de 120 logiciels Excel : facturation, stock, comptabilité, paie",
      description:
        "Plus de 120 outils Excel prêts à l'emploi : facturation, gestion de projet, comptabilité SYSCOHADA, stock, paie. 4 900 F, accès immédiat après paiement.",
    },
    order: 11,
  },

  /* --------------------------- 5 500 diapositives PowerPoint --------------------------- */
  {
    slug: "pack-5500-diapositives-powerpoint",
    name: "Pack de plus de 5 500 diapositives PowerPoint",
    tagline:
      "Votre présentation est pour demain ? Choisissez un modèle, ajoutez votre contenu, c'est prêt.",
    summary:
      "Plus de 5 500 diapositives modernes et modifiables pour vos réunions, soutenances et présentations professionnelles.",
    kind: "modele",
    price: 4900,
    compareAtPrice: 25000,
    cover: { tone: "sky", motif: "modele" },
    poster: {
      src: "/produits/affiches/pack-5500-diapositives-powerpoint.webp",
      alt: "Pack de plus de 5 500 diapositives PowerPoint : des modèles modernes et modifiables pour vos réunions et vos soutenances.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "modele", label: "100 % modifiables" },
      { icon: "ordinateur", label: "Fonctionne sous PowerPoint" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Ouvrir PowerPoint devant une page blanche, la veille d'une réunion ou d'une soutenance, c'est l'un des moments les plus stressants du travail de bureau. Ce pack vous évite de repartir de zéro.",
      "Plus de 5 500 diapositives professionnelles couvrent les situations courantes : stratégie de croissance, innovation, présentation de projet, résultats clés, expansion internationale, présentation d'équipe… Les designs sont modernes, adaptés à tous les secteurs, et entièrement modifiables.",
      "Il ne vous reste qu'à insérer votre contenu, vos couleurs et votre logo.",
    ],
    highlights: [
      "Plus de 5 500 diapositives modernes et professionnelles, tous secteurs confondus",
      "Entièrement modifiables : texte, couleurs, images et graphiques",
      "Modèles adaptés aux bilans, réunions, soutenances académiques et conférences",
      "Un design soigné, pensé pour retenir l'attention dès la première diapositive",
      "Bonus : une formation complète à PowerPoint",
      "Bonus : des livres PDF sur l'entrepreneuriat",
    ],
    contents: [
      {
        title: "Situations couvertes",
        items: [
          { name: "Stratégie et croissance" },
          { name: "Innovation et présentation de projet" },
          { name: "Résultats clés et bilans" },
          { name: "Expansion internationale" },
          { name: "Présentation d'équipe" },
          { name: "Soutenances académiques et conférences" },
        ],
      },
    ],
    forWho: [
      "Étudiants qui préparent une soutenance",
      "Salariés et managers qui présentent régulièrement en réunion",
      "Entrepreneurs qui présentent leur activité à des clients ou des partenaires",
      "Enseignants et formateurs qui créent leurs supports",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Les diapositives sont-elles vraiment modifiables ?",
        answer:
          "Oui, entièrement : textes, couleurs, images, graphiques. Vous les adaptez à votre marque et à votre contenu.",
      },
      {
        question: "Quel logiciel faut-il ?",
        answer:
          "Microsoft PowerPoint. Les modèles sont conçus pour s'ouvrir et se modifier dans PowerPoint.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title: "Pack de plus de 5 500 diapositives PowerPoint modifiables",
      description:
        "Plus de 5 500 diapositives modernes et 100 % modifiables pour vos réunions, soutenances et présentations. 4 900 F, accès immédiat après paiement.",
    },
    order: 12,
  },

  /* --------------------------- Prise de parole en public --------------------------- */
  {
    slug: "prise-de-parole-en-public",
    name: "Pack Prise de Parole en Public",
    tagline:
      "Transformez le trac en énergie : structurez votre discours et convainquez, à l'oral comme au bureau.",
    summary:
      "Des formations vidéo pour vaincre le trac, structurer votre discours et convaincre, avec des livres et audios en bonus.",
    kind: "formation",
    price: 3900,
    cover: { tone: "navy", motif: "formation" },
    poster: {
      src: "/produits/affiches/prise-de-parole-en-public.webp",
      alt: "Pack Prise de Parole en Public : le trac et les émotions, la construction du discours, la persuasion, avec 10 livres et audios en bonus.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "video", label: "Formations vidéo" },
      { icon: "ebook", label: "Livres et audios en bonus" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Avoir le trac avant de parler n'a rien d'un défaut : c'est le signe que vous tenez à bien faire. Le vrai problème, c'est quand cette peur vous fait refuser une occasion : présenter devant votre direction, soutenir votre mémoire, pitcher devant des clients.",
      "Ce pack combine des formations vidéo pratiques (respirer, structurer son discours, capter l'attention dès les premières secondes) et une sélection de livres PDF et audio sur l'éloquence et l'influence.",
      "Vous apprenez à transformer le trac en énergie plutôt qu'en blocage, et vous mettez en pratique dès la première vidéo.",
    ],
    highlights: [
      "Vaincre la peur et maîtriser ses émotions avant de parler",
      "Structurer un discours qui capte l'attention dès les premières secondes",
      "Convaincre naturellement, sans forcer : langage verbal et non verbal",
      "10 livres et audios en bonus sur l'éloquence, la persuasion et l'influence",
    ],
    contents: [
      {
        title: "Ce que vous travaillez",
        items: [
          {
            name: "Le trac et les émotions",
            detail: "Garder le contrôle avant et pendant la prise de parole",
          },
          {
            name: "La construction du discours",
            detail: "Accroches, argumentation, fil conducteur",
          },
          { name: "La persuasion", detail: "Langage verbal et non verbal" },
          {
            name: "Bonus : 10 livres et audios",
            detail: "Éloquence, persuasion et influence",
          },
        ],
      },
    ],
    forWho: [
      "Étudiants qui préparent une soutenance ou un exposé",
      "Salariés et managers qui présentent en réunion",
      "Entrepreneurs qui doivent convaincre des clients ou des partenaires",
      "Toute personne qui veut être plus à l'aise à l'oral",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Je suis très timide : est-ce pour moi ?",
        answer:
          "Oui, c'est même pour vous. Les formations partent du trac et de la peur de parler : vous avancez à votre rythme, seul(e) chez vous.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title:
        "Pack Prise de Parole en Public : vaincre le trac, convaincre à l'oral",
      description:
        "Formations vidéo pour maîtriser le trac, structurer votre discours et convaincre, avec 10 livres et audios en bonus. 3 900 F, accès immédiat.",
    },
    order: 13,
  },

  /* ----------------------------- Formation en anglais ----------------------------- */
  {
    slug: "formation-anglais-professionnel",
    name: "Pack de Formation en Anglais",
    tagline:
      "De l'anglais de tous les jours à l'anglais des affaires, du niveau débutant au niveau avancé.",
    summary:
      "250 vidéos, 200 exercices, 250 audios et 150 fiches PDF pour progresser en anglais à votre rythme.",
    kind: "formation",
    price: 2900,
    cover: { tone: "blue", motif: "formation" },
    poster: {
      src: "/produits/affiches/formation-anglais-professionnel.webp",
      alt: "Pack de Formation en Anglais : 250 vidéos, 200 exercices, 250 audios et 150 fiches PDF, du niveau débutant au niveau avancé.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "acces-a-vie", label: "Accès à vie" },
      { icon: "video", label: "Vidéos, audios et fiches" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "L'anglais ouvre des portes : un emploi, une bourse d'études, un client à l'étranger, ou simplement la possibilité de comprendre une documentation qui n'existe qu'en anglais.",
      "Ce pack vous accompagne du niveau débutant au niveau avancé, avec 250 vidéos, 200 exercices, 250 audios et 150 fiches PDF. Vous progressez en anglais général, en anglais professionnel et en anglais des affaires, à votre propre rythme.",
      "Les audios vous entraînent à comprendre à l'oral et à soigner votre accent ; les fiches PDF vous donnent le vocabulaire, la grammaire et des exercices corrigés à garder sous la main.",
    ],
    highlights: [
      "250 vidéos de formation, du niveau débutant au niveau avancé",
      "200 exercices pour pratiquer",
      "250 audios pour la compréhension orale et l'accent",
      "150 fiches PDF : vocabulaire, grammaire, exercices corrigés",
      "Anglais général, professionnel et des affaires, avec des mises en situation réelles",
      "Accès à vie : vous apprenez à votre rythme",
    ],
    contents: [
      {
        title: "Le contenu du pack",
        items: [
          {
            name: "250 vidéos de formation",
            detail: "Du niveau débutant au niveau avancé",
          },
          {
            name: "200 exercices",
            detail: "Pour mettre en pratique ce que vous apprenez",
          },
          { name: "250 audios", detail: "Compréhension orale et accent" },
          {
            name: "150 fiches PDF",
            detail: "Vocabulaire, grammaire, exercices corrigés",
          },
        ],
      },
    ],
    forWho: [
      "Étudiants qui visent une bourse ou des études à l'étranger",
      "Candidats à l'emploi et professionnels qui veulent un atout de plus sur leur CV",
      "Entrepreneurs qui travaillent avec des partenaires étrangers",
      "Toute personne qui veut comprendre et parler anglais avec confiance",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Je pars de zéro : est-ce adapté ?",
        answer:
          "Oui. Le pack commence au niveau débutant et monte progressivement jusqu'au niveau avancé.",
      },
      {
        question: "Combien de temps ai-je accès au contenu ?",
        answer:
          "À vie : vous apprenez à votre rythme et vous pouvez tout revoir quand vous voulez.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title:
        "Pack de Formation en Anglais : 250 vidéos, 250 audios, 150 fiches PDF",
      description:
        "Apprenez l'anglais général, professionnel et des affaires, du niveau débutant à avancé : 250 vidéos, 200 exercices, 250 audios. 2 900 F, accès à vie.",
    },
    order: 14,
  },

  /* ------------------------------ Le Chercheur Augmenté ------------------------------ */
  {
    slug: "le-chercheur-augmente",
    name: "Le Chercheur Augmenté : Guide IA pour la Recherche Académique",
    tagline:
      "Utilisez l'intelligence artificielle à chaque étape de votre recherche, sans jamais sacrifier la rigueur.",
    summary:
      "Un guide pratique : prompts académiques, revue de littérature, analyse de données et rédaction, avec une checklist de vérification.",
    kind: "ebook",
    price: 6000,
    compareAtPrice: 25000,
    cover: { tone: "deep", motif: "ebook" },
    poster: {
      src: "/produits/affiches/le-chercheur-augmente.webp",
      alt: "Le Chercheur Augmenté : guide IA pour la recherche académique, avec des prompts, une revue de littérature flash et une checklist de vérification.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "pdf", label: "Guide au format PDF" },
      { icon: "ordinateur", label: "Lisible sur tous vos appareils" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "La page blanche devant l'écran. Des nuits passées à trier des dizaines d'articles. L'impression que d'autres chercheurs avancent plus vite que vous, sans que vous sachiez comment. Beaucoup de doctorants et d'étudiants connaissent ces moments pendant la rédaction.",
      "Ce qui change la donne, ce n'est pas de travailler plus d'heures : c'est de savoir où l'intelligence artificielle peut réellement vous faire gagner du temps (revue de littérature, analyse de données, rédaction), sans jamais relâcher l'exigence scientifique.",
      "Le Chercheur Augmenté est une méthode pratique : des prompts académiques prêts à l'emploi, une façon de cartographier un domaine de recherche en quelques heures, et une checklist stricte pour vérifier chaque résultat produit par l'IA avant de vous en servir.",
    ],
    highlights: [
      "Ingénierie des prompts académiques : une bibliothèque de prompts prêts à copier-coller",
      "Revue de littérature flash avec Perplexity, Consensus, Elicit et Connected Papers",
      "Analyse de données sans code : statistiques et graphiques en langage naturel",
      "Codage thématique qualitatif : structurer vos verbatims d'entretiens",
      "Productivité universitaire : veille scientifique, plans de cours, QCM, relecture de mémoires",
      "Préparation de présentations pour vos soutenances et conférences",
      "Éthique et intégrité scientifique : une checklist contre l'hallucination, le plagiat et les atteintes à la confidentialité",
      "Bonus : initiation pratique aux agents IA pour automatiser vos travaux de recherche",
    ],
    contents: [
      {
        title: "Les parties du guide",
        items: [
          {
            name: "Prompts académiques",
            detail: "Obtenir des réponses précises plutôt que génériques",
          },
          {
            name: "Revue de littérature flash",
            detail: "Cartographier un domaine avec les bons outils",
          },
          {
            name: "Analyse de données sans code",
            detail: "Nettoyer vos bases, produire statistiques et graphiques",
          },
          {
            name: "Codage thématique qualitatif",
            detail: "Un tableau de codes à partir de vos entretiens",
          },
          {
            name: "Productivité universitaire",
            detail: "Veille, plans de cours, QCM, relecture",
          },
          {
            name: "Éthique et intégrité scientifique",
            detail: "Vérifier chaque résultat avant de l'utiliser",
          },
          {
            name: "Bonus : agents IA",
            detail: "Automatiser vos workflows de recherche",
          },
        ],
      },
    ],
    forWho: [
      "Doctorants et étudiants en master qui rédigent un mémoire ou une thèse",
      "Chercheurs et enseignants-chercheurs qui veulent gagner du temps",
      "Toute personne qui doit produire un travail académique rigoureux",
    ],
    notForWho: [
      "Ce guide ne rédige pas votre travail à votre place : il vous apprend à vous faire aider par l'IA tout en gardant la maîtrise de votre recherche.",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "L'IA risque-t-elle de fausser ma recherche ?",
        answer:
          "C'est précisément pour cela que le guide inclut une checklist de vérification : elle vous aide à repérer les erreurs, les sources inventées et les risques de plagiat avant d'utiliser un résultat.",
      },
      {
        question: "Quel est le format du guide ?",
        answer:
          "Un fichier PDF, lisible sur ordinateur, tablette et téléphone.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title: "Le Chercheur Augmenté : guide IA pour la recherche académique",
      description:
        "Prompts académiques, revue de littérature, analyse de données, rédaction : utilisez l'IA dans votre recherche sans sacrifier la rigueur. 6 000 F, accès immédiat.",
    },
    order: 15,
  },

  /* ---------------------------- Comprends ce qu'elle traverse ---------------------------- */
  {
    slug: "comprends-ce-quelle-traverse",
    name: "Comprends ce qu'elle traverse : guide de bien-être féminin",
    tagline:
      "Fatigue, tristesse, bouffées de chaleur, irritabilité : comprendre ce que le corps essaie de dire.",
    summary:
      "Un guide simple et bienveillant pour comprendre les signaux du corps et savoir quoi observer, sans remplacer un avis médical.",
    kind: "ebook",
    price: 3900,
    compareAtPrice: 15000,
    cover: { tone: "sky", motif: "ebook" },
    poster: {
      src: "/produits/affiches/comprends-ce-quelle-traverse.webp",
      alt: "Comprends ce qu'elle traverse : guide de bien-être féminin sur la fatigue, la tristesse, les bouffées de chaleur et l'irritabilité. Ne remplace pas un avis médical.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "pdf", label: "Guide au format PDF" },
      { icon: "ordinateur", label: "Lisible sur tous vos appareils" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Une fatigue qui ne part pas, même après une nuit de sommeil. Une tristesse qui arrive sans raison claire. Des bouffées de chaleur en pleine journée. Une irritabilité qu'on ne se reconnaît pas. Beaucoup de femmes vivent ces signaux en silence, sans savoir qu'ils sont souvent liés.",
      "Ce guide explique simplement ce que le corps essaie de dire à ces moments-là. Il propose des pistes pratiques et bienveillantes pour retrouver son équilibre au quotidien : sommeil, alimentation, gestion du stress.",
      "Il ne remplace pas un avis médical. Il vous aide à savoir quoi observer, quelles questions poser, et quand consulter un professionnel de santé.",
    ],
    highlights: [
      "Comprendre pourquoi fatigue, tristesse, bouffées de chaleur et irritabilité vont souvent ensemble",
      "Des explications simples, sans jargon médical",
      "Des conseils pratiques pour le quotidien : sommeil, alimentation, gestion du stress",
      "Savoir quand consulter un professionnel de santé",
    ],
    forWho: [
      "Les femmes qui traversent ces signaux et veulent mieux les comprendre",
      "Les proches (conjoint, famille, amis) qui veulent soutenir avec justesse",
    ],
    notForWho: [
      "Ce guide est une aide à la compréhension, pas un diagnostic ni un traitement. En cas de doute ou de symptômes inquiétants, consultez un professionnel de santé.",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Ce guide remplace-t-il une consultation médicale ?",
        answer:
          "Non. Il vous aide à comprendre ce que vous ressentez et à préparer vos questions, mais seul un professionnel de santé peut poser un diagnostic.",
      },
      {
        question: "Quel est le format du guide ?",
        answer:
          "Un fichier PDF, lisible sur ordinateur, tablette et téléphone.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title: "Comprends ce qu'elle traverse : guide de bien-être féminin",
      description:
        "Fatigue, tristesse, bouffées de chaleur, irritabilité : un guide simple et bienveillant pour comprendre les signaux du corps. 3 900 F, accès immédiat.",
    },
    order: 16,
  },

  /* ------------------------ Les Vérités Cachées qui Détruisent les Couples ------------------------ */
  {
    slug: "verites-cachees-couples",
    name: "Les Vérités Cachées qui Détruisent les Couples",
    tagline:
      "Ce n'est pas la dispute qui abîme un couple : c'est le silence d'avant. Un livre pour en sortir.",
    summary:
      "Un livre PDF de 76 pages sur les non-dits, les besoins qu'on n'exprime pas et la communication qui répare.",
    kind: "ebook",
    price: 3000,
    cover: { tone: "deep", motif: "ebook" },
    poster: {
      src: "/produits/affiches/verites-cachees-couples.webp",
      alt: "Les Vérités Cachées qui Détruisent les Couples : un livre PDF de 76 pages sur les non-dits et la communication qui répare.",
    },
    delivery: "numerique",
    facts: [
      { icon: "eclair", label: "Accès immédiat" },
      { icon: "pdf", label: "Livre PDF de 76 pages" },
      { icon: "ordinateur", label: "Lisible sur tous vos appareils" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Une baisse de communication. Une conversation difficile qu'on évite « pour cette fois ». Une distance qui s'installe sans dispute, sans cri : juste un silence qui prend de la place. C'est ainsi que commencent beaucoup de séparations, rarement par un grand drame, plus souvent par une accumulation de non-dits.",
      "Ce livre PDF de 76 pages met des mots sur ce que beaucoup de couples vivent sans jamais en parler : les besoins qu'on n'exprime pas, les blessures d'enfance qui rejouent dans les disputes d'aujourd'hui, le langage de l'autre qu'on ne comprend pas encore.",
      "Il propose surtout des outils concrets, à commencer par une règle simple : parler en « je » plutôt qu'en « tu ».",
    ],
    highlights: [
      "Les blessures cachées : pourquoi les disputes d'aujourd'hui viennent souvent de blessures anciennes",
      "Les besoins fondamentaux, rarement exprimés, et comment y répondre au quotidien",
      "La communication qui répare : transformer une dispute en dialogue et écouter sans juger",
      "Les défis modernes : téléphone et réseaux sociaux, jalousie, belle-famille, confiance à reconstruire",
      "Les choix et les petits rituels des couples qui durent",
    ],
    forWho: [
      "Les couples qui sentent une distance s'installer",
      "Les personnes qui veulent améliorer la communication avec leur partenaire",
      "Les futurs mariés qui veulent construire sur de bonnes bases",
    ],
    notForWho: [
      "Ce livre n'est pas une thérapie. En cas de violence ou de souffrance importante, adressez-vous à un professionnel ou à une structure d'accompagnement.",
    ],
    faq: [
      faqLivraisonNumerique,
      {
        question: "Quel est le format du livre ?",
        answer:
          "Un fichier PDF de 76 pages, lisible sur ordinateur, tablette et téléphone.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title:
        "Les Vérités Cachées qui Détruisent les Couples : livre PDF de 76 pages",
      description:
        "Non-dits, besoins non exprimés, communication qui répare : un livre PDF de 76 pages pour les couples. 3 000 F, accès immédiat après paiement.",
    },
    order: 17,
  },

  /* ----------------------- Formation Maintenance Logicielle ----------------------- */
  {
    slug: "formation-maintenance-logicielle",
    name: "Formation Maintenance Logicielle : devenez autonome sur votre PC",
    tagline:
      "Douze modules en direct, 100 % pratiques, pour dépanner, sécuriser et optimiser votre ordinateur vous-même.",
    summary:
      "12 modules en direct et en ligne : Windows, bureautique, cybersécurité et IA. Groupes limités à 15 personnes, attestation incluse.",
    kind: "formation",
    price: 6000,
    compareAtPrice: 10000,
    cover: { tone: "deep", motif: "outil" },
    poster: {
      src: "/produits/affiches/formation-maintenance-logicielle.webp",
      alt: "Formation Maintenance Logicielle : 12 modules en direct sur 20 jours, groupes de 15 personnes maximum, attestation de participation.",
    },
    delivery: "manuel",
    facts: [
      { icon: "video", label: "En direct, 100 % en ligne" },
      { icon: "pack", label: "12 modules sur 20 jours" },
      { icon: "formation", label: "Groupes de 15 personnes maximum" },
      { icon: "certificat", label: "Attestation incluse" },
    ],
    story: [
      "Le Wi-Fi qui ne se connecte plus, l'imprimante qui refuse d'imprimer, le PC qui rame, le virus qu'on a peur d'avoir attrapé… Chaque panne coûte du temps, et souvent de l'argent quand il faut appeler un technicien pour un problème simple.",
      "Cette formation vous apprend à les résoudre vous-même. Elle est animée en direct, 100 % en ligne, par un ingénieur informaticien. Vous suivez 12 modules pratiques sur 20 jours, du niveau débutant à un usage avancé, en petit groupe pour que vos questions soient traitées.",
      "Vous choisissez le groupe du matin ou du soir, limité à 15 personnes. À la fin, vous recevez une attestation de participation.",
    ],
    highlights: [
      "12 modules en direct, 100 % pratiques, sur 20 jours",
      "100 % en ligne : vous suivez depuis chez vous",
      "Animée par un ingénieur informaticien",
      "Groupe du matin ou du soir, 15 personnes au maximum",
      "Attestation de participation offerte",
      "Compétences très recherchées : bureautique, cybersécurité, IA",
    ],
    contents: [
      {
        title: "Les bases de l'ordinateur",
        items: [
          {
            name: "Introduction : les bases de l'informatique",
            detail:
              "Bureau, fichiers et dossiers, clic gauche et droit, raccourcis essentiels",
          },
          {
            name: "L'architecture du PC",
            detail:
              "Matériel et logiciels expliqués, composants de votre ordinateur",
          },
          {
            name: "Les pannes du quotidien",
            detail:
              "Wi-Fi, imprimante, son, écran : diagnostiquer et réparer soi-même",
          },
          {
            name: "Fichiers, sauvegarde et récupération de données",
            detail: "Organiser, sauvegarder, récupérer des documents perdus",
          },
        ],
      },
      {
        title: "Windows et logiciels",
        items: [
          {
            name: "Installation professionnelle de Windows 10 et 11",
            detail: "Démarrage, configuration, installation",
          },
          {
            name: "Pilotes, mises à jour et optimisation",
            detail: "Garder le PC rapide, stable et à jour",
          },
          {
            name: "La suite Office",
            detail:
              "Installation de Word, Excel, PowerPoint, Access et Publisher",
          },
          {
            name: "Logiciels et applications",
            detail:
              "Installer sans risque : télécharger sans virus ni sites frauduleux",
          },
        ],
      },
      {
        title: "Sécurité et productivité",
        items: [
          {
            name: "Cybersécurité",
            detail:
              "Antivirus, pare-feu, navigation sûre, se protéger des arnaques en ligne",
          },
          {
            name: "Productivité",
            detail: "Raccourcis clavier et réglages utiles",
          },
          {
            name: "Astuces avancées et logiciels essentiels",
            detail: "Fonctions cachées de Windows et meilleurs outils gratuits",
          },
          {
            name: "L'IA au quotidien",
            detail:
              "Rédiger, vérifier et convertir avec l'IA : CV, mémoires, rapports, conversion de fichiers",
          },
        ],
      },
    ],
    forWho: [
      "Particuliers qui veulent cesser de dépendre d'un technicien pour chaque panne",
      "Étudiants et demandeurs d'emploi qui veulent un atout concret",
      "Employés qui veulent être plus autonomes et plus productifs",
      "Futurs techniciens qui veulent poser des bases solides",
    ],
    faq: [
      {
        question: "Comment se passe l'inscription après le paiement ?",
        answer: `Notre équipe vous contacte sur WhatsApp pour vous placer dans le groupe du matin ou du soir et vous communiquer les dates et le lien de connexion. Vous pouvez aussi nous écrire au ${SITE.phoneDisplay}.`,
      },
      {
        question: "La formation est-elle en direct ou enregistrée ?",
        answer:
          "En direct, avec un ingénieur informaticien. Vous pouvez poser vos questions pendant la séance.",
      },
      {
        question: "Faut-il des connaissances en informatique ?",
        answer:
          "Non. Le programme démarre par les bases et progresse vers un usage avancé.",
      },
      {
        question: "Que reçois-je à la fin ?",
        answer:
          "Une attestation de participation, à votre nom, offerte avec la formation.",
      },
      faqPaiementNumerique,
    ],
    seo: {
      title:
        "Formation Maintenance Logicielle : 12 modules en direct, 100 % en ligne",
      description:
        "Dépannage, Windows, Office, cybersécurité et IA : 12 modules en direct en petit groupe (15 personnes max), attestation incluse. 6 000 F.",
    },
    order: 18,
  },

  /* ------------------------------------ Performance PC ------------------------------------ */
  {
    slug: "performance-pc",
    name: "Performance PC : diagnostiquez votre ordinateur en 30 secondes",
    tagline:
      "Votre PC ralentit ? Un scan de 30 secondes vous dit pourquoi, et vous réglez le problème vous-même.",
    summary:
      "Un scan à lancer en copiant une commande : il identifie la cause du ralentissement et vous guide pour la corriger.",
    kind: "outil",
    price: 10000,
    cover: { tone: "navy", motif: "outil" },
    poster: {
      src: "/produits/affiches/performance-pc.webp",
      alt: "Performance PC : un scan d'environ 30 secondes pour savoir pourquoi votre ordinateur ralentit, puis la marche à suivre.",
    },
    delivery: "manuel",
    facts: [
      { icon: "horloge", label: "Scan d'environ 30 secondes" },
      { icon: "ordinateur", label: "Aucune compétence technique" },
      { icon: "outil", label: "Diagnostic et marche à suivre" },
      { icon: "support", label: "Aide sur WhatsApp" },
    ],
    story: [
      "Vous ouvrez votre PC pour un devoir, une facture à envoyer, un rendez-vous en visio dans dix minutes. L'écran met une éternité à s'afficher, le ventilateur s'emballe, une fenêtre s'ouvre et vous cliquez sur « Annuler » en espérant que ça suffise.",
      "Ce n'est presque jamais de la malchance. Ce sont, le plus souvent, les mêmes causes : mémoire saturée, disque plein, pilote obsolète, virus, sauvegarde absente, mots de passe éparpillés, trop de programmes au démarrage, ou poussière qui étouffe le ventilateur.",
      "Performance PC vous dit laquelle est en cause. Vous copiez une commande, vous attendez environ 30 secondes, et vous obtenez le problème précis ainsi que les clics à faire, dans l'ordre. Aucune compétence technique n'est nécessaire : si vous savez copier-coller un mot, vous savez utiliser l'outil.",
    ],
    highlights: [
      "Un scan lancé en une commande à copier-coller, environ 30 secondes d'attente",
      "Le problème précis plutôt qu'une supposition",
      "Les logiciels recommandés et les clics à faire, dans l'ordre",
      "Aucune compétence technique requise",
      "Un réflexe à reprendre chaque fois que votre PC ralentit",
    ],
    contents: [
      {
        title:
          "Les causes courantes de ralentissement que l'outil vous aide à repérer",
        items: [
          { name: "Mémoire saturée" },
          { name: "Disque plein" },
          { name: "Pilote obsolète" },
          { name: "Virus" },
          { name: "Sauvegarde absente ou défaillante" },
          { name: "Mots de passe éparpillés" },
          { name: "Trop de programmes au démarrage" },
          { name: "Poussière qui étouffe le ventilateur" },
        ],
      },
    ],
    forWho: [
      "Particuliers dont l'ordinateur ralentit sans qu'ils comprennent pourquoi",
      "Étudiants et salariés qui ne peuvent pas se permettre une panne",
      "Toute personne qui veut éviter de payer un technicien pour un petit problème",
    ],
    faq: [
      {
        question: "Comment je reçois l'outil après mon paiement ?",
        answer: `Notre équipe vous contacte sur WhatsApp pour vous remettre votre accès et le lien de l'outil. Vous pouvez aussi nous écrire au ${SITE.phoneDisplay}.`,
      },
      {
        question: "Dois-je être à l'aise en informatique ?",
        answer:
          "Non. Il suffit de copier une commande et d'attendre le résultat. Les étapes de correction sont données dans l'ordre.",
      },
      {
        question: "Sur quels ordinateurs fonctionne-t-il ?",
        answer:
          "L'outil est conçu pour les ordinateurs Windows. Si vous avez un doute sur votre version, écrivez-nous avant de commander.",
      },
      faqPaiementNumerique,
    ],
    seo: {
      title: "Performance PC : diagnostic de votre ordinateur en 30 secondes",
      description:
        "Votre PC ralentit ? Un scan d'environ 30 secondes identifie la cause et vous guide pour la corriger vous-même. 10 000 F.",
    },
    order: 19,
  },

  /* ------------------------ Licence Expert — Office 365 & Windows 11 ------------------------ */
  {
    slug: "pack-activation-windows11et10-et-office365-a-vie",
    name: "Licence Expert — Office 365 & Windows 11",
    tagline:
      "Word, Excel, PowerPoint et Windows 11 sur votre ordinateur : une installation simple, prête en quelques minutes, à vous pour la vie.",
    summary:
      "Word, Excel, PowerPoint et Windows 11 : installation simple, prête en quelques minutes, accès à vie sans abonnement.",
    kind: "pack",
    price: 4000,
    cover: { tone: "navy", motif: "logiciel" },
    poster: {
      src: "/produits/affiches/licence-expert-office-365-windows-11.webp",
      alt: "Licence Expert — Office 365 et Windows 11 : une licence générée automatiquement après paiement, pour activer les deux en quelques minutes.",
    },
    delivery: "licence-edn",
    facts: [
      { icon: "eclair", label: "Prêt en quelques minutes" },
      { icon: "ordinateur", label: "Word, Excel + Windows 11" },
      { icon: "acces-a-vie", label: "À vie, sans abonnement" },
      { icon: "support", label: "Guide + aide WhatsApp" },
    ],
    story: [
      "Un rapport à rédiger, un budget à calculer, une présentation à préparer pour demain : il vous faut Word, Excel et PowerPoint qui répondent présents, sur un Windows moderne. Sans abonnement mensuel à surveiller, sans installation compliquée.",
      "Ce pack réunit Microsoft Office 365 — Word pour écrire, Excel pour calculer, PowerPoint pour présenter, Outlook pour vos e-mails, OneNote pour vos notes — et Windows 11, pour un ordinateur à l'interface moderne, claire et agréable au quotidien. Une seule petite application, guidée pas à pas : en quelques minutes, vous êtes prêt à travailler.",
      "Et c'est pour la vie : un seul paiement, aucun renouvellement, aucun compte tiers à créer. Votre accès est prêt dès la confirmation du paiement, avec un guide d'installation et notre équipe sur WhatsApp si vous avez besoin d'un coup de main.",
    ],
    highlights: [
      "Word, Excel, PowerPoint, Outlook et OneNote réunis dans un seul pack",
      "Windows 11 : une interface moderne et agréable à utiliser chaque jour",
      "À vie : un seul paiement, aucun abonnement à renouveler",
      "Simple : une seule installation, guidée pas à pas",
      "Rapide : accès immédiat après paiement, prêt en quelques minutes",
      "Guide d'installation détaillé et assistance sur WhatsApp",
    ],
    contents: [
      {
        title: "Ce que contient le pack",
        items: [
          {
            name: "Word",
            detail: "Rapports, courriers, CV, mémoires : écrivez sans limite",
          },
          {
            name: "Excel",
            detail: "Calculs, tableaux, budgets : gérez vos données facilement",
          },
          {
            name: "PowerPoint",
            detail:
              "Des présentations professionnelles qui font bonne impression",
          },
          {
            name: "Outlook et OneNote",
            detail: "Vos e-mails, votre agenda et vos notes bien organisés",
          },
          {
            name: "Windows 11",
            detail: "Une interface moderne, complète, à vie",
          },
          {
            name: "Application d'installation",
            detail:
              "Un seul outil pour tout mettre en place, avec votre clé personnelle et le guide pas à pas",
          },
        ],
      },
    ],
    forWho: [
      "Étudiants, entrepreneurs et salariés qui ont besoin de Word, Excel et PowerPoint pour travailler",
      "Toute personne qui veut un Windows 11 et un Office complets, sans abonnement",
      "Qui vient d'acheter, d'installer ou de réinitialiser son PC",
      "Qui préfère payer une fois et garder son accès à vie plutôt que renouveler chaque année",
    ],
    notForWho: ["Ordinateurs Mac (ce pack est conçu pour Windows)"],
    faq: [
      {
        question: "Que contient exactement ce pack ?",
        answer:
          "Microsoft Office 365 — Word, Excel, PowerPoint, Outlook et OneNote — et Windows 11, en un seul achat. Ce n'est pas une simple licence Windows : vous avez de quoi écrire, calculer, présenter et travailler au quotidien.",
      },
      {
        question: "Comment vais-je recevoir mon pack ?",
        answer:
          "Dès que votre paiement est confirmé, votre licence est générée automatiquement et apparaît dans votre espace client, rubrique « Mes licences » — avec l'application d'installation et le guide pas à pas. Aucune attente.",
      },
      {
        question: "Est-ce difficile à installer ?",
        answer:
          "Non. Il suffit d'installer une seule petite application et de suivre le guide, étape par étape : comptez quelques minutes. Si une étape bloque, écrivez-nous sur WhatsApp, nous vous accompagnons.",
      },
      {
        question: "Sur combien d'appareils puis-je l'utiliser ?",
        answer:
          "Votre licence active votre pack sur 2 appareils. Besoin d'un appareil supplémentaire ? Une nouvelle licence est disponible à l'achat : écrivez-nous sur WhatsApp.",
      },
      {
        question: "Est-ce que ça expire ou faut-il le renouveler ?",
        answer:
          "Non, c'est à vie : pas d'abonnement, pas de renouvellement à prévoir.",
      },
      faqPaiementNumerique,
      faqAcces,
    ],
    seo: {
      title: "Office 365 & Windows 11 à vie — Word, Excel, PowerPoint",
      description:
        "Word, Excel, PowerPoint et Windows 11 sur votre PC : installation simple et rapide, accès à vie sans abonnement. Prêt en quelques minutes. 4 000 F.",
    },
    order: 20,
  },
];
