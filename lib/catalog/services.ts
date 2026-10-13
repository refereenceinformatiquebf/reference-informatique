import type { Service, ServiceFamily } from "./types";

/**
 * Services de Référence Informatique : quatre familles, onze prestations.
 *
 * Chaque prestation est écrite pour convaincre un client qui hésite : elle
 * nomme sa situation, dit précisément ce qu'il reçoit, comment ça se passe,
 * combien ça coûte et ce qui le rassure — sans promesse qu'on ne pourrait
 * pas tenir (pas de délai ferme, pas de résultat garanti, pas de chiffre
 * inventé). Les délais sont donnés comme des repères ; le délai exact est
 * toujours fixé dans le devis.
 *
 * Voix de la charte Boulga AI : directe et chaleureuse, concrète, jamais
 * jargonneuse, ancrée dans le quotidien d'ici, rassurante pour les non-initiés.
 */

export const SERVICE_FAMILIES: ServiceFamily[] = [
  {
    slug: "conception-web",
    name: "Conception de sites web",
    icon: "code",
    tagline: "Une vitrine qui inspire confiance, et qui vend.",
    intro: [
      "Avant d'appeler ou de passer vous voir, vos clients vous cherchent sur leur téléphone. S'ils ne vous trouvent pas, ou s'ils tombent sur une page lente, ancienne ou illisible sur mobile, ils vont voir ailleurs.",
      "Nous concevons des sites rapides, pensés d'abord pour le téléphone, qui disent clairement ce que vous faites et qui rendent le contact évident : un bouton WhatsApp, un appel en un clic, un formulaire, ou le paiement par Mobile Money si vous vendez en ligne.",
    ],
    forWho: [
      "Commerces et artisans qui veulent être trouvés et choisis",
      "Cabinets, écoles, cliniques et associations qui doivent inspirer confiance",
      "Entrepreneurs qui vendent déjà par WhatsApp et veulent passer à l'étape suivante",
      "Porteurs de projet qui lancent une activité",
    ],
    order: 1,
    seo: {
      title:
        "Création de sites web au Burkina Faso : vitrine et boutique en ligne",
      description:
        "Sites vitrines et boutiques en ligne rapides, pensés pour le mobile, avec contact WhatsApp et paiement Mobile Money. Devis gratuit.",
    },
  },
  {
    slug: "agents-ia",
    name: "Agents IA",
    icon: "agent-ia",
    tagline:
      "Un assistant qui prépare le travail répétitif. Vous gardez la main.",
    intro: [
      "Un agent IA est un assistant logiciel : il fait à votre place les tâches qui se répètent chaque jour. Répondre aux mêmes questions, trier vos emails, préparer vos publications. Il ne décide pas à votre place : il prépare, vous validez.",
      "Chaque agent est réglé avec vos propres informations (vos prix, vos horaires, votre façon de parler) et sait s'arrêter. Dès qu'une demande sort du cadre prévu, il passe la main à une vraie personne.",
    ],
    forWho: [
      "Commerçants et prestataires qui reçoivent beaucoup de messages WhatsApp",
      "Dirigeants dont la boîte mail déborde",
      "Entreprises qui veulent publier régulièrement sans y passer leurs journées",
      "Toute activité qui répète les mêmes réponses et les mêmes tâches",
    ],
    order: 2,
    seo: {
      title:
        "Agents IA sur mesure : WhatsApp, emails, contenu, réseaux sociaux",
      description:
        "Des assistants IA réglés avec vos informations pour répondre à vos clients, trier vos emails et préparer vos publications. Vous validez toujours. Devis gratuit.",
    },
  },
  {
    slug: "logiciels-automatisation",
    name: "Logiciels et automatisation",
    icon: "automatisation",
    tagline: "Arrêtez de recopier. Faites travailler vos outils ensemble.",
    intro: [
      "Beaucoup d'entreprises tiennent leur activité avec des cahiers, des fichiers Excel qui se contredisent et des outils qui ne se parlent pas. Chaque information est saisie deux fois, et chaque erreur coûte du temps ou de l'argent.",
      "Nous développons le logiciel qui correspond à votre façon de travailler, ou nous relions vos outils existants pour que les informations circulent toutes seules. Dans les deux cas, nous commençons par comprendre votre activité, pas par vous vendre une solution toute faite.",
    ],
    forWho: [
      "Entreprises qui gèrent leur activité sur Excel ou sur papier",
      "Équipes qui perdent du temps à ressaisir les mêmes données",
      "Structures dont le besoin n'est couvert par aucun logiciel du marché",
      "Dirigeants qui veulent des chiffres fiables sans les compiler à la main",
    ],
    order: 3,
    seo: {
      title: "Logiciel sur mesure et automatisation de tâches au Burkina Faso",
      description:
        "Logiciels adaptés à votre activité et workflows qui relient vos outils et génèrent vos rapports automatiquement. Devis gratuit.",
    },
  },
  {
    slug: "maintenance",
    name: "Maintenance et support",
    icon: "maintenance",
    tagline:
      "Un système qui fonctionne, sécurisé, et quelqu'un à appeler quand il faut.",
    intro: [
      "Un ordinateur qui rame, un logiciel qui plante, une mise à jour qui change tout : ces petits problèmes arrivent toujours au pire moment. Les traiter vite, ou mieux, les éviter, c'est du temps et de l'argent gagnés.",
      "Nous installons, configurons, surveillons et corrigeons, ponctuellement ou dans le cadre d'un contrat de suivi, à domicile ou à distance.",
    ],
    forWho: [
      "Particuliers dont l'ordinateur est lent ou à réinstaller",
      "Entreprises qui dépendent de logiciels pour travailler au quotidien",
      "Équipes sans informaticien qui veulent un référent technique",
    ],
    order: 4,
    seo: {
      title: "Maintenance informatique et installation Windows et Office",
      description:
        "Installation de Windows et d'Office, maintenance logicielle mensuelle ou annuelle, à domicile ou à distance. Tarifs clairs.",
    },
  },
];

export const SERVICES: Service[] = [
  /* =================================== CONCEPTION WEB =================================== */
  {
    slug: "site-vitrine",
    family: "conception-web",
    name: "Site vitrine professionnel",
    tagline: "Présentez votre activité clairement, et facilitez le contact.",
    summary:
      "Un site rapide et lisible sur mobile qui présente votre activité, avec formulaire de contact et bases de référencement Google.",
    priceType: "FROM",
    priceFrom: 50000,
    priceNote:
      "À partir de 50 000 F. Le prix exact dépend du nombre de pages et des fonctionnalités : il est fixé dans un devis gratuit, avant tout engagement.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vos clients vous demandent chaque jour votre adresse, vos tarifs, vos horaires, et vous répondez à la main à chacun.",
        "Votre activité n'existe que sur une page Facebook : difficile d'y inspirer confiance à un nouveau client, ou d'apparaître sur Google.",
        "Vous avez déjà un site, mais il est lent, ancien, ou il s'affiche mal sur téléphone, et vous n'osez plus le montrer.",
      ],
    },
    deliverables: [
      {
        title: "Un design à l'image de votre activité",
        text: "Pas un modèle recopié : des couleurs, des mots et une structure choisis pour vos clients à vous.",
      },
      {
        title: "Pensé d'abord pour le téléphone",
        text: "Chaque page est conçue pour s'afficher et se lire sans effort sur un téléphone, puis adaptée à l'ordinateur.",
      },
      {
        title: "Les pages qui comptent",
        text: "Accueil, présentation, services ou produits, contact : la structure dont vos clients ont besoin pour décider.",
      },
      {
        title: "Un contact en un geste",
        text: "Bouton WhatsApp, appel direct, formulaire : la personne intéressée n'a rien à chercher.",
      },
      {
        title: "Les bases du référencement",
        text: "Titres, descriptions, vitesse et structure soignés, pour que Google comprenne votre site et vous montre aux bonnes personnes.",
      },
      {
        title: "Une prise en main",
        text: "À la livraison, nous vous expliquons comment votre site fonctionne et comment le faire évoluer.",
      },
    ],
    process: [
      {
        title: "On échange",
        text: "Un appel ou un message WhatsApp : votre activité, vos clients, ce que le site doit leur faire faire. C'est gratuit.",
      },
      {
        title: "Vous recevez un devis clair",
        text: "Pages, fonctionnalités, délai, prix, garantie : tout est écrit avant que le travail ne commence.",
      },
      {
        title: "On construit, vous validez",
        text: "Vous voyez le site avancer et vous validez les pages au fur et à mesure, pour qu'il n'y ait pas de mauvaise surprise.",
      },
      {
        title: "Mise en ligne et suivi",
        text: "Nous mettons le site en ligne, nous vous le présentons et nous restons joignables après la livraison.",
      },
    ],
    forWho: [
      "Commerces, artisans et indépendants",
      "Cabinets, écoles, associations",
      "Entrepreneurs qui lancent leur activité",
    ],
    timeline:
      "Un site vitrine simple se réalise généralement en une à deux semaines une fois vos textes et vos images réunis. Le délai exact est précisé dans le devis.",
    faq: [
      {
        question: "Combien coûte un site vitrine ?",
        answer:
          "À partir de 50 000 F. Le prix exact dépend du nombre de pages et des fonctionnalités. Vous recevez un devis détaillé et gratuit avant de vous engager.",
      },
      {
        question: "Dois-je fournir les textes et les photos ?",
        answer:
          "Idéalement oui, car vous connaissez votre activité mieux que personne. Si vous n'en avez pas encore, dites-le-nous dans votre demande : nous voyons ensemble comment les préparer.",
      },
      {
        question: "Le site m'appartiendra-t-il ?",
        answer:
          "Oui. Le site et le nom de domaine sont à votre nom, et nous vous remettons les accès à la livraison.",
      },
      {
        question: "Et si je veux modifier quelque chose plus tard ?",
        answer:
          "Vous pouvez nous demander les modifications au fil du temps, et nous proposons aussi un contrat de maintenance pour que votre site reste à jour et sécurisé.",
      },
      {
        question: "Comment se passe le paiement ?",
        answer:
          "En général un acompte au démarrage et le solde à la livraison, par Mobile Money ou virement. Les modalités exactes figurent dans votre devis.",
      },
    ],
    seo: {
      title: "Site vitrine professionnel — à partir de 50 000 F, devis gratuit",
      description:
        "Un site rapide, lisible sur mobile, avec contact WhatsApp et bases de référencement. À partir de 50 000 F, devis détaillé gratuit.",
    },
    order: 1,
  },
  {
    slug: "boutique-en-ligne",
    family: "conception-web",
    name: "Boutique en ligne",
    tagline: "Vendez sans courir après les messages et les paiements.",
    summary:
      "Un catalogue en ligne avec paiement par Mobile Money et carte, espace client et suivi des commandes.",
    priceType: "QUOTE",
    priceNote:
      "Sur devis. Le prix dépend du nombre de produits, des moyens de paiement et des options : vous recevez un devis détaillé et gratuit.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vous vendez par WhatsApp : photos envoyées une à une, prix redemandés dix fois, commandes noyées dans la conversation.",
        "Vous passez vos soirées à vérifier qui a payé et qui n'a pas payé.",
        "Des clients s'intéressent mais ne commandent pas, parce que le chemin pour acheter est trop long.",
      ],
    },
    deliverables: [
      {
        title: "Un catalogue clair",
        text: "Vos produits ou vos formations avec photos, prix et descriptions, faciles à parcourir sur téléphone.",
      },
      {
        title: "Le paiement en ligne",
        text: "Vos clients paient par Mobile Money ou carte bancaire sur une page sécurisée. Vous n'avez plus à vérifier chaque paiement à la main.",
      },
      {
        title: "Un espace client",
        text: "Chaque client retrouve ses commandes, et, pour les produits numériques, ses accès.",
      },
      {
        title: "Des emails automatiques",
        text: "Confirmation de commande, confirmation de paiement : vos clients sont rassurés sans que vous écriviez un message.",
      },
      {
        title: "Une administration simple",
        text: "Vous suivez vos commandes et vos clients depuis un tableau de bord lisible.",
      },
      {
        title: "WhatsApp en complément",
        text: "Pour ceux qui préfèrent commander en discutant, le bouton WhatsApp reste à portée de clic.",
      },
    ],
    process: [
      {
        title: "On cadre votre vente",
        text: "Ce que vous vendez, à qui, comment vos clients paient aujourd'hui, et ce que vous voulez automatiser.",
      },
      {
        title: "Devis et choix du paiement",
        text: "Vous recevez un devis précis. Nous vous aidons à choisir et à ouvrir le compte de paiement qui convient à votre activité.",
      },
      {
        title: "Construction et tests",
        text: "Nous construisons la boutique, puis nous testons ensemble un vrai parcours d'achat, du choix du produit au paiement.",
      },
      {
        title: "Lancement et accompagnement",
        text: "Mise en ligne, prise en main de l'administration, et une personne à qui poser vos questions les premiers jours.",
      },
    ],
    forWho: [
      "Commerçants qui vendent déjà par WhatsApp ou sur Facebook",
      "Créateurs de formations et de contenus numériques",
      "Entrepreneurs qui veulent vendre à des clients éloignés",
    ],
    timeline:
      "Le délai dépend du nombre de produits et des options choisies. Il est précisé dans le devis, après notre premier échange.",
    faq: [
      {
        question:
          "Quels moyens de paiement mes clients pourront-ils utiliser ?",
        answer:
          "Le Mobile Money et la carte bancaire, selon le prestataire de paiement retenu. Nous vous conseillons celui qui couvre le mieux vos clients.",
      },
      {
        question: "Ai-je besoin d'un compte pour encaisser en ligne ?",
        answer:
          "Oui, il faut un compte auprès d'un prestataire de paiement, qui vérifie votre identité. Nous vous guidons dans les démarches.",
      },
      {
        question: "Puis-je continuer à prendre des commandes sur WhatsApp ?",
        answer:
          "Oui. La boutique vient en complément : vos clients choisissent la façon de commander qui leur convient.",
      },
      {
        question: "Combien ça coûte ?",
        answer:
          "Le prix dépend de votre projet. Décrivez-le-nous et vous recevez un devis détaillé et gratuit, sans engagement.",
      },
    ],
    seo: {
      title: "Boutique en ligne avec paiement Mobile Money — devis gratuit",
      description:
        "Une boutique en ligne avec paiement Mobile Money et carte, espace client et suivi des commandes. Devis détaillé gratuit.",
    },
    order: 2,
  },

  /* ===================================== AGENTS IA ===================================== */
  {
    slug: "assistant-whatsapp",
    family: "agents-ia",
    name: "Assistant WhatsApp intelligent",
    tagline:
      "Vos clients obtiennent une réponse, même quand vous ne pouvez pas répondre.",
    summary:
      "Il répond aux questions fréquentes de vos clients sur WhatsApp, à toute heure, et vous passe la main quand c'est nécessaire.",
    priceType: "QUOTE",
    priceNote:
      "Sur devis. Le prix dépend du nombre de questions à couvrir et de la mise en place sur WhatsApp : devis détaillé et gratuit.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vos clients écrivent le soir, le week-end, pendant que vous êtes en rendez-vous, et vous ne pouvez pas répondre à tout, tout de suite.",
        "Vous répondez cent fois aux mêmes questions : horaires, prix, adresse, disponibilité.",
        "Un client qui n'obtient pas de réponse rapide écrit à votre concurrent.",
      ],
    },
    deliverables: [
      {
        title: "Des réponses fiables aux questions fréquentes",
        text: "L'assistant répond à partir de vos informations (prix, horaires, services), pas à partir de ce qu'il imagine.",
      },
      {
        title: "Le passage à une vraie personne",
        text: "Dès qu'une demande sort du cadre prévu, l'assistant vous transmet la conversation au lieu d'inventer une réponse.",
      },
      {
        title: "Votre numéro, votre ton",
        text: "Il fonctionne avec votre numéro WhatsApp existant et s'exprime comme vous le feriez.",
      },
      {
        title: "Une phase de test avec vous",
        text: "Avant la mise en service, vous testez l'assistant et nous corrigeons ce qui ne vous convient pas.",
      },
    ],
    process: [
      {
        title: "On liste vos questions fréquentes",
        text: "Nous relevons avec vous ce que vos clients demandent le plus, et la bonne réponse à chaque fois.",
      },
      {
        title: "On règle l'assistant",
        text: "Informations, ton, cas où il doit vous passer la main : tout est configuré avec vous.",
      },
      {
        title: "Vous le testez",
        text: "Vous lui posez les questions de vos clients. Nous ajustons jusqu'à ce que les réponses soient les bonnes.",
      },
      {
        title: "Mise en service et ajustements",
        text: "L'assistant est activé. Nous suivons les premières conversations et nous corrigeons au besoin.",
      },
    ],
    forWho: [
      "Commerces, restaurants, cliniques et écoles qui reçoivent beaucoup de messages",
      "Prestataires qui ne peuvent pas répondre pendant leurs interventions",
      "Entreprises qui veulent garder une réponse rapide hors des heures de bureau",
    ],
    timeline:
      "Le délai dépend du nombre de questions à couvrir et de la configuration WhatsApp. Il est précisé dans le devis.",
    faq: [
      {
        question: "Mes clients sauront-ils qu'ils parlent à un assistant ?",
        answer:
          "Nous vous recommandons de le dire clairement, c'est plus honnête et ça rassure. Le message d'accueil est configurable avec vous.",
      },
      {
        question: "Et si l'assistant ne sait pas répondre ?",
        answer:
          "Il ne devine pas : il vous transmet la conversation, ou prévient le client qu'une personne va lui répondre.",
      },
      {
        question: "Dois-je changer de numéro WhatsApp ?",
        answer:
          "Non, nous travaillons avec votre numéro. Il faut utiliser les outils prévus par WhatsApp pour les entreprises ; nous vous guidons sur les règles et sur d'éventuels frais de messagerie.",
      },
      {
        question: "Puis-je modifier les réponses plus tard ?",
        answer:
          "Oui. Votre activité évolue : les réponses peuvent être mises à jour, par nous ou avec nos explications.",
      },
    ],
    seo: {
      title:
        "Assistant WhatsApp intelligent pour votre entreprise — devis gratuit",
      description:
        "Un assistant qui répond aux questions fréquentes de vos clients sur WhatsApp, à toute heure, et vous passe la main si besoin. Devis gratuit.",
    },
    order: 3,
  },
  {
    slug: "agent-ia-emails",
    family: "agents-ia",
    name: "Agent IA pour vos emails",
    tagline:
      "Une boîte mail triée, des brouillons prêts. Vous gardez le dernier mot.",
    summary:
      "Il trie et priorise votre boîte mail et prépare des brouillons de réponse. Rien ne part sans votre accord.",
    priceType: "QUOTE",
    priceNote:
      "Sur devis. Le prix dépend du volume d'emails et des règles à mettre en place : devis détaillé et gratuit.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Votre boîte mail déborde : l'email important se perd parmi les dizaines de messages sans intérêt.",
        "Vous écrivez toujours les mêmes réponses, avec les mêmes phrases, les mêmes pièces jointes.",
        "Des devis et des prospects restent sans relance, simplement parce que vous n'avez pas eu le temps.",
      ],
    },
    deliverables: [
      {
        title: "Un tri par urgence et par sujet",
        text: "Les messages importants remontent ; le reste est classé sans que vous ayez à y penser.",
      },
      {
        title: "Des brouillons de réponse",
        text: "Pour les demandes récurrentes, un brouillon est préparé. Vous le relisez, le modifiez, l'envoyez.",
      },
      {
        title: "Jamais d'envoi sans vous",
        text: "L'agent prépare, vous décidez. Aucun email ne part sans votre validation.",
      },
      {
        title: "Des relances automatiques proposées",
        text: "Devis ou prospects sans réponse : l'agent vous suggère la relance au bon moment.",
      },
    ],
    process: [
      {
        title: "On observe votre boîte mail",
        text: "Quels emails reviennent, lesquels comptent vraiment, lesquels vous font perdre du temps.",
      },
      {
        title: "On définit les règles",
        text: "Priorités, types de réponses, ton, cas où l'agent ne doit surtout pas intervenir.",
      },
      {
        title: "On teste avec vos vrais messages",
        text: "Vous voyez les tris et les brouillons proposés et vous corrigez avant la mise en service.",
      },
      {
        title: "Mise en service et réglages",
        text: "L'agent travaille, nous ajustons les règles après les premiers jours d'usage.",
      },
    ],
    forWho: [
      "Dirigeants et responsables qui reçoivent beaucoup d'emails",
      "Prestataires qui envoient des devis et doivent les relancer",
      "Services clients qui répondent aux mêmes demandes",
    ],
    timeline:
      "Le délai dépend de votre messagerie et des règles à mettre en place. Il est précisé dans le devis.",
    faq: [
      {
        question: "L'agent peut-il envoyer un email à ma place ?",
        answer:
          "Non. Il prépare des brouillons, vous les validez. Rien ne part sans votre accord.",
      },
      {
        question: "Mes emails sont confidentiels : que devient mon contenu ?",
        answer:
          "Nous vous expliquons précisément, avant de commencer, où passent vos données et comment elles sont protégées. Vous décidez ce que l'agent peut lire.",
      },
      {
        question: "Cela fonctionne avec quelle messagerie ?",
        answer:
          "Cela dépend de votre messagerie. Indiquez-nous celle que vous utilisez dans votre demande : nous vous disons ce qui est possible.",
      },
    ],
    seo: {
      title: "Agent IA pour vos emails : tri, brouillons de réponse, relances",
      description:
        "Un agent qui trie votre boîte mail et prépare des brouillons de réponse. Rien ne part sans votre validation. Devis gratuit.",
    },
    order: 4,
  },
  {
    slug: "agent-ia-seo-contenu",
    family: "agents-ia",
    name: "Agent IA pour le référencement et le contenu",
    tagline:
      "Des textes qui vous font trouver sur Google, dans le ton de votre marque.",
    summary:
      "Il recherche les mots que vos clients tapent, rédige des textes optimisés que vous relisez, et suit votre position sur Google.",
    priceType: "QUOTE",
    priceNote:
      "Sur devis. Le prix dépend du volume de contenus et du suivi demandé : devis détaillé et gratuit.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vous savez qu'il faudrait écrire pour apparaître sur Google, mais vous n'avez ni le temps ni l'habitude.",
        "Votre site existe, mais personne ne le trouve quand il tape ce que vous vendez.",
        "Vos fiches produits ou vos pages se ressemblent toutes et ne donnent pas envie d'acheter.",
      ],
    },
    deliverables: [
      {
        title: "Les mots que vos clients tapent vraiment",
        text: "Une recherche des expressions que les gens saisissent sur Google quand ils cherchent ce que vous proposez.",
      },
      {
        title: "Des textes rédigés pour être trouvés",
        text: "Pages du site, articles, fiches produits : des textes clairs, optimisés pour le référencement, dans le ton de votre marque.",
      },
      {
        title: "Votre relecture avant publication",
        text: "Rien n'est publié sans que vous l'ayez lu et approuvé.",
      },
      {
        title: "Un suivi mensuel",
        text: "Un point régulier sur votre position sur Google et sur ce qui progresse.",
      },
    ],
    process: [
      {
        title: "On comprend votre activité et vos clients",
        text: "Ce que vous vendez, à qui, comment vos clients vous décrivent et vous cherchent.",
      },
      {
        title: "On choisit les sujets",
        text: "Une liste de contenus à produire en priorité, validée avec vous.",
      },
      {
        title: "On rédige, vous relisez",
        text: "Chaque texte vous est soumis. Vous corrigez, nous ajustons, vous publiez.",
      },
      {
        title: "On mesure",
        text: "Chaque mois, nous regardons ce qui monte sur Google et nous adaptons la suite.",
      },
    ],
    forWho: [
      "Entreprises qui ont un site mais peu de visites",
      "Boutiques en ligne qui veulent de meilleures fiches produits",
      "Professionnels qui veulent publier des articles régulièrement",
    ],
    timeline:
      "Le référencement demande du temps : les premiers effets se voient généralement après quelques semaines de publication régulière. Le rythme exact est précisé dans le devis.",
    faq: [
      {
        question: "Vais-je apparaître en première page de Google ?",
        answer:
          "Nous ne pouvons promettre aucune position : personne ne le peut honnêtement. Nous travaillons sur ce qui fait progresser : de bons contenus, bien structurés, sur ce que vos clients cherchent.",
      },
      {
        question: "Les textes seront-ils rédigés par une IA ?",
        answer:
          "Ils sont préparés avec l'aide d'une IA, puis relus et corrigés. Vous validez chaque texte avant publication, pour qu'il corresponde à votre activité et à votre ton.",
      },
      {
        question: "Faut-il avoir déjà un site ?",
        answer:
          "C'est mieux. Si vous n'en avez pas, nous pouvons d'abord le créer, voir « Site vitrine professionnel ».",
      },
    ],
    seo: {
      title: "Agent IA pour le référencement Google et la rédaction de contenu",
      description:
        "Recherche de mots-clés, textes optimisés relus par vous avant publication, suivi mensuel de votre position sur Google. Devis gratuit.",
    },
    order: 5,
  },
  {
    slug: "agent-ia-reseaux-sociaux",
    family: "agents-ia",
    name: "Agent IA pour les réseaux sociaux",
    tagline: "Des publications régulières, sans y passer vos journées.",
    summary:
      "Il propose et planifie des publications pour Facebook, Instagram et WhatsApp Status. Chacune reste soumise à votre validation.",
    priceType: "QUOTE",
    priceNote:
      "Sur devis. Le prix dépend du rythme de publication et des réseaux concernés : devis détaillé et gratuit.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vous publiez par à-coups : trois posts une semaine, plus rien le mois suivant.",
        "Vous ne savez jamais quoi poster, et l'idée vous vient quand il est trop tard.",
        "Vous voulez être visible, mais vous avez un métier à faire tourner.",
      ],
    },
    deliverables: [
      {
        title: "Un calendrier de publication",
        text: "Un planning clair des publications des semaines à venir, sur les réseaux que vos clients utilisent.",
      },
      {
        title: "Des idées adaptées à votre secteur",
        text: "Des propositions de contenus pensées pour votre activité et vos clients, pas des publications génériques.",
      },
      {
        title: "Votre validation à chaque publication",
        text: "Rien n'est publié sans votre accord : vous gardez le contrôle de votre image.",
      },
      {
        title: "Facebook, Instagram et WhatsApp Status",
        text: "Les trois endroits où vos clients vous voient le plus.",
      },
    ],
    process: [
      {
        title: "On définit votre ligne",
        text: "Votre activité, votre ton, ce que vous voulez que l'on retienne de vous.",
      },
      {
        title: "On prépare le calendrier",
        text: "Une série de publications proposées, avec les dates et les réseaux.",
      },
      {
        title: "Vous validez",
        text: "Vous acceptez, modifiez ou refusez chaque proposition.",
      },
      {
        title: "On planifie et on ajuste",
        text: "Les publications validées sont programmées, et nous adaptons selon ce qui plaît à votre public.",
      },
    ],
    forWho: [
      "Commerces et restaurants qui veulent exister sur les réseaux",
      "Prestataires et indépendants qui manquent de temps",
      "Entreprises qui veulent une présence régulière et cohérente",
    ],
    timeline:
      "Le calendrier de la première série de publications est généralement prêt rapidement après notre échange. Le délai exact est précisé dans le devis.",
    faq: [
      {
        question: "Les publications se feront-elles sans que je les voie ?",
        answer:
          "Jamais. Chaque publication vous est soumise et ne part qu'avec votre accord.",
      },
      {
        question: "Gérez-vous aussi les commentaires et les messages ?",
        answer:
          "Ce service porte sur la préparation et la planification des publications. Pour répondre aux messages, voir l'assistant WhatsApp.",
      },
      {
        question: "Mes visuels seront-ils créés pour moi ?",
        answer:
          "Précisez vos besoins dans votre demande (photos existantes, visuels à créer) : nous indiquons dans le devis ce qui est inclus.",
      },
    ],
    seo: {
      title:
        "Agent IA pour les réseaux sociaux : calendrier et publications validées",
      description:
        "Des publications proposées et planifiées pour Facebook, Instagram et WhatsApp Status, toujours validées par vous. Devis gratuit.",
    },
    order: 6,
  },

  /* ============================= LOGICIELS ET AUTOMATISATION ============================= */
  {
    slug: "logiciel-personnalise",
    family: "logiciels-automatisation",
    name: "Logiciel personnalisé",
    tagline:
      "Une application construite pour votre activité, pas un outil générique mal ajusté.",
    summary:
      "Nous développons le logiciel qui correspond à votre façon de travailler, avec un cahier des charges inclus et un suivi après la livraison.",
    priceType: "FROM",
    priceFrom: 100000,
    priceNote:
      "À partir de 100 000 F. Le prix dépend de l'ampleur du logiciel : il est fixé dans un devis détaillé, après le cahier des charges.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vous gérez votre activité avec des cahiers et des fichiers Excel qui ne sont jamais d'accord entre eux.",
        "Vous avez essayé un logiciel du marché, mais il ne correspond pas à votre façon de travailler, et vous n'en utilisez qu'une petite partie.",
        "Vous perdez du temps à ressaisir, à vérifier, à corriger, et vous n'avez pas de chiffres fiables quand vous en avez besoin.",
      ],
    },
    deliverables: [
      {
        title: "Un cahier des charges inclus",
        text: "Avant d'écrire une ligne de code, nous écrivons avec vous ce que le logiciel doit faire. C'est ce qui évite les mauvaises surprises.",
      },
      {
        title: "Un développement sur mesure",
        text: "Le logiciel reprend vos règles, votre vocabulaire, vos documents. Il s'adapte à vous, pas l'inverse.",
      },
      {
        title: "Des démonstrations régulières",
        text: "Vous voyez le logiciel avancer par étapes et vous pouvez corriger le tir tôt, plutôt qu'à la fin.",
      },
      {
        title: "Une prise en main de vos équipes",
        text: "Nous présentons le logiciel aux personnes qui vont l'utiliser, pour qu'il soit adopté.",
      },
      {
        title: "Un suivi après la livraison",
        text: "Une période de support pour corriger ce qui doit l'être une fois le logiciel utilisé en vrai.",
      },
    ],
    process: [
      {
        title: "Atelier de découverte",
        text: "Nous observons comment vous travaillez aujourd'hui et où le temps se perd.",
      },
      {
        title: "Cahier des charges et devis",
        text: "Le périmètre, les écrans, les règles, le prix et le délai sont écrits noir sur blanc.",
      },
      {
        title: "Développement par étapes",
        text: "Chaque étape est présentée et validée avant de passer à la suivante.",
      },
      {
        title: "Livraison, formation, suivi",
        text: "Mise en service, formation des utilisateurs, puis correction des ajustements.",
      },
    ],
    forWho: [
      "Entreprises dont l'activité a des règles particulières",
      "Écoles, cliniques, commerces et structures qui gèrent beaucoup d'informations",
      "Organisations qui veulent des chiffres fiables sans effort",
    ],
    timeline:
      "Le délai dépend de l'ampleur du logiciel. Il est fixé dans le devis, une fois le cahier des charges écrit avec vous.",
    faq: [
      {
        question:
          "Pourquoi payer un logiciel sur mesure plutôt qu'un logiciel du marché ?",
        answer:
          "Si un logiciel du marché correspond à votre besoin, prenez-le : nous vous le dirons honnêtement. Le sur-mesure se justifie quand vos règles de travail sont spécifiques, ou quand aucun outil existant ne vous convient.",
      },
      {
        question: "À qui appartiendra le logiciel ?",
        answer:
          "Les conditions de propriété et d'utilisation sont écrites dans le devis, avant le démarrage, pour qu'elles soient claires pour les deux parties.",
      },
      {
        question: "Que se passe-t-il si mon besoin change en cours de route ?",
        answer:
          "Cela arrive. Comme le travail avance par étapes validées, nous adaptons le périmètre avec vous, et nous vous disons clairement l'effet sur le prix et le délai.",
      },
      {
        question: "Y a-t-il un support après la livraison ?",
        answer:
          "Oui, une période de support est prévue, et un contrat de maintenance est possible ensuite.",
      },
    ],
    seo: {
      title:
        "Logiciel personnalisé — à partir de 100 000 F, cahier des charges inclus",
      description:
        "Un logiciel conçu pour votre activité, avec cahier des charges inclus, démonstrations régulières et suivi après livraison. À partir de 100 000 F.",
    },
    order: 7,
  },
  {
    slug: "workflows-automatisation",
    family: "logiciels-automatisation",
    name: "Workflows d'automatisation",
    tagline: "Vos outils travaillent ensemble. Vous cessez de recopier.",
    summary:
      "Nous relions vos outils existants et automatisons vos rapports et vos notifications, pour que les informations circulent seules.",
    priceType: "FROM",
    priceFrom: 30000,
    priceNote:
      "À partir de 30 000 F. Le prix dépend du nombre d'outils à relier et des automatisations : il est fixé dans un devis gratuit.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Chaque semaine, vous recopiez les mêmes informations d'un outil à l'autre : commandes dans Excel, factures ailleurs, relances à la main.",
        "Vous préparez vos rapports à la main, et ils sont déjà périmés quand vous les envoyez.",
        "Une étape oubliée, et c'est un client qu'on ne rappelle pas ou une facture qu'on n'envoie pas.",
      ],
    },
    deliverables: [
      {
        title: "La connexion de vos outils",
        text: "Formulaires, tableurs, email, WhatsApp, logiciels de gestion : nous faisons en sorte que l'information passe de l'un à l'autre sans que vous la saisissiez deux fois.",
      },
      {
        title: "Des rapports automatiques",
        text: "Vos chiffres compilés et envoyés à la fréquence que vous choisissez, sans que vous y touchiez.",
      },
      {
        title: "Des notifications utiles",
        text: "Vous êtes prévenu quand une action est nécessaire : une commande à traiter, un paiement reçu, un stock bas.",
      },
      {
        title: "Une explication de ce qui tourne",
        text: "Nous vous montrons ce qui est automatisé et comment ça fonctionne, pour que rien ne reste une boîte noire.",
      },
    ],
    process: [
      {
        title: "On cartographie vos tâches répétitives",
        text: "Nous listons ce qui vous prend du temps chaque semaine et ce qui peut être automatisé sans risque.",
      },
      {
        title: "On choisit ce qui rapporte le plus",
        text: "Nous commençons par les automatisations qui vous font gagner le plus de temps.",
      },
      {
        title: "On construit et on teste",
        text: "Chaque automatisation est testée avec vos vraies données avant d'être activée.",
      },
      {
        title: "On surveille les premiers jours",
        text: "Nous vérifions que tout se passe comme prévu et nous corrigeons au besoin.",
      },
    ],
    forWho: [
      "Entreprises qui utilisent plusieurs outils qui ne communiquent pas",
      "Équipes qui produisent des rapports à la main",
      "Indépendants qui veulent gagner du temps sur l'administratif",
    ],
    timeline:
      "Une automatisation simple peut être mise en place assez vite ; un ensemble d'outils à relier demande plus de temps. Le délai est précisé dans le devis.",
    faq: [
      {
        question: "Quels outils pouvez-vous relier ?",
        answer:
          "Tout dépend de ce que vous utilisez. Listez vos outils dans votre demande : nous vous disons ce qui est réalisable et comment.",
      },
      {
        question: "Y a-t-il un risque que l'automatisation fasse des erreurs ?",
        answer:
          "C'est pourquoi chaque automatisation est testée avec vos données avant d'être activée, et surveillée au démarrage. Pour les actions sensibles, nous prévoyons une validation de votre part.",
      },
      {
        question: "Dois-je changer mes outils actuels ?",
        answer:
          "Le plus souvent non : l'idée est justement de les faire travailler ensemble.",
      },
    ],
    seo: {
      title: "Workflows d'automatisation — à partir de 30 000 F",
      description:
        "Reliez vos outils, automatisez vos rapports et vos notifications, et gagnez du temps chaque semaine. À partir de 30 000 F, devis gratuit.",
    },
    order: 8,
  },

  /* ================================ MAINTENANCE ET SUPPORT ================================ */
  {
    slug: "maintenance-logicielle",
    family: "maintenance",
    name: "Maintenance logicielle",
    tagline: "Un système à jour, sécurisé, et un référent à qui s'adresser.",
    summary:
      "Suivi, mises à jour et corrections de vos logiciels, en contrat mensuel ou annuel. À partir de 15 000 F par mois.",
    priceType: "FROM",
    priceFrom: 15000,
    priceNote:
      "À partir de 15 000 F par mois, en contrat mensuel ou annuel. Le prix exact dépend du nombre de logiciels et du niveau de suivi : il est fixé dans le devis.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Votre logiciel a été livré, puis plus personne ne s'en occupe : il vieillit, et le jour où il plante, vous ne savez pas qui appeler.",
        "Les mises à jour de sécurité s'accumulent parce que personne n'a le temps de les faire.",
        "Un petit problème bloque toute l'équipe, et il faut des jours pour le résoudre.",
      ],
    },
    deliverables: [
      {
        title: "Un suivi régulier",
        text: "Nous surveillons l'état de vos logiciels pour repérer les problèmes avant qu'ils ne vous bloquent.",
      },
      {
        title: "Les mises à jour",
        text: "Nous appliquons les mises à jour nécessaires, y compris celles de sécurité, au bon moment.",
      },
      {
        title: "Les corrections incluses",
        text: "Quand quelque chose ne fonctionne plus comme prévu, nous le corrigeons dans le cadre du contrat.",
      },
      {
        title: "Un interlocuteur identifié",
        text: "Vous savez à qui écrire, et vous obtenez une réponse.",
      },
    ],
    process: [
      {
        title: "On fait l'état des lieux",
        text: "Nous recensons vos logiciels et leur état actuel.",
      },
      {
        title: "On définit le contrat",
        text: "Ce qui est surveillé, la fréquence, ce qui est inclus, le prix : tout est écrit.",
      },
      {
        title: "On assure le suivi",
        text: "Surveillance, mises à jour, corrections, selon le contrat.",
      },
      {
        title: "On vous rend compte",
        text: "Vous savez ce qui a été fait et ce qui est à prévoir.",
      },
    ],
    forWho: [
      "Entreprises qui dépendent d'un logiciel pour travailler chaque jour",
      "Structures sans informaticien en interne",
      "Clients dont nous avons livré un site ou un logiciel",
    ],
    timeline:
      "Le contrat peut démarrer rapidement après l'état des lieux. La durée (mensuelle ou annuelle) est à votre choix.",
    faq: [
      {
        question:
          "Quelle est la différence entre un contrat mensuel et annuel ?",
        answer:
          "Le contrat mensuel vous laisse libre de vous arrêter chaque mois ; le contrat annuel vous engage plus longtemps mais peut être plus avantageux. Nous vous proposons les deux dans le devis.",
      },
      {
        question: "Que couvre exactement le contrat ?",
        answer:
          "Le suivi, les mises à jour et les corrections des logiciels listés. Le détail, y compris ce qui n'est pas inclus, est écrit dans le devis.",
      },
      {
        question:
          "Puis-je faire maintenir un logiciel que vous n'avez pas créé ?",
        answer:
          "Souvent oui, après un état des lieux. Décrivez votre logiciel dans votre demande : nous vous disons si nous pouvons nous en charger.",
      },
    ],
    seo: {
      title: "Maintenance logicielle — contrat mensuel ou annuel dès 15 000 F",
      description:
        "Suivi, mises à jour et corrections de vos logiciels, en contrat mensuel ou annuel, à partir de 15 000 F par mois.",
    },
    order: 9,
  },
  {
    slug: "installation-windows",
    family: "maintenance",
    name: "Installation de Windows",
    tagline: "Un ordinateur propre, à jour et prêt à travailler.",
    summary:
      "Installation et configuration complètes de Windows, pilotes inclus, à domicile ou à distance. 7 000 F.",
    priceType: "FIXED",
    priceFrom: 7000,
    priceNote:
      "7 000 F, tout compris : installation, pilotes et configuration. Le prix est annoncé avant l'intervention.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Votre ordinateur est devenu lent, instable, ou ne démarre plus correctement.",
        "Vous venez d'acheter un ordinateur sans système, ou vous voulez repartir d'une base saine.",
        "Vous avez peur de perdre vos fichiers en réinstallant.",
      ],
    },
    deliverables: [
      {
        title: "Une installation propre",
        text: "Windows installé correctement, sur une base saine, avec la version adaptée à votre ordinateur.",
      },
      {
        title: "Les pilotes inclus",
        text: "Son, écran, réseau, imprimante : les pilotes nécessaires sont installés pour que tout fonctionne.",
      },
      {
        title: "Une configuration personnalisée",
        text: "Réglages et applications de base mis en place comme vous en avez besoin.",
      },
      {
        title: "Un ordinateur prêt à l'emploi",
        text: "Vous récupérez une machine qui démarre vite et que vous pouvez utiliser tout de suite.",
      },
    ],
    process: [
      {
        title: "On vérifie votre ordinateur",
        text: "Modèle, version compatible, ce qu'il y a à sauvegarder.",
      },
      {
        title: "On sauvegarde vos fichiers",
        text: "Avant toute chose, vos documents importants sont mis à l'abri.",
      },
      {
        title: "On installe et on configure",
        text: "Installation, pilotes, mises à jour, réglages.",
      },
      {
        title: "On vous rend l'ordinateur prêt",
        text: "Vérification ensemble que tout fonctionne comme il faut.",
      },
    ],
    forWho: [
      "Particuliers dont l'ordinateur est lent ou instable",
      "Personnes qui viennent d'acheter un ordinateur sans système",
      "Entreprises qui équipent de nouveaux postes",
    ],
    timeline:
      "Une installation se fait généralement dans la journée, selon l'ordinateur. Le créneau est convenu avec vous.",
    faq: [
      {
        question: "Windows 10 ou Windows 11 ?",
        answer:
          "Nous conseillons Windows 11 lorsque votre ordinateur le permet. Microsoft a mis fin au support standard de Windows 10 en octobre 2025, ce qui signifie moins de protection dans la durée. Nous vérifions la compatibilité de votre machine avant de choisir.",
      },
      {
        question: "Et Windows 7 ?",
        answer:
          "Windows 7 n'est plus pris en charge par Microsoft depuis 2020 : nous le déconseillons. Sur de très anciens ordinateurs, nous en discutons avec vous au cas par cas.",
      },
      {
        question: "Vais-je perdre mes fichiers ?",
        answer:
          "Nous sauvegardons vos documents importants avant de réinstaller, et nous vous confirmons ce qui a été conservé.",
      },
      {
        question: "Intervenez-vous à domicile ?",
        answer:
          "À domicile ou à distance, selon votre situation. Précisez votre ville dans votre demande.",
      },
    ],
    seo: {
      title: "Installation de Windows à domicile ou à distance — 7 000 F",
      description:
        "Installation et configuration complètes de Windows, pilotes inclus, ordinateur prêt à l'emploi. 7 000 F, à domicile ou à distance.",
    },
    order: 10,
  },
  {
    slug: "installation-office",
    family: "maintenance",
    name: "Installation de Microsoft Office",
    tagline: "Word, Excel, PowerPoint installés et configurés, prêts à servir.",
    summary:
      "Installation et configuration de la suite Office sur votre ordinateur, avec votre licence. 4 900 F.",
    priceType: "FIXED",
    priceFrom: 4900,
    priceNote:
      "4 900 F pour l'installation et la configuration. Une licence Office valide est nécessaire : la vôtre, ou nous vous orientons vers une option légale.",
    problem: {
      title: "Vous vous reconnaissez ?",
      points: [
        "Vous avez un nouvel ordinateur, mais Word et Excel ne sont pas installés.",
        "Votre version d'Office est incomplète, ne s'ouvre plus, ou affiche des messages d'erreur.",
        "Vous voulez que tout soit configuré correctement, sans passer des heures à chercher.",
      ],
    },
    deliverables: [
      {
        title: "Une installation complète",
        text: "Word, Excel, PowerPoint et les autres outils de la suite, installés correctement.",
      },
      {
        title: "Une configuration soignée",
        text: "Réglages de base, langue, compte : tout est prêt pour que vous commenciez à travailler.",
      },
      {
        title: "L'activation avec votre licence",
        text: "Nous activons Office avec votre licence valide, et nous vérifions que tout fonctionne.",
      },
    ],
    process: [
      {
        title: "On vérifie votre licence",
        text: "Quelle version vous avez achetée, et si elle est compatible avec votre ordinateur.",
      },
      {
        title: "On installe",
        text: "Installation de la suite et des mises à jour.",
      },
      {
        title: "On active et on configure",
        text: "Activation avec votre licence, puis réglages de base.",
      },
      {
        title: "On teste ensemble",
        text: "Nous ouvrons Word, Excel et PowerPoint pour vérifier que tout est en ordre.",
      },
    ],
    forWho: [
      "Particuliers et étudiants avec un nouvel ordinateur",
      "Entreprises qui équipent de nouveaux postes",
      "Toute personne dont Office pose problème",
    ],
    timeline:
      "Une installation se fait généralement en moins d'une journée, à convenir avec vous.",
    faq: [
      {
        question: "Fournissez-vous la licence Office ?",
        answer:
          "Office nécessite une licence valide. Si vous en avez une, nous l'installons et l'activons avec. Sinon, nous vous orientons vers des options légales : achat d'une licence ou alternatives gratuites comme LibreOffice.",
      },
      {
        question: "Quelle version d'Office puis-je installer ?",
        answer:
          "Celle qui correspond à votre licence et à votre ordinateur. Indiquez-nous votre version dans votre demande.",
      },
      {
        question: "Intervenez-vous à distance ?",
        answer: "Oui, à domicile ou à distance selon votre situation.",
      },
    ],
    seo: {
      title:
        "Installation de Microsoft Office — 4 900 F, à domicile ou à distance",
      description:
        "Installation et configuration de Word, Excel et PowerPoint avec votre licence. 4 900 F, à domicile ou à distance.",
    },
    order: 11,
  },
];
