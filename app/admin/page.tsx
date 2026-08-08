import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default async function AdminDashboardPage() {
  const monthStart = startOfMonth();

  const [
    ordersThisMonth,
    paidOrdersThisMonth,
    pendingQuotes,
    activeAccessCount,
    pendingWhatsappOrders,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.findMany({
      where: { status: "PAYE", createdAt: { gte: monthStart } },
      select: { amount: true, channel: true },
    }),
    prisma.quoteRequest.count({
      where: { status: { in: ["NOUVEAU", "EN_DISCUSSION"] } },
    }),
    prisma.access.count(),
    prisma.order.count({
      where: { status: "EN_ATTENTE", paymentProvider: "WHATSAPP_MANUAL" },
    }),
  ]);

  const revenueByChannel = paidOrdersThisMonth.reduce(
    (acc, order) => {
      acc[order.channel] += order.amount;
      return acc;
    },
    { BOUTIQUE: 0, WHATSAPP: 0 },
  );
  const totalRevenue = revenueByChannel.BOUTIQUE + revenueByChannel.WHATSAPP;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-ink text-xl font-bold">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Commandes ce mois" value={String(ordersThisMonth)} />
        <StatCard
          label="CA ce mois"
          value={formatPrice(totalRevenue)}
          sub={`FedaPay ${formatPrice(revenueByChannel.BOUTIQUE)} · WhatsApp ${formatPrice(revenueByChannel.WHATSAPP)}`}
        />
        <StatCard
          label="Devis en attente"
          value={String(pendingQuotes)}
          highlight={pendingQuotes > 0}
        />
        <StatCard label="Accès actifs" value={String(activeAccessCount)} />
      </div>

      {pendingWhatsappOrders > 0 ? (
        <div className="border-warning bg-warning/10 flex items-center justify-between rounded-lg border p-4">
          <p className="text-ink text-sm font-medium">
            {pendingWhatsappOrders} commande(s) WhatsApp en attente de
            confirmation de paiement.
          </p>
          <a
            href="/admin/commandes?statut=EN_ATTENTE"
            className="text-brand text-sm font-semibold hover:underline"
          >
            Traiter →
          </a>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${highlight ? "border-warning bg-warning/5" : "border-line"}`}
    >
      <p className="text-ink-faint text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="text-ink tabular mt-2 text-2xl font-bold">{value}</p>
      {sub ? <p className="text-ink-faint mt-1 text-xs">{sub}</p> : null}
    </div>
  );
}
