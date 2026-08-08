import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Client Prisma singleton. Prisma 7 (générateur `prisma-client`) exige un
 * adaptateur de connexion explicite — ici `@prisma/adapter-pg`, qui utilise
 * DATABASE_URL (pooler Supabase en mode transaction, port 6543) — la même
 * valeur partout, développement comme production. Ce module ne passe
 * jamais par prisma.config.ts : DIRECT_URL (configuré là-bas, pour la CLI
 * `prisma migrate`) n'entre jamais en jeu ici.
 *
 * En développement, le rechargement à chaud de Next.js réévalue ce module à
 * chaque changement de fichier — sans cette précaution, chaque rechargement
 * ouvrirait un nouveau pool de connexions au lieu de réutiliser le
 * précédent, jusqu'à épuiser les connexions disponibles côté base.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
