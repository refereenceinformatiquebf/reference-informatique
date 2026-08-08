import { NextResponse } from "next/server";
import {
  constructFedapayEvent,
  FedapayWebhookSignatureError,
} from "@/lib/payments/fedapay";
import { markOrderPaid } from "@/lib/orders";

type FedapayTransactionEntity = {
  id: number;
  status: string;
  amount: number;
  custom_metadata?: { orderId?: string };
};

type FedapayEvent = {
  name: string;
  entity: FedapayTransactionEntity;
};

export async function POST(request: Request) {
  const signature = request.headers.get("x-fedapay-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 401 });
  }

  // La signature ne se vérifie que sur le corps BRUT — jamais un objet déjà
  // parsé puis re-sérialisé, dont la représentation textuelle ne serait
  // pas garantie identique.
  const rawBody = await request.text();

  let event: FedapayEvent;
  try {
    event = constructFedapayEvent(rawBody, signature);
  } catch (error) {
    if (error instanceof FedapayWebhookSignatureError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const orderId = event.entity.custom_metadata?.orderId;
  if (!orderId) {
    // Événement FedaPay sans rapport avec une Order (ex. webhook de test) —
    // on répond 200 pour que FedaPay ne le retente pas indéfiniment.
    return NextResponse.json({ received: true });
  }

  if (event.name === "transaction.approved") {
    const result = await markOrderPaid({
      orderId,
      provider: "FEDAPAY",
      providerRef: String(event.entity.id),
      amount: event.entity.amount,
      rawStatus: event.entity.status,
      rawPayload: event,
    });

    if (!result.ok) {
      // Order introuvable : on répond 200 quand même — retenter n'y
      // changera rien, et on ne veut pas que FedaPay boucle indéfiniment
      // sur un identifiant qui n'existera jamais.
      console.error(`[fedapay-webhook] Order introuvable : ${orderId}`);
    }
  }

  if (
    event.name === "transaction.declined" ||
    event.name === "transaction.canceled"
  ) {
    // Statut informatif uniquement — l'Order reste EN_ATTENTE pour que le
    // client puisse retenter le paiement depuis son espace.
    console.info(
      `[fedapay-webhook] Transaction ${event.entity.id} ${event.name} pour l'Order ${orderId}`,
    );
  }

  return NextResponse.json({ received: true });
}
