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
import { prisma } from "../lib/prisma/client";
import { createAdminClient } from "../lib/supabase/admin";

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
      price: 12000,
      compareAtPrice: 25000,
      displayOrder: 1,
    },
    {
      slug: "cle-formations-smart",
      name: "Clé de formations SMART",
      shortDescription:
        "La clé intelligente pour maîtriser votre ordinateur et booster votre productivité.",
      price: 14000,
      compareAtPrice: 20000,
      displayOrder: 2,
    },
    {
      slug: "cle-enfants",
      name: "Clé pour Enfants — Informatique et Anglais",
      shortDescription:
        "Clé USB 32 Go spécialement conçue pour préparer les enfants à réussir demain.",
      price: 10000,
      compareAtPrice: 15000,
      displayOrder: 3,
    },
    {
      slug: "cle-tout-en-un",
      name: "CLE COMPLETE Tout-en-Un (64 Go)",
      shortDescription:
        "L'offre la plus complète : la Clé de Formations Complètes et la Clé SMART réunies.",
      price: 16000,
      compareAtPrice: 39000,
      displayOrder: 4,
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

async function seedAdminAccount() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "… SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD non définis : compte admin de test ignoré.",
    );
    return;
  }

  const supabase = createAdminClient();
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
