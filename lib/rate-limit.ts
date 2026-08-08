import "server-only";
import { headers } from "next/headers";

/**
 * Limitation de débit en mémoire — délibérément simple. Sur une plateforme
 * serverless multi-instances (Vercel en production), chaque instance a sa
 * propre mémoire : cette protection réduit les abus grossiers (un même
 * visiteur qui boucle sur un formulaire) mais n'est PAS une garantie stricte
 * contre un attaquant distribué. Le chantier documenté pour une limite
 * réellement fiable est un compteur partagé (Upstash Redis) — nécessite un
 * compte externe, volontairement non ajouté tant que ce n'est pas mesuré
 * comme nécessaire (voir PLAYBOOK-CONSTRUCTION.md, Étape 19).
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Purge périodique pour ne pas accumuler indéfiniment des entrées expirées.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  },
  10 * 60 * 1000,
).unref?.();

export class RateLimitError extends Error {
  constructor() {
    super("Trop de tentatives. Réessayez dans quelques minutes.");
  }
}

/**
 * @param action Identifiant de l'action limitée (ex. "sign-in").
 * @param limit Nombre de tentatives autorisées par fenêtre.
 * @param windowSeconds Durée de la fenêtre glissante, en secondes.
 * @throws {RateLimitError} si la limite est dépassée.
 */
export async function enforceRateLimit(
  action: string,
  limit: number,
  windowSeconds: number,
) {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return;
  }

  if (bucket.count >= limit) {
    throw new RateLimitError();
  }

  bucket.count += 1;
}
