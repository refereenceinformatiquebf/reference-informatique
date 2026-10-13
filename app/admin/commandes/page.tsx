import type { Metadata } from "next";
import Link from "next/link";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  Pager,
  ResponsiveTable,
  RowLink,
  StatusBadge,
  fieldClass,
  pageCountFor,
  pageParam,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { listOrders, parseOrderFilters } from "@/lib/admin/orders-query";
import { getAllProducts } from "@/lib/catalog/live";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";

export const metadata: Metadata = { title: "Commandes" };
export const dynamic = "force-dynamic";

const DELIVERY_LABELS = {
  A_PREPARER: { label: "À préparer", variant: "warning" },
  EN_LIVRAISON: { label: "En livraison", variant: "neutral" },
  LIVREE: { label: "Livrée", variant: "success" },
} as const;

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/commandes">) {
  const params = await searchParams;
  const filters = parseOrderFilters(params);
  const page = pageParam(params.page);
  const [{ rows, total }, products] = await Promise.all([
    listOrders(filters, page),
    getAllProducts(),
  ]);

  const exportQuery = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value) as [string, string][],
  ).toString();

  return (
    <>
      <AdminHeader
        title="Commandes"
        subtitle={`${total} commande${total > 1 ? "s" : ""}${Object.values(filters).some(Boolean) ? " correspondant aux filtres" : ""}.`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/admin/export/commandes${exportQuery ? `?${exportQuery}` : ""}`}
              >
                Exporter en CSV
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/commandes/nouvelle">Créer une commande</Link>
            </Button>
          </>
        }
      />

      <FilterBar action="/admin/commandes" resetHref="/admin/commandes">
        <FilterField label="Recherche" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Nom, email, téléphone, référence…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Statut">
          <select
            name="statut"
            defaultValue={filters.statut ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, status]) => (
              <option key={value} value={value}>
                {status.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Canal">
          <select
            name="canal"
            defaultValue={filters.canal ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            <option value="BOUTIQUE">Paiement en ligne</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </FilterField>
        <FilterField label="Livraison">
          <select
            name="livraison"
            defaultValue={filters.livraison ?? ""}
            className={fieldClass}
          >
            <option value="">Toutes</option>
            <option value="A_PREPARER">À préparer</option>
            <option value="EN_LIVRAISON">En livraison</option>
            <option value="LIVREE">Livrée</option>
          </select>
        </FilterField>
        <FilterField label="Produit" className="min-w-48">
          <select
            name="produit"
            defaultValue={filters.produit ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Du">
          <input
            type="date"
            name="du"
            defaultValue={filters.du}
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Au">
          <input
            type="date"
            name="au"
            defaultValue={filters.au}
            className={fieldClass}
          />
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={rows}
        rowKey={(order) => order.id}
        empty="Aucune commande ne correspond à ces filtres."
        columns={[
          {
            header: "Date",
            hideOnMobile: true,
            cell: (order) => (
              <span className="text-ink-soft text-xs">
                {formatDateTime(order.createdAt)}
              </span>
            ),
          },
          {
            header: "Client",
            cell: (order) => (
              <div className="min-w-0">
                <RowLink href={`/admin/commandes/${order.id}`}>
                  {order.profile.name}
                </RowLink>
                <p className="text-ink-faint text-xs">
                  {order.profile.phone ?? order.profile.email ?? ""}
                </p>
              </div>
            ),
          },
          {
            header: "Produit",
            cell: (order) => (
              <span>
                {order.quantity > 1 ? `${order.quantity} × ` : ""}
                {order.product?.name ?? "—"}
                {order.manual ? (
                  <span className="text-ink-faint block text-xs">
                    Créée par l&apos;équipe
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            header: "Montant",
            right: true,
            cell: (order) => (
              <span className="tabular font-semibold">
                {formatPrice(order.amount)}
              </span>
            ),
          },
          {
            header: "Canal",
            hideOnMobile: true,
            cell: (order) => (
              <span className="text-ink-soft text-xs">
                {order.channel === "BOUTIQUE" ? "SasPay" : "WhatsApp"}
              </span>
            ),
          },
          {
            header: "Statut",
            cell: (order) => {
              const status = ORDER_STATUS_LABELS[order.status];
              return (
                <StatusBadge label={status.label} variant={status.variant} />
              );
            },
          },
          {
            header: "Livraison",
            cell: (order) => {
              if (!order.deliveryStatus || order.status !== "PAYE") return "—";
              const delivery = DELIVERY_LABELS[order.deliveryStatus];
              return (
                <StatusBadge
                  label={delivery.label}
                  variant={delivery.variant}
                />
              );
            },
          },
        ]}
      />

      <Pager
        page={page}
        pageCount={pageCountFor(total)}
        total={total}
        basePath="/admin/commandes"
        params={filters}
      />
    </>
  );
}
