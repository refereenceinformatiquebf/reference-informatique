import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  Kpi,
  Pager,
  ResponsiveTable,
  RowLink,
  fieldClass,
  pageCountFor,
  pageParam,
  paramText,
} from "@/components/admin/ui";
import {
  formatPhone,
  readPurchases,
  shortProductLabel,
  whatsappLinkTo,
} from "@/lib/legacy/display";
import { formatDate, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

const BATCH = "RI01";
const LEGACY_PAGE_SIZE = 50;
const ACCOUNT_PAGE_SIZE = 25;

export default async function AdminClientsPage({
  searchParams,
}: PageProps<"/admin/clients">) {
  const params = await searchParams;
  const group = paramText(params.groupe) === "comptes" ? "comptes" : "ri01";
  const q = paramText(params.q)?.slice(0, 100);
  const page = pageParam(params.page);

  const [legacyAll, accountCount] = await Promise.all([
    prisma.legacyClient.findMany({
      where: { batch: BATCH },
      select: { purchases: true, email: true },
    }),
    prisma.profile.count({ where: { role: "CLIENT" } }),
  ]);

  return (
    <>
      <AdminHeader
        title="Clients"
        subtitle={`Les comptes du site, et le groupe ${BATCH} : les clients de l'ancien site, en simples fiches de suivi sans compte de connexion.`}
        actions={
          <Button asChild variant="outline" size="sm">
            <a
              href={`/admin/export/${group === "ri01" ? "clients-ri01" : "clients"}`}
            >
              Exporter en CSV
            </a>
          </Button>
        }
      />

      <nav
        aria-label="Groupes de clients"
        className="mb-5 flex flex-wrap gap-2"
      >
        <GroupTab href="/admin/clients" active={group === "ri01"}>
          Clients {BATCH} ({legacyAll.length})
        </GroupTab>
        <GroupTab
          href="/admin/clients?groupe=comptes"
          active={group === "comptes"}
        >
          Comptes du site ({accountCount})
        </GroupTab>
      </nav>

      {group === "ri01" ? (
        <LegacyClients q={q} page={page} all={legacyAll} />
      ) : (
        <SiteAccounts q={q} page={page} />
      )}
    </>
  );
}

function GroupTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-brand-contrast"
          : "border-line-strong bg-paper text-ink-soft hover:border-brand hover:text-brand-text",
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------ Comptes du site ------------------------------ */

async function SiteAccounts({ q, page }: { q?: string; page: number }) {
  const where: Prisma.ProfileWhereInput = {
    role: "CLIENT",
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q.replace(/\s/g, "") } },
          ],
        }
      : {}),
  };
  const [clients, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ACCOUNT_PAGE_SIZE,
      take: ACCOUNT_PAGE_SIZE,
      include: {
        orders: { where: { status: "PAYE" }, select: { amount: true } },
        _count: { select: { access: true } },
      },
    }),
    prisma.profile.count({ where }),
  ]);

  return (
    <>
      <FilterBar
        action="/admin/clients"
        resetHref="/admin/clients?groupe=comptes"
      >
        <input type="hidden" name="groupe" value="comptes" />
        <FilterField label="Recherche" className="min-w-64 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email ou téléphone…"
            className={fieldClass}
          />
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={clients}
        rowKey={(client) => client.id}
        empty={
          q
            ? "Aucun compte ne correspond à cette recherche."
            : "Aucun client n'a encore créé de compte sur le nouveau site."
        }
        columns={[
          {
            header: "Client",
            cell: (client) => (
              <div className="min-w-0">
                <RowLink href={`/admin/clients/${client.id}`}>
                  {client.name}
                </RowLink>
                <p className="text-ink-faint text-xs break-all">
                  {client.email ?? "—"}
                </p>
              </div>
            ),
          },
          {
            header: "Téléphone",
            hideOnMobile: true,
            cell: (client) => client.phone ?? "—",
          },
          {
            header: "Achats payés",
            right: true,
            cell: (client) => client.orders.length,
          },
          {
            header: "Total dépensé",
            right: true,
            cell: (client) => (
              <span className="tabular">
                {formatPrice(
                  client.orders.reduce((sum, order) => sum + order.amount, 0),
                )}
              </span>
            ),
          },
          {
            header: "Accès",
            right: true,
            hideOnMobile: true,
            cell: (client) => client._count.access,
          },
          {
            header: "Inscrit le",
            hideOnMobile: true,
            cell: (client) => (
              <span className="text-ink-soft text-xs">
                {formatDate(client.createdAt)}
              </span>
            ),
          },
        ]}
      />
      <Pager
        page={page}
        pageCount={pageCountFor(total, ACCOUNT_PAGE_SIZE)}
        total={total}
        basePath="/admin/clients"
        params={{ groupe: "comptes", q }}
      />
    </>
  );
}

/* ----------------------------- Groupe RI01 (ancien site) ----------------------------- */

async function LegacyClients({
  q,
  page,
  all,
}: {
  q?: string;
  page: number;
  all: { purchases: unknown; email: string | null }[];
}) {
  const digits = q?.replace(/\D/g, "") ?? "";
  const where: Prisma.LegacyClientWhereInput = {
    batch: BATCH,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
          ],
        }
      : {}),
  };
  const [clients, total] = await Promise.all([
    prisma.legacyClient.findMany({
      where,
      orderBy: { code: "asc" },
      skip: (page - 1) * LEGACY_PAGE_SIZE,
      take: LEGACY_PAGE_SIZE,
    }),
    prisma.legacyClient.count({ where }),
  ]);

  // Totaux sur tout le groupe (pas seulement sur la recherche).
  const byProduct = new Map<string, number>();
  let accessCount = 0;
  for (const client of all) {
    for (const purchase of readPurchases(client.purchases)) {
      const label = shortProductLabel(purchase);
      byProduct.set(label, (byProduct.get(label) ?? 0) + 1);
      if (purchase.status === "ACCES_ACTIVE") accessCount += 1;
    }
  }
  const withEmail = all.filter((client) => client.email).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Clients" value={all.length} />
        <Kpi label="Accès activés (ancien site)" value={accessCount} />
        <Kpi
          label="Avec une vraie adresse email"
          value={withEmail}
          hint="Les autres se contactent par téléphone ou WhatsApp."
        />
      </div>

      <div className="my-4 flex flex-wrap items-center gap-2">
        {[...byProduct.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => (
            <Badge key={label} variant="neutral">
              {label} : {count}
            </Badge>
          ))}
      </div>

      <FilterBar action="/admin/clients" resetHref="/admin/clients">
        <FilterField label="Recherche" className="min-w-64 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, code (RI01-012), ville, téléphone…"
            className={fieldClass}
          />
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={clients}
        rowKey={(client) => client.id}
        empty="Aucun client ne correspond à cette recherche."
        columns={[
          {
            header: "Code",
            cell: (client) => (
              <RowLink href={`/admin/clients/ri01/${client.id}`}>
                {client.code}
              </RowLink>
            ),
          },
          {
            header: "Nom",
            cell: (client) => (
              <div className="min-w-0">
                <span className="font-medium">{client.name}</span>
                {client.adminNote ? (
                  <span className="text-ink-faint block text-xs font-normal">
                    {client.adminNote}
                  </span>
                ) : null}
              </div>
            ),
          },
          {
            header: "Téléphone",
            hideOnMobile: true,
            cell: (client) => (
              <span className="tabular whitespace-nowrap">
                {formatPhone(client.phone) || "—"}
              </span>
            ),
          },
          {
            header: "Ville",
            hideOnMobile: true,
            cell: (client) => client.city ?? "—",
          },
          {
            header: "Achats",
            cell: (client) => (
              <div className="flex flex-wrap justify-end gap-1.5 md:justify-start">
                {readPurchases(client.purchases).map((purchase, index) => (
                  <Badge
                    key={index}
                    variant={
                      purchase.status === "PAIEMENT_RECU"
                        ? "warning"
                        : "neutral"
                    }
                    title={
                      purchase.status === "PAIEMENT_RECU"
                        ? "Paiement reçu, accès pas encore activé"
                        : "Accès activé"
                    }
                  >
                    {shortProductLabel(purchase)}
                  </Badge>
                ))}
              </div>
            ),
          },
          {
            header: "Contact",
            cell: (client) => (
              <div className="flex flex-col items-end gap-1 text-xs font-semibold md:items-start">
                {client.phone ? (
                  <a
                    href={whatsappLinkTo(
                      client.phone,
                      `Bonjour ${client.name.split(" ")[0]}, c'est ${SITE.name}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success-text hover:underline"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {client.email ? (
                  <a
                    href={`mailto:${client.email}`}
                    className="text-brand-text hover:underline"
                  >
                    Email
                  </a>
                ) : null}
              </div>
            ),
          },
        ]}
      />
      <Pager
        page={page}
        pageCount={pageCountFor(total, LEGACY_PAGE_SIZE)}
        total={total}
        basePath="/admin/clients"
        params={{ q }}
      />
    </>
  );
}
