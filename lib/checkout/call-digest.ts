import "server-only";
import { prisma } from "@/lib/prisma/client";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { sendPendingOrdersDigest } from "@/lib/email/send";
import { whatsappLinkTo, SITE } from "@/lib/site";
import { timeAgo } from "@/lib/format";
import type { PendingOrderDigestRow } from "@/lib/email/templates/pending-orders-digest";

const MAX_ROWS = 100;

/**
 * Rapport admin (9h/13h/19h, voir vercel.json) des commandes EN_ATTENTE/ECHOUE
 * jamais encore signalées (adminDigestSentAt) — une commande n'apparaît
 * qu'une seule fois dans ces rapports, même si elle reste impayée des jours
 * plus tard. Revérifie chaque commande SasPay en attente avant de la
 * signaler : un paiement confirmé entre-temps (webhook reçu juste avant ce
 * cron) ne doit jamais déclencher un appel inutile au client.
 */
export async function sendPendingOrdersReport() {
  const candidates = await prisma.order.findMany({
    where: {
      status: { in: ["EN_ATTENTE", "ECHOUE"] },
      adminDigestSentAt: null,
    },
    include: { product: true, service: true, profile: true },
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
  });

  const toReport: typeof candidates = [];
  let recovered = 0;
  for (const order of candidates) {
    if (
      order.status === "EN_ATTENTE" &&
      order.paymentProvider === "SASPAY" &&
      order.providerSessionId
    ) {
      try {
        const nowPaid = await syncSaspayOrder(order);
        if (nowPaid) {
          await prisma.order.update({
            where: { id: order.id },
            data: { adminDigestSentAt: new Date() },
          });
          recovered += 1;
          continue;
        }
      } catch (error) {
        console.error(
          `[rapport-commandes] revérification échouée (${order.id}) :`,
          error,
        );
      }
    }
    toReport.push(order);
  }

  const rows: PendingOrderDigestRow[] = toReport.map((order) => ({
    reference: order.id.slice(0, 8).toUpperCase(),
    clientName: order.profile.name,
    clientPhone: order.profile.phone,
    clientCountry: order.profile.country,
    clientEmail: order.profile.email,
    productName: order.product?.name ?? order.service?.name ?? "—",
    amount: order.amount,
    status: order.status === "ECHOUE" ? "ECHOUE" : "EN_ATTENTE",
    createdAgo: timeAgo(order.createdAt),
    whatsappUrl: order.profile.phone
      ? whatsappLinkTo(
          order.profile.phone,
          `Bonjour ${order.profile.name.split(" ")[0]}, c'est Référence Informatique au sujet de votre commande.`,
        )
      : null,
    adminUrl: `${SITE.url}/admin/commandes/${order.id}`,
  }));

  await sendPendingOrdersDigest(rows);
  if (toReport.length > 0) {
    await prisma.order.updateMany({
      where: { id: { in: toReport.map((o) => o.id) } },
      data: { adminDigestSentAt: new Date() },
    });
  }
  return { reported: toReport.length, recovered };
}
