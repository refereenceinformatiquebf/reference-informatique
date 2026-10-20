import "server-only";
import { prisma } from "@/lib/prisma/client";
import { addOrderEvent, getClientEmail } from "@/lib/orders";
import { sendPaymentReminder } from "@/lib/email/send";
import { getProduct } from "@/lib/catalog/live";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { trackingUrlFor } from "./access";

const HOUR_MS = 60 * 60 * 1000;

/** Une commande abandonnée est relancée entre 1 h et 3 jours après sa création :
 * ni trop tôt (le client est peut-être encore en train de payer), ni trop tard. */
const MIN_AGE_HOURS = 1;
const MAX_AGE_HOURS = 72;
const MAX_PER_RUN = 25;

export type ReminderOutcome =
  | "sent"
  /** Le paiement avait en réalité abouti : la commande est maintenant payée. */
  | "paid"
  | "skipped_status"
  | "skipped_no_email"
  | "skipped_already_reminded"
  | "skipped_other_order_paid";

/**
 * Relance UNE commande dont le paiement n'a pas été terminé. Garde-fous :
 *  - une seule relance par commande ;
 *  - on revérifie d'abord auprès de SasPay (un paiement en retard n'est pas relancé) ;
 *  - pas de relance si le client a payé ce produit par une autre commande.
 */
export async function remindOrder(
  orderId: string,
  options: { actorLabel: string; force?: boolean },
): Promise<ReminderOutcome> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, profile: true },
  });
  if (!order || order.status !== "EN_ATTENTE" || !order.product) {
    return "skipped_status";
  }
  if (order.reminderSentAt && !options.force) return "skipped_already_reminded";

  if (order.paymentProvider === "SASPAY" && order.providerSessionId) {
    const nowPaid = await syncSaspayOrder(order).catch(() => false);
    if (nowPaid) return "paid";
  }

  const paidElsewhere = await prisma.order.count({
    where: {
      profileId: order.profileId,
      productId: order.productId,
      status: "PAYE",
    },
  });
  if (paidElsewhere > 0 && order.product) return "skipped_other_order_paid";

  const email = await getClientEmail(order.profile);
  if (!email) return "skipped_no_email";

  // Réservation atomique : si deux exécutions se chevauchent (tâche Vercel et
  // planificateur externe), une seule envoie — jamais deux relances au client.
  if (!options.force) {
    const claimed = await prisma.order.updateMany({
      where: { id: order.id, status: "EN_ATTENTE", reminderSentAt: null },
      data: { reminderSentAt: new Date() },
    });
    if (claimed.count === 0) return "skipped_already_reminded";
  }

  try {
    await sendPaymentReminder({
      to: email,
      clientName: order.profile.name,
      productName: order.product.name,
      amount: order.amount,
      quantity: order.quantity,
      orderId: order.id,
      trackUrl: await trackingUrlFor(order.id),
      licence:
        (await getProduct(order.product.slug))?.delivery === "licence-edn",
      orderedAt: order.createdAt,
    });
  } catch (error) {
    // Envoi échoué : on libère la réservation pour que la prochaine exécution réessaie.
    if (!options.force) {
      await prisma.order.update({
        where: { id: order.id },
        data: { reminderSentAt: null },
      });
    }
    throw error;
  }
  await prisma.order.update({
    where: { id: order.id },
    data: { reminderSentAt: new Date() },
  });
  await addOrderEvent(
    order.id,
    "REMINDER",
    "Relance de paiement envoyée au client.",
    options.actorLabel,
  );
  return "sent";
}

/** Tâche planifiée : relance les commandes abandonnées dont le tour est venu. */
export async function sendDueReminders() {
  const now = Date.now();
  const due = await prisma.order.findMany({
    where: {
      status: "EN_ATTENTE",
      channel: "BOUTIQUE",
      paymentProvider: "SASPAY",
      manual: false,
      reminderSentAt: null,
      createdAt: {
        gte: new Date(now - MAX_AGE_HOURS * HOUR_MS),
        lte: new Date(now - MIN_AGE_HOURS * HOUR_MS),
      },
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: MAX_PER_RUN,
  });

  const result = {
    checked: due.length,
    sent: 0,
    paid: 0,
    skipped: 0,
    failed: 0,
  };
  for (const { id } of due) {
    try {
      const outcome = await remindOrder(id, {
        actorLabel: "Relance automatique",
      });
      if (outcome === "sent") result.sent += 1;
      else if (outcome === "paid") result.paid += 1;
      else result.skipped += 1;
    } catch (error) {
      result.failed += 1;
      console.error(`[reminders] relance impossible (${id}) :`, error);
    }
  }
  return result;
}
