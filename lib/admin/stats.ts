import "server-only";
import { prisma } from "@/lib/prisma/client";

const DAY = 86_400_000;

/**
 * Chiffres du tableau de bord. Tout est calculé en base, jamais estimé :
 * le chiffre d'affaires ne compte que les commandes PAYÉES, et un chiffre
 * qu'on ne peut pas calculer s'affiche vide plutôt qu'inventé.
 */
export async function getDashboard() {
  const now = new Date();
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const d7 = new Date(now.getTime() - 7 * DAY);
  const d30 = new Date(now.getTime() - 30 * DAY);
  const hourAgo = new Date(now.getTime() - 3_600_000);

  const paidSince = (since?: Date) =>
    prisma.order.aggregate({
      where: {
        status: "PAYE",
        ...(since ? { paidAt: { gte: since } } : {}),
      },
      _sum: { amount: true },
      _count: true,
    });

  const [
    today,
    week,
    month,
    total,
    created30,
    pending,
    cancelled30,
    newCustomers,
    quotesToHandle,
    messagesToHandle,
    toPrepare,
    enRoute,
    pendingWhatsapp,
    latestOrders,
    pendingOver1h,
    lastWebhook,
    chartRows,
  ] = await Promise.all([
    paidSince(startOfToday),
    paidSince(d7),
    paidSince(d30),
    paidSince(),
    prisma.order.count({ where: { createdAt: { gte: d30 } } }),
    prisma.order.count({ where: { status: "EN_ATTENTE" } }),
    prisma.order.count({
      where: { status: { in: ["ANNULE", "ECHOUE"] }, createdAt: { gte: d30 } },
    }),
    prisma.profile.count({
      where: { role: "CLIENT", createdAt: { gte: d30 } },
    }),
    prisma.quoteRequest.count({
      where: { status: { in: ["NOUVEAU", "EN_DISCUSSION"] } },
    }),
    prisma.contactMessage.count({ where: { handled: false } }),
    prisma.order.count({
      where: { status: "PAYE", deliveryStatus: "A_PREPARER" },
    }),
    prisma.order.count({
      where: { status: "PAYE", deliveryStatus: "EN_LIVRAISON" },
    }),
    prisma.order.count({
      where: { status: "EN_ATTENTE", paymentProvider: "WHATSAPP_MANUAL" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: true, profile: true },
    }),
    prisma.order.findMany({
      where: {
        status: "EN_ATTENTE",
        paymentProvider: "SASPAY",
        providerSessionId: { not: null },
        createdAt: { lt: hourAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: true, profile: true },
    }),
    prisma.webhookEvent.findFirst({
      where: { provider: "SASPAY", status: "VERIFIED" },
      orderBy: { receivedAt: "desc" },
    }),
    prisma.$queryRaw<{ day: Date; total: bigint; count: bigint }[]>`
      SELECT date_trunc('day', paid_at) AS day,
             COALESCE(SUM(amount), 0) AS total,
             COUNT(*) AS count
      FROM orders
      WHERE status = 'PAYE' AND paid_at >= ${d30}
      GROUP BY 1 ORDER BY 1`,
  ]);

  // Série complète sur 30 jours (les jours sans vente valent 0).
  const byDay = new Map(
    chartRows.map((row) => [
      new Date(row.day).toISOString().slice(0, 10),
      { total: Number(row.total), count: Number(row.count) },
    ]),
  );
  const chart = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(startOfToday.getTime() - (29 - index) * DAY);
    const key = date.toISOString().slice(0, 10);
    return { date: key, ...(byDay.get(key) ?? { total: 0, count: 0 }) };
  });

  const paid30 = month._count;
  const revenue30 = month._sum.amount ?? 0;

  return {
    revenue: {
      today: today._sum.amount ?? 0,
      week: week._sum.amount ?? 0,
      month: revenue30,
      total: total._sum.amount ?? 0,
    },
    orders: {
      paid30,
      created30,
      pending,
      cancelled30,
      paidTotal: total._count,
    },
    averageBasket: paid30 > 0 ? Math.round(revenue30 / paid30) : 0,
    conversion: created30 > 0 ? Math.round((paid30 / created30) * 100) : 0,
    newCustomers,
    quotesToHandle,
    messagesToHandle,
    delivery: { toPrepare, enRoute },
    pendingWhatsapp,
    latestOrders,
    pendingOver1h,
    chart,
    lastWebhook,
  };
}
