import "server-only";
import { prisma } from "@/lib/prisma/client";
import { markOrderPaid } from "@/lib/orders";
import {
  getSaspaySessionStatus,
  isSaspaySessionPaid,
} from "@/lib/payments/saspay";

type PendingSaspayOrder = {
  id: string;
  amount: number;
  providerSessionId: string | null;
};

/**
 * Revérifie auprès de SasPay une commande en attente et, si la session est
 * réellement payée, la marque payée. Idempotent : appelable depuis le
 * webhook ET depuis la page de retour sans risque de double activation
 * (contrainte unique Payment(provider, providerRef) dans markOrderPaid).
 *
 * Renvoie true si la commande est payée à l'issue de l'appel.
 */
export async function syncSaspayOrder(order: PendingSaspayOrder) {
  if (!order.providerSessionId) return false;

  const status = await getSaspaySessionStatus(order.providerSessionId);
  if (!isSaspaySessionPaid(status)) return false;

  const result = await markOrderPaid({
    orderId: order.id,
    provider: "SASPAY",
    // Sans id de transaction (cas non documenté), la session — unique par
    // commande et par tentative — garde le rapprochement idempotent.
    providerRef: status.transactionId ?? order.providerSessionId,
    amount: order.amount,
    rawStatus: status.transactionStatus ?? status.status,
    rawPayload: status,
  });

  return result.ok;
}

/** Nombre maximal de commandes revérifiées par webhook — borne le nombre
 * d'appels API (limite SasPay : 300/min). */
const MAX_PENDING_TO_CHECK = 20;
const PENDING_WINDOW_DAYS = 7;

/**
 * Appelée à chaque webhook `transaction.success`. Comme le webhook ne dit
 * pas à quelle commande il se rapporte, on revérifie les commandes SasPay
 * récentes encore en attente. Auto-réparateur : une commande payée dont le
 * webhook se serait perdu est rattrapée au passage.
 *
 * Renvoie le nombre de commandes passées à « payé » et le nombre de
 * vérifications en échec (pour que le webhook demande un nouvel essai).
 */
export async function syncPendingSaspayOrders() {
  const since = new Date(
    Date.now() - PENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const pending = await prisma.order.findMany({
    where: {
      paymentProvider: "SASPAY",
      status: "EN_ATTENTE",
      providerSessionId: { not: null },
      createdAt: { gte: since },
    },
    select: { id: true, amount: true, providerSessionId: true },
    orderBy: { createdAt: "desc" },
    take: MAX_PENDING_TO_CHECK,
  });

  let paid = 0;
  let failed = 0;

  for (const order of pending) {
    try {
      if (await syncSaspayOrder(order)) paid += 1;
    } catch (error) {
      failed += 1;
      console.error(
        `[saspay-sync] Vérification impossible (${order.id}) :`,
        error,
      );
    }
  }

  return { checked: pending.length, paid, failed };
}
