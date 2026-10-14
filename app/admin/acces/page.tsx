import type { Metadata } from "next";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  Pager,
  Panel,
  ResponsiveTable,
  RowLink,
  fieldClass,
  pageCountFor,
  pageParam,
  paramText,
} from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { prisma } from "@/lib/prisma/client";
import { getAdminProducts } from "@/lib/catalog/live";
import { optionsFrom } from "@/lib/admin/product-options";
import { formatDate } from "@/lib/format";
import { revokeAccessAction } from "@/lib/actions/admin/access";
import { GrantAccessForm } from "./grant-access-form";

export const metadata: Metadata = { title: "Accès" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminAccessPage({
  searchParams,
}: PageProps<"/admin/acces">) {
  const params = await searchParams;
  const q = paramText(params.q)?.slice(0, 100);
  const produit = paramText(params.produit);
  const page = pageParam(params.page);

  const where: Prisma.AccessWhereInput = {
    ...(produit ? { product: { slug: produit } } : {}),
    ...(q
      ? {
          profile: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q.replace(/\s/g, "") } },
            ],
          },
        }
      : {}),
  };

  const [rows, total, products] = await Promise.all([
    prisma.access.findMany({
      where,
      orderBy: { grantedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { profile: true, product: true },
    }),
    prisma.access.count({ where }),
    getAdminProducts().then(optionsFrom),
  ]);

  return (
    <>
      <AdminHeader
        title="Accès aux contenus"
        subtitle="Qui peut ouvrir quel produit dans son espace client. Un accès s'ouvre tout seul au paiement ; ici, vous pouvez en donner ou en retirer un à la main."
      />

      <Panel title="Donner un accès" className="mb-6">
        <GrantAccessForm
          products={products.map((product) => ({
            slug: product.slug,
            name: product.name,
          }))}
        />
      </Panel>

      <FilterBar action="/admin/acces" resetHref="/admin/acces">
        <FilterField label="Client" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, téléphone…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Produit" className="min-w-48">
          <select
            name="produit"
            defaultValue={produit ?? ""}
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
      </FilterBar>

      <ResponsiveTable
        rows={rows}
        rowKey={(access) => access.id}
        empty="Aucun accès ne correspond à ces filtres."
        columns={[
          {
            header: "Client",
            cell: (access) => (
              <div className="min-w-0">
                <RowLink href={`/admin/clients/${access.profile.id}`}>
                  {access.profile.name}
                </RowLink>
                <p className="text-ink-faint text-xs break-all">
                  {access.profile.email ?? ""}
                </p>
              </div>
            ),
          },
          { header: "Produit", cell: (access) => access.product.name },
          {
            header: "Depuis le",
            hideOnMobile: true,
            cell: (access) => formatDate(access.grantedAt),
          },
          {
            header: "",
            right: true,
            cell: (access) => (
              <AdminAction
                action={revokeAccessAction}
                hidden={{ accessId: access.id }}
                label="Retirer"
                variant="ghost"
                confirm={{
                  title: `Retirer l'accès de ${access.profile.name} ?`,
                  description: `Il ne pourra plus ouvrir « ${access.product.name} ». Ses commandes ne sont pas modifiées.`,
                  confirmLabel: "Retirer l'accès",
                  reasonLabel: "Motif (journalisé)",
                  reasonRequired: true,
                }}
              />
            ),
          },
        ]}
      />
      <Pager
        page={page}
        pageCount={pageCountFor(total, PAGE_SIZE)}
        total={total}
        basePath="/admin/acces"
        params={{ q, produit }}
      />
    </>
  );
}
