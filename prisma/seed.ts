/**
 * Script de seed — `npx prisma db seed`. Nécessite un vrai projet Supabase
 * connecté (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) :
 * voir .env.example.
 *
 * Les produits et les services ne sont PLUS définis ici : ils vivent dans le
 * code (lib/catalog/*), qui est la source de vérité des textes et des prix.
 * Ce script se contente d'aligner la base sur ce catalogue (lignes
 * nécessaires aux commandes et aux devis) et de préparer les contenus
 * livrables. Il est idempotent : on peut le relancer sans rien dupliquer.
 *
 * Livrables (livres numériques) — facultatif :
 *   DELIVERABLES_DIR="C:/chemin/vers/les/pdf" npx prisma db seed
 * téléverse les trois livres dans le bucket privé « formations » et crée
 * leur module/leçon. Sans cette variable, la base est quand même alignée.
 */
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma/client";
import { ensureProductRow, ensureServiceRow } from "../lib/catalog/db-sync";
import { ALL_PRODUCTS, ALL_SERVICES } from "../lib/catalog";

/**
 * Client admin construit ici plutôt qu'importé de lib/supabase/admin.ts : ce
 * fichier applicatif charge le paquet "server-only", qui lève volontairement
 * une erreur dès qu'il est importé hors du pipeline Next.js. Un script de
 * seed s'exécute via `tsx`, hors de ce pipeline.
 */
function createSeedAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function seedCatalogue() {
  for (const product of ALL_PRODUCTS) {
    await ensureProductRow(product.slug);
  }
  for (const service of ALL_SERVICES) {
    await ensureServiceRow(service.slug);
  }
  console.log(
    `✔ Base alignée sur le catalogue : ${ALL_PRODUCTS.length} produits, ${ALL_SERVICES.length} services.`,
  );
}

/**
 * Livres numériques : le produit EST le fichier PDF. (Les packs de
 * formations, eux, se livrent par un guide d'accès aux couleurs de
 * Référence Informatique — à fournir : les guides d'Expert du Numérique
 * portent d'autres coordonnées et ne doivent pas être envoyés tels quels.)
 */
const EBOOKS: { slug: string; file: string; lessonTitle: string }[] = [
  {
    slug: "le-chercheur-augmente",
    file: "le-chercheur-augmente-complet.pdf",
    lessonTitle: "Le Chercheur Augmenté : le guide complet (PDF)",
  },
  {
    slug: "verites-cachees-couples",
    file: "les-verites-cachees-qui-detruisent-les-couples-et-comment-les-eviter.pdf",
    lessonTitle: "Les Vérités Cachées qui Détruisent les Couples (PDF)",
  },
  {
    slug: "comprends-ce-quelle-traverse",
    file: "tristesse_inexpliquee_bouffees_de_chaleur_toujours_fatiguee_1.pdf",
    lessonTitle: "Comprends ce qu'elle traverse : le guide (PDF)",
  },
];

async function seedEbookDeliverables() {
  const dir = process.env.DELIVERABLES_DIR;
  if (!dir) {
    console.log(
      "… DELIVERABLES_DIR non défini : livres numériques non téléversés (voir l'en-tête du fichier).",
    );
    return;
  }

  const supabase = createSeedAdminClient();

  for (const ebook of EBOOKS) {
    const filePath = path.join(dir, ebook.file);
    if (!existsSync(filePath)) {
      console.log(`… Fichier introuvable, ignoré : ${filePath}`);
      continue;
    }

    const product = await prisma.product.findUnique({
      where: { slug: ebook.slug },
    });
    if (!product) continue;

    const storagePath = `${product.id}/livre/${ebook.file}`;
    const { error } = await supabase.storage
      .from("formations")
      .upload(storagePath, readFileSync(filePath), {
        contentType: "application/pdf",
        upsert: true,
      });
    if (error) {
      console.log(
        `… Téléversement impossible (${ebook.slug}) : ${error.message}`,
      );
      continue;
    }

    const existingModule = await prisma.module.findFirst({
      where: { productId: product.id, title: "Votre livre" },
    });
    const bookModule =
      existingModule ??
      (await prisma.module.create({
        data: { productId: product.id, title: "Votre livre", displayOrder: 0 },
      }));

    const existingLesson = await prisma.lesson.findFirst({
      where: { moduleId: bookModule.id },
    });
    if (existingLesson) {
      await prisma.lesson.update({
        where: { id: existingLesson.id },
        data: { title: ebook.lessonTitle, storagePath },
      });
    } else {
      await prisma.lesson.create({
        data: {
          moduleId: bookModule.id,
          title: ebook.lessonTitle,
          type: "PDF",
          storagePath,
          displayOrder: 0,
        },
      });
    }
    console.log(`✔ Livre téléversé : ${ebook.slug}`);
  }
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
  await seedCatalogue();
  await seedEbookDeliverables();
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
