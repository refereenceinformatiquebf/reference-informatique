import { NextResponse } from "next/server";
import {
  constructSaspayEvent,
  SaspayWebhookSignatureError,
  type SaspayWebhookEvent,
} from "@/lib/payments/saspay";
import { syncPendingSaspayOrders } from "@/lib/payments/saspay-sync";

export async function POST(request: Request) {
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");
  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 401 });
  }

  // La signature ne se vérifie que sur le corps BRUT — jamais un objet déjà
  // parsé puis re-sérialisé, dont la représentation textuelle ne serait
  // pas garantie identique.
  const rawBody = await request.text();

  let event: SaspayWebhookEvent;
  try {
    event = constructSaspayEvent(rawBody, signature, timestamp);
  } catch (error) {
    if (error instanceof SaspayWebhookSignatureError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  if (event.event === "transaction.success") {
    // Le webhook ne dit pas à quelle commande il se rapporte : on s'en sert
    // comme déclencheur et on revérifie les commandes en attente auprès de
    // l'API SasPay (voir lib/payments/saspay.ts).
    const { checked, paid, failed } = await syncPendingSaspayOrders();

    if (failed > 0) {
      // Vérification impossible (API SasPay indisponible…) : on répond 500
      // pour que SasPay retente (5 essais étalés sur 2 h). Sans risque —
      // le traitement est idempotent.
      return NextResponse.json(
        { error: "Vérification différée" },
        { status: 500 },
      );
    }

    if (paid === 0) {
      console.warn(
        `[saspay-webhook] transaction.success ${event.data.id ?? "?"} : aucune commande en attente rapprochée (${checked} vérifiée(s)).`,
      );
    }
  }

  if (
    event.event === "transaction.failed" ||
    event.event === "transaction.cancelled"
  ) {
    // Statut informatif uniquement — la commande reste EN_ATTENTE pour que
    // le client puisse retenter le paiement depuis son espace.
    console.info(
      `[saspay-webhook] Transaction ${event.data.id ?? "?"} : ${event.event}`,
    );
  }

  // Tous les autres événements (settlement.*, wallet_transfer.*,
  // webhook.test…) sont acquittés sans traitement.
  return NextResponse.json({ received: true });
}
