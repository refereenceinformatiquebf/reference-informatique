import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma/client";

/**
 * Limitation de débit PARTAGÉE entre toutes les instances du site : les
 * compteurs sont en base (table rate_limits), pas en mémoire. Sur Vercel,
 * chaque requête peut tomber sur une instance différente : un compteur en
 * mémoire laisserait passer un robot qui boucle.
 *
 * Si la base est momentanément injoignable, on retombe sur un compteur en
 * mémoire (moins fiable, mais le site reste utilisable) plutôt que de bloquer
 * tous les visiteurs.
 */

export class RateLimitError extends Error {
  constructor() {
    super("Trop de tentatives. Réessayez dans quelques minutes.");
  }
}

type Bucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, Bucket>();

function enforceInMemory(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }
  if (bucket.count >= limit) throw new RateLimitError();
  bucket.count += 1;
}

async function clientIp() {
  const headersList = await headers();
  return (
    headersList.get("x-real-ip") ??
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * @param action Identifiant de l'action limitée (ex. « sign-in »).
 * @param limit Nombre de tentatives autorisées par fenêtre.
 * @param windowSeconds Durée de la fenêtre, en secondes.
 * @param identifier Ce qui est limité EN PLUS de l'adresse IP (ex. l'email
 *   visé par une demande de lien) : empêche d'inonder une boîte mail depuis
 *   plusieurs adresses IP.
 * @throws {RateLimitError} si la limite est dépassée.
 */
export async function enforceRateLimit(
  action: string,
  limit: number,
  windowSeconds: number,
  identifier?: string,
) {
  const ip = await clientIp();
  const keys = [`${action}:ip:${ip}`];
  if (identifier) {
    keys.push(`${action}:id:${identifier.trim().toLowerCase().slice(0, 200)}`);
  }

  for (const key of keys) {
    const resetAt = new Date(Date.now() + windowSeconds * 1000);
    try {
      // Incrément atomique : un seul aller-retour, sûr même sous charge.
      const rows = await prisma.$queryRaw<{ count: number }[]>`
        INSERT INTO rate_limits (key, count, reset_at)
        VALUES (${key}, 1, ${resetAt})
        ON CONFLICT (key) DO UPDATE SET
          count = CASE WHEN rate_limits.reset_at < now() THEN 1 ELSE rate_limits.count + 1 END,
          reset_at = CASE WHEN rate_limits.reset_at < now() THEN ${resetAt} ELSE rate_limits.reset_at END
        RETURNING count`;
      if ((rows[0]?.count ?? 1) > limit) throw new RateLimitError();
    } catch (error) {
      if (error instanceof RateLimitError) throw error;
      console.error(
        "[rate-limit] base indisponible, repli en mémoire :",
        error,
      );
      enforceInMemory(key, limit, windowSeconds);
    }
  }

  // Ménage occasionnel des compteurs expirés (1 appel sur 50).
  if (Math.random() < 0.02) {
    prisma.rateLimit
      .deleteMany({
        where: { resetAt: { lt: new Date(Date.now() - 86_400_000) } },
      })
      .catch(() => undefined);
  }
}
