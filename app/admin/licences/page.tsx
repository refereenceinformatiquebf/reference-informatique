import type { Metadata } from "next";
import {
  AdminHeader,
  Kpi,
  Panel,
  ResponsiveTable,
  StatusBadge,
} from "@/components/admin/ui";
import {
  getConsumptionForecast,
  getLocalStockOverview,
  listLicenceProblems,
  listLicenceSales,
} from "@/lib/licences/stock";
import { safeGetEdnPartnerStatus } from "@/lib/licences/edn";
import { listPendingLicences } from "@/lib/licences/fulfil";
import { formatDateTime } from "@/lib/format";
import { PullLotForm } from "./pull-lot-form";
import { DeliverPendingForm } from "./deliver-pending-form";

export const metadata: Metadata = { title: "Licences EDN" };
export const dynamic = "force-dynamic";

const PROBLEM_LABELS: Record<string, string> = {
  "licence.quota_reached": "Quota de licences épuisé",
  "licence.claim_failed": "Échec de récupération (API indisponible ?)",
};

export default async function AdminLicencesPage() {
  const [status, stock, sales, problems, forecast, waiting] = await Promise.all(
    [
      safeGetEdnPartnerStatus(),
      getLocalStockOverview(),
      listLicenceSales(),
      listLicenceProblems(),
      getConsumptionForecast(),
      listPendingLicences(),
    ],
  );
  const lowStock =
    stock.available <= Math.max(5, Math.ceil(stock.totalReceived * 0.1));
  const forecastUrgent =
    forecast.daysRemaining !== null && forecast.daysRemaining <= 14;

  return (
    <>
      <AdminHeader
        title="Licences EDN"
        subtitle="Licence Expert (Office 365 + Windows 11) — chaque vente consomme notre stock local, reçu par lots de L'Expert du Numérique."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Quota EDN" value={status?.quota ?? "—"} />
        <Kpi label="Utilisées chez EDN" value={status?.used ?? "—"} />
        <Kpi
          label="Stock local disponible"
          value={stock.available}
          tone={stock.totalReceived > 0 && lowStock ? "warning" : "default"}
          hint={
            stock.totalReceived > 0 && lowStock
              ? "Stock bas — récupérez un nouveau lot."
              : undefined
          }
        />
        <Kpi label="Licences vendues" value={sales.length} />
      </div>

      {forecast.dailyRate > 0 ? (
        <Panel className={`mt-5 ${forecastUrgent ? "border-warning" : ""}`}>
          <p className="text-ink text-sm font-semibold">
            {forecastUrgent ? "⚠️ " : ""}À ce rythme (
            {forecast.dailyRate.toFixed(1)} licence
            {forecast.dailyRate >= 2 ? "s" : ""}/jour sur les{" "}
            {forecast.windowDays} derniers jours), le stock sera épuisé dans
            environ{" "}
            <strong>
              {forecast.daysRemaining} jour
              {forecast.daysRemaining !== 1 ? "s" : ""}
            </strong>
            .
          </p>
        </Panel>
      ) : null}

      <Panel title="Stock local" className="mt-5">
        <p className="text-ink-soft mb-4 text-[0.8125rem] leading-relaxed">
          Chaque vente consomme une licence déjà en stock — aucune dépendance à
          la disponibilité de L&rsquo;Expert du Numérique au moment où le client
          paie. Si le stock est vide, un appel direct est tenté en secours.
        </p>
        <PullLotForm />

        {stock.rows.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {stock.rows.map((r, i) => (
              <span
                key={r.id}
                title={
                  r.assigned
                    ? `${r.customerName ?? "Client"} — ${r.assignedAt ? formatDateTime(r.assignedAt) : ""}`
                    : "Disponible"
                }
                className={`flex size-7 items-center justify-center rounded-md text-[0.6875rem] font-bold ${
                  r.assigned
                    ? "bg-ink-faint/20 text-ink-faint"
                    : "bg-brand/15 text-brand-text"
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-ink-soft mt-5 text-[0.8125rem]">
            Aucune licence en stock — récupérez un premier lot ci-dessus.
          </p>
        )}
      </Panel>

      {waiting.length > 0 ? (
        <Panel
          title={`Clients en attente de licence (${waiting.length})`}
          className="border-warning mt-5"
        >
          <p className="text-ink-soft mb-4 text-[0.8125rem] leading-relaxed">
            Ces clients ont payé mais n&rsquo;ont pas encore reçu leur clé
            (stock vide et EDN injoignable au moment du paiement). Un client est
            aussi servi tout seul dès qu&rsquo;il rouvre sa page « Ma licence »
            et que le stock n&rsquo;est pas vide. Ce bouton les sert tous
            maintenant, et leur envoie un e-mail « Votre licence est prête ».
          </p>
          <ResponsiveTable
            rows={waiting}
            rowKey={(w) => w.accessId}
            columns={[
              { header: "Client", cell: (w) => w.clientName },
              {
                header: "E-mail",
                hideOnMobile: true,
                cell: (w) => w.clientEmail ?? "—",
              },
              {
                header: "Commande",
                cell: (w) => w.orderId.slice(0, 8).toUpperCase(),
              },
              {
                header: "Payée le",
                cell: (w) => (w.paidAt ? formatDateTime(w.paidAt) : "—"),
              },
            ]}
          />
          <div className="mt-4">
            <DeliverPendingForm count={waiting.length} />
          </div>
        </Panel>
      ) : null}

      {!status ? (
        <Panel className="border-warning mt-5">
          <p className="text-ink text-sm font-semibold">
            Statut du quota EDN indisponible pour le moment.
          </p>
          <p className="text-ink-soft mt-1 text-[0.8125rem]">
            L&rsquo;API de L&rsquo;Expert du Numérique n&rsquo;a pas répondu. Le
            stock local et la liste des ventes ci-dessous restent fiables.
          </p>
        </Panel>
      ) : null}

      {problems.length > 0 ? (
        <Panel title="Problèmes récents" className="border-warning mt-5">
          <ResponsiveTable
            rows={problems}
            rowKey={(p) => p.id}
            columns={[
              { header: "Date", cell: (p) => formatDateTime(p.createdAt) },
              {
                header: "Problème",
                cell: (p) => (
                  <StatusBadge
                    label={PROBLEM_LABELS[p.action] ?? p.action}
                    variant="warning"
                  />
                ),
              },
              {
                header: "Commande",
                cell: (p) => p.orderId?.slice(0, 8).toUpperCase() ?? "—",
              },
              {
                header: "Détail",
                hideOnMobile: true,
                cell: (p) => p.message ?? "—",
              },
            ]}
          />
        </Panel>
      ) : null}

      <Panel title={`Licences vendues (${sales.length})`} className="mt-5">
        <ResponsiveTable
          rows={sales}
          rowKey={(s) => s.id}
          empty="Aucune licence vendue pour le moment."
          columns={[
            { header: "Client", cell: (s) => s.customerName },
            {
              header: "E-mail",
              hideOnMobile: true,
              cell: (s) => s.customerEmail ?? "—",
            },
            {
              header: "Licence",
              cell: (s) => (
                <code className="text-[0.6875rem]">{s.licenseKey}</code>
              ),
            },
            { header: "Date", cell: (s) => formatDateTime(s.grantedAt) },
          ]}
        />
      </Panel>
    </>
  );
}
