/**
 * Import des clients de l'ancien site dans l'administration (groupe RI01).
 *
 *   npm run import:legacy -- "C:/chemin/vers/u827626354_RI_Database.sql"
 *   (ou LEGACY_DUMP_PATH=... npm run import:legacy)
 *
 * - Crée des FICHES DE SUIVI (table legacy_clients), jamais de compte de
 *   connexion : rien n'est ajouté dans Supabase Auth, aucun mot de passe n'est
 *   lu ni conservé.
 * - Rejouable : une fiche existante est mise à jour (clé = identifiant de
 *   l'ancien utilisateur), son code RI01-xxx ne change jamais, et les
 *   nouveaux clients reçoivent les numéros suivants.
 * - N'affiche que des totaux : aucune donnée personnelle dans la console.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { prisma } from "../lib/prisma/client";
import {
  buildLegacyClients,
  legacyClientCode,
  parseSqlInserts,
} from "../lib/legacy/parse-dump";

const BATCH = "RI01";

async function main() {
  const dumpPath = process.argv[2] ?? process.env.LEGACY_DUMP_PATH;
  if (!dumpPath) {
    throw new Error(
      'Indiquez l\'export SQL : npm run import:legacy -- "C:/chemin/export.sql"',
    );
  }

  const clients = buildLegacyClients(
    parseSqlInserts(readFileSync(dumpPath, "utf-8")),
  );

  const existing = await prisma.legacyClient.findMany({
    where: { batch: BATCH },
    select: { legacyUserId: true, code: true },
  });
  const codeByUser = new Map(existing.map((c) => [c.legacyUserId, c.code]));
  let nextRank =
    existing.reduce(
      (max, c) => Math.max(max, Number(c.code.split("-")[1]) || 0),
      0,
    ) + 1;

  let created = 0;
  let updated = 0;
  for (const client of clients) {
    const data = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city,
      signedUpAt: client.signedUpAt,
      purchases: client.purchases,
      adminNote: client.adminNote,
    };
    const code = codeByUser.get(client.legacyUserId);
    if (code) {
      await prisma.legacyClient.update({
        where: { legacyUserId: client.legacyUserId },
        data,
      });
      updated += 1;
    } else {
      await prisma.legacyClient.create({
        data: {
          ...data,
          batch: BATCH,
          code: legacyClientCode(BATCH, nextRank++),
          legacyUserId: client.legacyUserId,
        },
      });
      created += 1;
    }
  }

  const total = await prisma.legacyClient.count({ where: { batch: BATCH } });
  console.log(
    `✔ Groupe ${BATCH} : ${created} fiche(s) créée(s), ${updated} mise(s) à jour — ${total} au total.`,
  );
  console.log(
    `  ${clients.filter((c) => c.email).length} avec une vraie adresse email, ${clients.filter((c) => c.phone).length} avec un téléphone.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
