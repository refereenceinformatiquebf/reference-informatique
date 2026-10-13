import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminHeader,
  Kpi,
  Panel,
  ResponsiveTable,
  RowLink,
  StatusBadge,
} from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { getDashboard } from "@/lib/admin/stats";
import { verifySaspayOrderAction } from "@/lib/actions/admin/orders";
import { formatDateTime, formatPrice, timeAgo } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";

export const metadata: Metadata = { title: "Tableau de bord" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const d = await getDashboard();
  const todo =
    d.delivery.toPrepare +
    d.delivery.enRoute +
    d.quotesToHandle +
    d.messagesToHandle +
    d.pendingWhatsapp;

  return (
    <>
      <AdminHeader
        title="Tableau de bord"
        subtitle="Ventes confirmées uniquement (commandes payées)."
      />

      {d.alerts.length > 0 ? (
        <ul className="mb-6 space-y-2" aria-label="Alertes">
          {d.alerts.map((alert) => (
            <li
              key={alert.text}
              role="alert"
              className={`rounded-lg border px-4 py-3 text-sm ${
                alert.level === "danger"
                  ? "border-danger bg-danger-bg text-danger-text"
                  : "border-warning bg-warning-bg text-warning-text"
              }`}
            >
              {alert.href ? (
                <Link
                  href={alert.href}
                  className="underline underline-offset-4"
                >
                  {alert.text}
                </Link>
              ) : (
                alert.text
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <Panel title="À faire maintenant" className="mb-6">
        {todo === 0 ? (
          <p className="text-ink-soft text-sm">
            Rien en attente : tout est traité.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi
              label="Clés à préparer"
              value={d.delivery.toPrepare}
              tone={d.delivery.toPrepare > 0 ? "warning" : "default"}
              href="/admin/commandes?livraison=A_PREPARER"
            />
            <Kpi
              label="Clés en livraison"
              value={d.delivery.enRoute}
              href="/admin/commandes?livraison=EN_LIVRAISON"
            />
            <Kpi
              label="Commandes WhatsApp à confirmer"
              value={d.pendingWhatsapp}
              tone={d.pendingWhatsapp > 0 ? "warning" : "default"}
              href="/admin/commandes?statut=EN_ATTENTE&canal=WHATSAPP"
            />
            <Kpi
              label="Devis à traiter"
              value={d.quotesToHandle}
              tone={d.quotesToHandle > 0 ? "warning" : "default"}
              href="/admin/devis"
            />
            <Kpi
              label="Messages non traités"
              value={d.messagesToHandle}
              tone={d.messagesToHandle > 0 ? "warning" : "default"}
              href="/admin/messages"
            />
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ventes aujourd'hui" value={formatPrice(d.revenue.today)} />
        <Kpi label="7 derniers jours" value={formatPrice(d.revenue.week)} />
        <Kpi label="30 derniers jours" value={formatPrice(d.revenue.month)} />
        <Kpi
          label="Total depuis l'ouverture"
          value={formatPrice(d.revenue.total)}
        />
        <Kpi
          label="Commandes payées (30 j)"
          value={d.orders.paid30}
          hint={`${d.orders.pending} en attente · ${d.orders.cancelled30} annulée(s)`}
          href="/admin/commandes?statut=PAYE"
        />
        <Kpi
          label="Panier moyen"
          value={d.orders.paid30 > 0 ? formatPrice(d.averageBasket) : "—"}
        />
        <Kpi
          label="Conversion (30 j)"
          value={d.orders.created30 > 0 ? `${d.conversion} %` : "—"}
          hint="Commandes payées / commandes créées"
        />
        <Kpi
          label="Nouveaux clients (30 j)"
          value={d.newCustomers}
          href="/admin/clients"
        />
      </div>

      <Panel title="Ventes sur 30 jours" className="mt-6">
        <RevenueChart data={d.chart} />
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel
          title="Dernières commandes"
          actions={<RowLink href="/admin/commandes">Tout voir</RowLink>}
        >
          <ResponsiveTable
            rows={d.latestOrders}
            rowKey={(order) => order.id}
            empty="Aucune commande pour le moment."
            columns={[
              {
                header: "Client",
                cell: (order) => (
                  <RowLink href={`/admin/commandes/${order.id}`}>
                    {order.profile.name}
                  </RowLink>
                ),
              },
              {
                header: "Produit",
                hideOnMobile: true,
                cell: (order) => order.product?.name ?? "—",
              },
              {
                header: "Statut",
                cell: (order) => {
                  const status = ORDER_STATUS_LABELS[order.status];
                  return (
                    <StatusBadge
                      label={status.label}
                      variant={status.variant}
                    />
                  );
                },
              },
              {
                header: "Montant",
                right: true,
                cell: (order) => formatPrice(order.amount),
              },
            ]}
          />
        </Panel>

        <Panel title="Meilleurs produits (30 jours)">
          <ResponsiveTable
            rows={d.topProducts}
            rowKey={(product) => product.name}
            empty="Aucune vente sur la période."
            columns={[
              { header: "Produit", cell: (product) => product.name },
              {
                header: "Ventes",
                right: true,
                cell: (product) => product.count,
              },
              {
                header: "Revenus",
                right: true,
                cell: (product) => formatPrice(product.revenue),
              },
            ]}
          />
        </Panel>

        <Panel
          title="Paiements en ligne en attente depuis plus d'une heure"
          className="xl:col-span-2"
        >
          <ResponsiveTable
            rows={d.pendingOver1h}
            rowKey={(order) => order.id}
            empty="Aucun paiement en attente prolongée."
            columns={[
              {
                header: "Client",
                cell: (order) => (
                  <RowLink href={`/admin/commandes/${order.id}`}>
                    {order.profile.name}
                  </RowLink>
                ),
              },
              {
                header: "Produit",
                hideOnMobile: true,
                cell: (order) => order.product?.name ?? "—",
              },
              { header: "Créée", cell: (order) => timeAgo(order.createdAt) },
              {
                header: "Montant",
                right: true,
                cell: (order) => formatPrice(order.amount),
              },
              {
                header: "Action",
                right: true,
                cell: (order) => (
                  <AdminAction
                    action={verifySaspayOrderAction}
                    hidden={{ orderId: order.id }}
                    label="Vérifier maintenant"
                  />
                ),
              },
            ]}
          />
        </Panel>
      </div>

      <p className="text-ink-faint mt-6 text-xs">
        Dernière notification SasPay valide :{" "}
        {d.lastWebhook
          ? `${timeAgo(d.lastWebhook.receivedAt)} (${formatDateTime(d.lastWebhook.receivedAt)})`
          : "aucune reçue pour l'instant"}
        .
      </p>
    </>
  );
}
