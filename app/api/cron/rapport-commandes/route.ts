import { authorizeCron } from "@/lib/cron-auth";
import { sendPendingOrdersReport } from "@/lib/checkout/call-digest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Tâche planifiée (voir vercel.json, 9h/13h/19h) : rapport à l'équipe des
 * commandes non finalisées, pour relance téléphonique/WhatsApp manuelle.
 *
 * Protégée par CRON_SECRET (voir lib/cron-auth.ts) : SANS cette variable, la
 * tâche reste désactivée.
 */
export async function GET(request: Request) {
  const auth = authorizeCron(request);
  if (!auth.ok) return auth.response;

  const result = await sendPendingOrdersReport();
  return Response.json(result);
}
