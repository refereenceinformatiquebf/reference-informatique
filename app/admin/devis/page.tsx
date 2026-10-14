import type { Metadata } from "next";
import type { Prisma } from "@/lib/generated/prisma/client";
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
  paramText,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/client";
import { formatDateTime } from "@/lib/format";
import { QUOTE_STATUS_LABELS } from "@/lib/status-labels";
import { getAllServices } from "@/lib/catalog/live";

export const metadata: Metadata = { title: "Devis" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;
const STATUSES = Object.keys(QUOTE_STATUS_LABELS);

export default async function AdminQuotesPage({
  searchParams,
}: PageProps<"/admin/devis">) {
  const params = await searchParams;
  const q = paramText(params.q)?.slice(0, 100);
  const statutRaw = paramText(params.statut);
  const statut =
    statutRaw && STATUSES.includes(statutRaw) ? statutRaw : undefined;
  const service = paramText(params.service);
  const page = pageParam(params.page);

  const where: Prisma.QuoteRequestWhereInput = {
    ...(statut ? { status: statut as never } : {}),
    ...(service ? { service: { slug: service } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/\s/g, "") } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [quotes, total, services] = await Promise.all([
    prisma.quoteRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { service: true },
    }),
    prisma.quoteRequest.count({ where }),
    getAllServices(),
  ]);

  return (
    <>
      <AdminHeader
        title="Demandes de devis"
        subtitle={`${total} demande${total > 1 ? "s" : ""}.`}
        actions={
          <Button asChild variant="outline" size="sm">
            {/* Téléchargement de fichier : un lien classique est voulu. */}
            <a href="/admin/export/devis" download>
              Exporter en CSV
            </a>
          </Button>
        }
      />

      <FilterBar action="/admin/devis" resetHref="/admin/devis">
        <FilterField label="Recherche" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, entreprise, message…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Statut">
          <select
            name="statut"
            defaultValue={statut ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            {Object.entries(QUOTE_STATUS_LABELS).map(([value, item]) => (
              <option key={value} value={value}>
                {item.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Prestation" className="min-w-48">
          <select
            name="service"
            defaultValue={service ?? ""}
            className={fieldClass}
          >
            <option value="">Toutes</option>
            {services.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={quotes}
        rowKey={(quote) => quote.id}
        empty="Aucune demande ne correspond à ces filtres."
        columns={[
          {
            header: "Date",
            hideOnMobile: true,
            cell: (quote) => (
              <span className="text-ink-soft text-xs">
                {formatDateTime(quote.createdAt)}
              </span>
            ),
          },
          {
            header: "Client",
            cell: (quote) => (
              <div className="min-w-0">
                <RowLink href={`/admin/devis/${quote.id}`}>
                  {quote.name}
                </RowLink>
                <p className="text-ink-faint text-xs break-all">
                  {quote.company ?? quote.email}
                </p>
              </div>
            ),
          },
          { header: "Prestation", cell: (quote) => quote.service.name },
          {
            header: "Budget",
            hideOnMobile: true,
            cell: (quote) => quote.budget ?? "—",
          },
          {
            header: "Statut",
            cell: (quote) => {
              const item = QUOTE_STATUS_LABELS[quote.status];
              return <StatusBadge label={item.label} variant={item.variant} />;
            },
          },
        ]}
      />
      <Pager
        page={page}
        pageCount={pageCountFor(total, PAGE_SIZE)}
        total={total}
        basePath="/admin/devis"
        params={{ q, statut, service }}
      />
    </>
  );
}
