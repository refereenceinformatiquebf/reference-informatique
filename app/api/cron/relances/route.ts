import { timingSafeEqual } from "node:crypto";
import { sendDueReminders } from "@/lib/checkout/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Tâche planifiée (voir vercel.json) : une relance, une seule, pour chaque
 * commande dont le paiement n'a pas été terminé.
 *
 * Protégée par CRON_SECRET : Vercel l'envoie dans l'en-tête Authorization à
 * chaque appel planifié. SANS cette variable, la tâche reste désactivée : on
 * ne laisse jamais une adresse publique déclencher des emails.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({
      disabled: true,
      message:
        "CRON_SECRET n'est pas défini : les relances automatiques sont désactivées.",
    });
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!safeEqual(authorization, `Bearer ${secret}`)) {
    return new Response("Non autorisé", { status: 401 });
  }

  const result = await sendDueReminders();
  return Response.json(result);
}
