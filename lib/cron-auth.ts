import { timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Protection des tâches planifiées : `Authorization: Bearer <CRON_SECRET>`
 * (Vercel Cron l'envoie automatiquement quand la variable CRON_SECRET
 * existe). Sans secret configuré, la tâche reste désactivée — jamais
 * ouverte par défaut. Partagée par toutes les routes sous app/api/cron/*.
 */
export function authorizeCron(
  request: Request,
): { ok: true } | { ok: false; response: Response } {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return {
      ok: false,
      response: Response.json({
        disabled: true,
        message:
          "CRON_SECRET n'est pas défini : les tâches automatiques sont désactivées.",
      }),
    };
  }
  const authorization = request.headers.get("authorization") ?? "";
  if (!safeEqual(authorization, `Bearer ${secret}`)) {
    return {
      ok: false,
      response: new Response("Non autorisé", { status: 401 }),
    };
  }
  return { ok: true };
}
