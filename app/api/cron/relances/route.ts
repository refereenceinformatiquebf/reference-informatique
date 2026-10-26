import { authorizeCron } from "@/lib/cron-auth";
import { sendDueReminders } from "@/lib/checkout/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Tâche planifiée (voir vercel.json) : une relance, une seule, pour chaque
 * commande dont le paiement n'a pas été terminé.
 *
 * Protégée par CRON_SECRET : Vercel l'envoie dans l'en-tête Authorization à
 * chaque appel planifié. SANS cette variable, la tâche reste désactivée : on
 * ne laisse jamais une adresse publique déclencher des emails.
 */
export async function GET(request: Request) {
  const auth = authorizeCron(request);
  if (!auth.ok) return auth.response;

  const result = await sendDueReminders();
  return Response.json(result);
}
