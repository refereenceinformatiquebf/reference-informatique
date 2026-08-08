/**
 * Script de seed — exécuté via `npx prisma db seed` (ou automatiquement
 * après `prisma migrate dev`). Nécessite un vrai projet Supabase connecté
 * (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) :
 * voir .env.example.
 *
 * Contenu volontairement réaliste (repris du catalogue existant de
 * Référence Informatique), pas des données de démonstration génériques —
 * voir PLAYBOOK-CONSTRUCTION.md, Étape 2.
 */
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma/client";

/**
 * Construit son propre client admin plutôt que d'importer
 * lib/supabase/admin.ts : ce fichier applicatif charge le paquet
 * "server-only", qui lève volontairement une erreur dès qu'il est importé
 * en dehors du pipeline de build Next.js (protection contre une fuite de
 * la clé service_role vers un Client Component). Un script de seed
 * s'exécute via `tsx`, hors de ce pipeline — l'import échoue donc toujours,
 * même si l'usage est légitime. On reconstruit ici le même client, sans le
 * garde qui n'a pas de sens dans ce contexte.
 */
function createSeedAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function seedServiceCategories() {
  const categories = [
    {
      slug: "conception-web",
      name: "Conception de sites web",
      description:
        "Sites vitrines, boutiques en ligne et plateformes sur mesure, pensés pour convertir vos visiteurs en clients.",
      iconKey: "code",
      displayOrder: 1,
      services: [
        {
          slug: "site-vitrine",
          name: "Site vitrine professionnel",
          description:
            "Un site qui présente votre activité avec clarté : pages, formulaire de contact, référencement de base inclus.",
          priceType: "FROM" as const,
          priceFrom: 50000,
          features: [
            "Design sur mesure",
            "Optimisé mobile",
            "Formulaire de contact",
            "Référencement de base",
          ],
        },
        {
          slug: "boutique-en-ligne",
          name: "Boutique en ligne",
          description:
            "Vendez vos produits ou formations directement en ligne, avec paiement Mobile Money intégré.",
          priceType: "QUOTE" as const,
          features: [
            "Catalogue produits",
            "Paiement Orange Money / Wave",
            "Espace client",
          ],
        },
      ],
    },
    {
      slug: "agents-ia",
      name: "Agents IA",
      description:
        "Automatisez vos échanges clients et vos tâches répétitives avec des agents conversationnels sur mesure.",
      iconKey: "agent-ia",
      displayOrder: 2,
      services: [
        {
          slug: "assistant-whatsapp",
          name: "Assistant WhatsApp intelligent",
          description:
            "Répondez automatiquement aux questions fréquentes de vos clients, 24h/24, sur WhatsApp.",
          priceType: "QUOTE" as const,
          features: [
            "Réponses automatiques",
            "Escalade vers un humain",
            "Intégré à votre numéro existant",
          ],
        },
      ],
    },
    {
      slug: "logiciels-automatisation",
      name: "Logiciels & automatisation",
      description:
        "Développement sur mesure et automatisation de vos tâches répétitives.",
      iconKey: "automatisation",
      displayOrder: 3,
      services: [
        {
          slug: "logiciel-personnalise",
          name: "Logiciel personnalisé",
          description:
            "Une application adaptée précisément à votre activité, pas un outil générique mal ajusté.",
          priceType: "FROM" as const,
          priceFrom: 100000,
          features: ["Cahier des charges inclus", "Support post-livraison"],
        },
        {
          slug: "workflows-automatisation",
          name: "Workflows d'automatisation",
          description:
            "Connexion entre vos outils existants et rapports automatiques, pour gagner un temps précieux.",
          priceType: "FROM" as const,
          priceFrom: 30000,
          features: ["Connexion entre outils", "Rapports automatiques"],
        },
      ],
    },
    {
      slug: "maintenance",
      name: "Maintenance & support",
      description:
        "Suivi, mises à jour et installations pour que votre système reste performant et sécurisé.",
      iconKey: "maintenance",
      displayOrder: 4,
      services: [
        {
          slug: "maintenance-logicielle",
          name: "Maintenance logicielle",
          description:
            "Suivi, mises à jour et corrections en contrat mensuel ou annuel.",
          priceType: "FROM" as const,
          priceFrom: 15000,
          features: ["Contrat mensuel ou annuel", "Corrections incluses"],
        },
        {
          slug: "installation-windows-office",
          name: "Installation Windows & Office",
          description:
            "Installation et activation complètes, drivers inclus, système prêt à l'emploi.",
          priceType: "FIXED" as const,
          priceFrom: 7000,
          features: ["Windows 7, 10 ou 11", "Suite Office activée"],
        },
      ],
    },
  ];

  for (const { services, ...category } of categories) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });

    for (const service of services) {
      await prisma.service.upsert({
        where: { slug: service.slug },
        update: { ...service, categoryId: created.id },
        create: { ...service, categoryId: created.id },
      });
    }
  }

  console.log(`✔ ${categories.length} familles de services créées.`);
}

async function seedProducts() {
  const products = [
    {
      slug: "cle-formations-completes",
      name: "Clé de Formations Complètes",
      shortDescription:
        "La clé USB 64 Go qui contient l'essentiel de ce dont vous avez besoin.",
      longDescription:
        "Classée meilleure clé de formations complètes au Burkina Faso. Fonctionne sans internet — apprenez partout, même sans connexion. Accès plateforme en ligne 24h/24 inclus en plus de la clé USB.",
      price: 12000,
      compareAtPrice: 25000,
      displayOrder: 1,
      faq: [
        {
          question: "Combien de temps ai-je accès au contenu ?",
          answer:
            "Vous avez un accès à vie ! La clé USB est à vous pour toujours et l'accès plateforme est inclus sans limite.",
        },
        {
          question: "Comment se passe la livraison ?",
          answer:
            "Livraison gratuite partout au Burkina Faso sous 24 à 48h après confirmation du paiement.",
        },
        {
          question: "Quels modes de paiement sont acceptés ?",
          answer:
            "Carte bancaire et Mobile Money (Orange Money, Moov Money, Wave) en ligne, ou commande directe via WhatsApp.",
        },
        {
          question: "La clé fonctionne-t-elle sur tous les ordinateurs ?",
          answer:
            "Oui, sur tous les PC Windows et Mac, sans installation particulière.",
        },
        {
          question: "Les formations sont-elles adaptées aux débutants ?",
          answer:
            "Oui, chaque module commence de zéro et progresse jusqu'au niveau avancé.",
        },
      ],
      whyChooseUs:
        "Elle contient des modules complets couvrant tout ce dont vous avez besoin pour maîtriser l'informatique professionnelle. Fonctionne sans internet — apprenez partout, même sans connexion. Accès plateforme en ligne 24h/24 inclus en plus de la clé USB. Livraison gratuite partout au Burkina Faso.",
      targetAudience: [
        "Étudiants et lycéens qui veulent maîtriser les outils bureautiques",
        "Employés et fonctionnaires qui veulent progresser dans leur carrière",
        "Entrepreneurs qui veulent utiliser l'IA et le marketing digital",
        "Enseignants qui veulent créer des présentations professionnelles",
      ],
      contents: [
        "Excel Simple (Débutant à Intermédiaire)",
        "Excel Avancé (Formules, Tableaux croisés, Macros, Analyses...)",
        "Word de A à Z (Mise en page, Bien rédigé, Styles...)",
        "PowerPoint de A à Z (Présentations professionnelles et impressionnantes)",
        "Intelligence Artificielle — Comprendre et utiliser l'IA, ChatGPT, prompts et automatisation",
        "Marketing Digital et Business en ligne",
        "Anglais Débutant, Intermédiaire, Avancé",
        "100 Meilleurs Livres PDF pour Entreprendre",
        "Infographie et Design avec Canva",
        "Montage Vidéo professionnel avec Cap Cut",
      ],
    },
    {
      slug: "cle-formations-smart",
      name: "Clé de formations SMART",
      shortDescription:
        "La clé intelligente pour maîtriser votre ordinateur et booster votre productivité.",
      longDescription:
        "Idéale pour les professionnels qui veulent être plus productifs au bureau. 150 logiciels Excel prêts à l'emploi et 5500 diapositives PowerPoint professionnelles.",
      price: 14000,
      compareAtPrice: 20000,
      displayOrder: 2,
      whyChooseUs:
        "150 logiciels Excel prêts à l'emploi — plus besoin de créer depuis zéro. 5500 diapositives PowerPoint professionnelles pour toutes vos présentations. Maîtrisez la prise de parole et devenez éloquent et convaincant.",
      targetAudience: [
        "Employés et fonctionnaires qui veulent être plus efficaces au bureau",
        "Managers et chefs de projet qui font beaucoup de présentations",
        "Comptables et gestionnaires qui travaillent avec Excel",
        "Étudiants en fin d'études qui préparent leurs soutenances",
      ],
      contents: [
        "Maîtrise complète de l'ordinateur (Windows, clavier, fichiers)",
        "Prise de parole en public — Vidéos + Livres PDF + Livres Audio",
        "Dominez la peur de parler en public et devenez éloquent",
        "150 Logiciels Excel (Facturation, Vente, Comptabilité)",
        "150 Logiciels Excel (Gestion de Stock, Budget, Paie, RH)",
        "5500 Diapositives PowerPoint professionnelles prêtes à l'emploi",
        "Modèles pour bilans, réunions, soutenances et présentations",
      ],
    },
    {
      slug: "cle-enfants",
      name: "Clé pour Enfants — Informatique et Anglais",
      shortDescription:
        "Clé USB 32 Go spécialement conçue pour préparer les enfants à réussir demain.",
      longDescription:
        "Contenu 100% adapté aux enfants — méthode ludique et progressive, dès 6 ans.",
      price: 10000,
      compareAtPrice: 15000,
      displayOrder: 3,
      whyChooseUs:
        "Contenu 100% adapté aux enfants — méthode ludique et progressive. Apprendre l'anglais dès le jeune âge — un avantage pour toute la vie. Les dessins animés éducatifs rendent l'apprentissage amusant.",
      targetAudience: [
        "Enfants qui veulent apprendre l'informatique",
        "Enfants qui veulent apprendre l'anglais de façon amusante",
        "Parents qui veulent préparer leurs enfants pour l'école et l'avenir",
        "Écoles et centres de formation pour enfants",
      ],
      contents: [
        "Informatique pour enfants — Utilisation de l'ordinateur dès le début",
        "Anglais pour enfants Débutant — Vocabulaire et bases",
        "Anglais pour enfants Intermédiaire — Phrases et conversation",
        "Dessins animés éducatifs pour apprendre en s'amusant",
        "Exercices interactifs adaptés à l'âge de l'enfant",
        "Méthode ludique et progressive pour rester motivé",
      ],
    },
    {
      slug: "cle-tout-en-un",
      name: "CLE COMPLETE Tout-en-Un (64 Go)",
      shortDescription:
        "L'offre la plus complète : la Clé de Formations Complètes et la Clé SMART réunies.",
      longDescription:
        "Une seule clé USB 64 Go qui combine la Clé de Formations Complètes et la Clé SMART. Vous économisez par rapport à l'achat séparé des deux clés.",
      price: 16000,
      compareAtPrice: 39000,
      displayOrder: 4,
      whyChooseUs:
        "La clé la plus complète — treize modules dans une seule clé 64 Go. Tout ce dont vous avez besoin pour devenir un expert informatique. Accès plateforme en ligne 24h/24 inclus sans limite de durée.",
      targetAudience: [
        "Toute personne qui veut tout apprendre en une seule fois",
        "Professionnels qui veulent maximiser leur productivité",
        "Entrepreneurs qui veulent maîtriser tous les outils numériques",
        "Étudiants qui veulent se démarquer sur le marché du travail",
      ],
      contents: [
        "Excel Simple et Avancé — De débutant à expert",
        "Word de A à Z — Mise en page et publipostage",
        "PowerPoint de A à Z — Présentations professionnelles",
        "Intelligence Artificielle et ChatGPT — Automatisation",
        "Marketing Digital et Business en ligne",
        "Anglais Débutant, Intermédiaire et Avancé",
        "100 Meilleurs Livres PDF pour Entreprendre",
        "Maîtrise complète de l'ordinateur",
        "Prise de parole en public — Vidéos + Livres PDF + Audio",
        "150 Logiciels Excel (Facturation, Stock, Comptabilité, Budget)",
        "5500 Diapositives PowerPoint professionnelles prêtes à l'emploi",
        "Infographie et Design avec Canva",
        "Montage Vidéo professionnel avec Cap Cut",
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`✔ ${products.length} produits Boutique créés.`);
}

/**
 * Structure de modules/leçons pour la Clé de Formations Complètes, reprise
 * de l'organisation réelle de l'ancien catalogue (chapitres identifiés lors
 * de l'audit). `storagePath` est un chemin provisoire dans le bucket
 * Supabase Storage "formations" — les fichiers réels doivent y être
 * déposés (dashboard Supabase ou upload admin, à construire) avant que le
 * lecteur de l'Étape 15 puisse réellement diffuser un contenu.
 */
async function seedModulesAndLessons() {
  const product = await prisma.product.findUnique({
    where: { slug: "cle-formations-completes" },
  });
  if (!product) return;

  const modules = [
    {
      title: "Formation Excel",
      lessons: [
        {
          title: "Manuel de formations complètes Excel",
          type: "PDF" as const,
          storagePath: `${product.id}/formation-excel/manuel-excel.pdf`,
        },
      ],
    },
    {
      title: "Formation complète Word",
      lessons: [
        {
          title: "Livre de Formation complète Word",
          type: "PDF" as const,
          storagePath: `${product.id}/formation-word/manuel-word.pdf`,
        },
      ],
    },
    {
      title: "Formation en Intelligence Artificielle",
      lessons: [
        {
          title: "Manuel de formation en Intelligence Artificielle",
          type: "PDF" as const,
          storagePath: `${product.id}/formation-ia/manuel-ia.pdf`,
        },
      ],
    },
  ];

  for (const [moduleIndex, moduleData] of modules.entries()) {
    const existingModule = await prisma.module.findFirst({
      where: { productId: product.id, title: moduleData.title },
    });

    const createdModule =
      existingModule ??
      (await prisma.module.create({
        data: {
          productId: product.id,
          title: moduleData.title,
          displayOrder: moduleIndex,
        },
      }));

    for (const [lessonIndex, lesson] of moduleData.lessons.entries()) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { moduleId: createdModule.id, title: lesson.title },
      });
      if (existingLesson) continue;

      await prisma.lesson.create({
        data: {
          moduleId: createdModule.id,
          title: lesson.title,
          type: lesson.type,
          storagePath: lesson.storagePath,
          displayOrder: lessonIndex,
        },
      });
    }
  }

  console.log(`✔ Modules et leçons créés pour "${product.name}".`);
}

async function seedAdminAccount() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "… SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD non définis : compte admin de test ignoré.",
    );
    return;
  }

  const supabase = createSeedAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Admin Référence Informatique" },
  });

  if (error) {
    console.log(
      `… Compte admin non créé (${error.message}) — probablement déjà existant.`,
    );
    return;
  }

  // Le trigger `handle_new_user` (voir migration 0001) crée déjà le profil
  // avec le rôle CLIENT par défaut : on le repasse en ADMIN ici.
  await prisma.profile.update({
    where: { id: data.user.id },
    data: { role: "ADMIN" },
  });

  console.log(`✔ Compte admin de test créé (${email}).`);
}

async function main() {
  await seedServiceCategories();
  await seedProducts();
  await seedModulesAndLessons();
  await seedAdminAccount();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
