import type { Metadata } from "next";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  Pager,
  ResponsiveTable,
  fieldClass,
  pageCountFor,
  pageParam,
  paramText,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma/client";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Journal d'audit" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

const ENTITIES: Record<string, string> = {
  order: "Commandes",
  product: "Produits",
  service: "Services",
  testimonial: "Témoignages",
  access: "Accès",
  quote: "Devis",
  message: "Messages",
  profile: "Clients",
  legacy_client: "Clients RI01",
  admin: "Administrateurs",
  setting: "Paramètres",
  export: "Exports",
};

export default async function AdminAuditLogPage({
  searchParams,
}: PageProps<"/admin/journal">) {
  const params = await searchParams;
  const q = paramText(params.q)?.slice(0, 100);
  const entity = paramText(params.entite);
  const admin = paramText(params.admin);
  const du = paramText(params.du);
  const au = paramText(params.au);
  const page = pageParam(params.page);

  const from = du ? new Date(du) : undefined;
  const to = au ? new Date(au) : undefined;
  const where: Prisma.AdminAuditLogWhereInput = {
    ...(entity ? { entity } : {}),
    ...(admin ? { adminLabel: { contains: admin, mode: "insensitive" } } : {}),
    ...(q
      ? {
          OR: [
            { summary: { contains: q, mode: "insensitive" } },
            { action: { contains: q, mode: "insensitive" } },
            { entityId: { contains: q } },
          ],
        }
      : {}),
    ...((from && !Number.isNaN(from.getTime())) ||
    (to && !Number.isNaN(to.getTime()))
      ? {
          createdAt: {
            ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}),
            ...(to && !Number.isNaN(to.getTime())
              ? { lt: new Date(to.getTime() + 86_400_000) }
              : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return (
    <>
      <AdminHeader
        title="Journal d'audit"
        subtitle="Qui a fait quoi dans l'administration. Lecture seule : aucune ligne ne peut être modifiée ni supprimée depuis le site."
      />

      <FilterBar action="/admin/journal" resetHref="/admin/journal">
        <FilterField label="Recherche" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Texte, action, référence…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Sujet">
          <select
            name="entite"
            defaultValue={entity ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            {Object.entries(ENTITIES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Administrateur">
          <input
            name="admin"
            defaultValue={admin}
            placeholder="Email…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Du">
          <input
            type="date"
            name="du"
            defaultValue={du}
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Au">
          <input
            type="date"
            name="au"
            defaultValue={au}
            className={fieldClass}
          />
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={rows}
        rowKey={(row) => row.id}
        empty="Aucune action enregistrée pour ces filtres."
        columns={[
          {
            header: "Date",
            cell: (row) => (
              <span className="text-ink-soft text-xs whitespace-nowrap">
                {formatDateTime(row.createdAt)}
              </span>
            ),
          },
          {
            header: "Administrateur",
            cell: (row) => (
              <span className="text-xs break-all">
                {row.adminLabel ?? "Système"}
              </span>
            ),
          },
          {
            header: "Action",
            hideOnMobile: true,
            cell: (row) => <code className="text-xs">{row.action}</code>,
          },
          {
            header: "Détail",
            cell: (row) => (
              <div className="min-w-0">
                <p className="text-ink text-sm">{row.summary ?? row.action}</p>
                {row.details ? (
                  <details className="mt-1">
                    <summary className="text-brand-text cursor-pointer text-xs">
                      Voir les données
                    </summary>
                    <pre className="bg-paper-raised mt-1 max-w-full overflow-x-auto rounded p-2 text-[0.6875rem] leading-relaxed">
                      {JSON.stringify(row.details, null, 2)}
                    </pre>
                  </details>
                ) : null}
              </div>
            ),
          },
        ]}
      />
      <Pager
        page={page}
        pageCount={pageCountFor(total, PAGE_SIZE)}
        total={total}
        basePath="/admin/journal"
        params={{ q, entite: entity, admin, du, au }}
      />
    </>
  );
}
