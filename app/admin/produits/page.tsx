import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  ResponsiveTable,
  RowLink,
  StatusBadge,
  fieldClass,
  paramText,
} from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/client";
import { getAdminProducts } from "@/lib/catalog/live";
import { PRODUCT_KINDS } from "@/lib/catalog/kinds";
import { PRODUCT_KIND_VALUES } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { setProductActiveAction } from "@/lib/actions/admin/products";

export const metadata: Metadata = { title: "Produits" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/produits">) {
  const params = await searchParams;
  const q = paramText(params.q)?.toLowerCase();
  const kind = paramText(params.famille);
  const etat = paramText(params.etat);

  const [entries, sales] = await Promise.all([
    getAdminProducts(),
    prisma.order.groupBy({
      by: ["productId"],
      where: { status: "PAYE", productId: { not: null } },
      _count: true,
      _sum: { amount: true },
    }),
  ]);
  const rowIds = await prisma.product.findMany({
    select: { id: true, slug: true },
  });
  const slugById = new Map(rowIds.map((row) => [row.id, row.slug]));
  const salesBySlug = new Map(
    sales.map((row) => [
      slugById.get(row.productId!) ?? "",
      { count: row._count, revenue: row._sum.amount ?? 0 },
    ]),
  );

  const rows = entries.filter(({ product, active }) => {
    if (q && !`${product.name} ${product.slug}`.toLowerCase().includes(q))
      return false;
    if (kind && product.kind !== kind) return false;
    if (etat === "visibles" && !active) return false;
    if (etat === "masques" && active) return false;
    return true;
  });

  return (
    <>
      <AdminHeader
        title="Produits"
        subtitle={`${entries.length} produits, dont ${entries.filter((entry) => !entry.active).length} masqué(s). Un changement de prix ou de texte est visible sur le site tout de suite.`}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/produits/nouveau">Ajouter un produit</Link>
          </Button>
        }
      />

      <FilterBar action="/admin/produits" resetHref="/admin/produits">
        <FilterField label="Recherche" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom du produit…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Famille">
          <select
            name="famille"
            defaultValue={kind ?? ""}
            className={fieldClass}
          >
            <option value="">Toutes</option>
            {PRODUCT_KIND_VALUES.map((value) => (
              <option key={value} value={value}>
                {PRODUCT_KINDS[value].plural}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Affichage">
          <select name="etat" defaultValue={etat ?? ""} className={fieldClass}>
            <option value="">Tous</option>
            <option value="visibles">Visibles</option>
            <option value="masques">Masqués</option>
          </select>
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={rows}
        rowKey={(entry) => entry.product.slug}
        empty="Aucun produit ne correspond à ces filtres."
        columns={[
          {
            header: "",
            hideOnMobile: true,
            cell: ({ product }) =>
              product.poster ? (
                <Image
                  src={product.poster.src}
                  alt=""
                  width={44}
                  height={55}
                  className="border-line h-14 w-11 rounded border object-cover"
                />
              ) : (
                <span className="bg-brand-50 text-brand-text flex h-14 w-11 items-center justify-center rounded text-[0.625rem]">
                  Sans affiche
                </span>
              ),
          },
          {
            header: "Produit",
            cell: ({ product, source, edited }) => (
              <div className="min-w-0">
                <RowLink href={`/admin/produits/${product.slug}`}>
                  {product.name}
                </RowLink>
                <p className="text-ink-faint text-xs">
                  {PRODUCT_KINDS[product.kind].label}
                  {product.restrictedTo?.length
                    ? ` · réservé ${product.restrictedTo.join(", ")}`
                    : ""}
                  {source === "ADMIN"
                    ? " · créé ici"
                    : edited
                      ? " · modifié ici"
                      : " · version du catalogue"}
                </p>
              </div>
            ),
          },
          {
            header: "Prix",
            right: true,
            cell: ({ product }) => (
              <span className="tabular">
                {formatPrice(product.price)}
                {product.compareAtPrice ? (
                  <span className="text-ink-faint block text-xs line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            header: "Ventes",
            right: true,
            hideOnMobile: true,
            cell: ({ product }) => {
              const sale = salesBySlug.get(product.slug);
              return sale ? (
                <span className="tabular">
                  {sale.count} · {formatPrice(sale.revenue)}
                </span>
              ) : (
                "—"
              );
            },
          },
          {
            header: "Affichage",
            cell: ({ active }) => (
              <StatusBadge
                label={active ? "Visible" : "Masqué"}
                variant={active ? "success" : "neutral"}
              />
            ),
          },
          {
            header: "",
            right: true,
            cell: ({ product, active }) => (
              <AdminAction
                action={setProductActiveAction}
                hidden={{
                  slug: product.slug,
                  active: active ? "false" : "true",
                }}
                label={active ? "Masquer" : "Afficher"}
                variant="ghost"
                confirm={
                  active
                    ? {
                        title: `Masquer « ${product.name} » ?`,
                        description:
                          "Le produit disparaît de la boutique, de l'accueil et du plan du site. Les clients qui l'ont acheté gardent leur accès.",
                        confirmLabel: "Masquer",
                      }
                    : undefined
                }
              />
            ),
          },
        ]}
      />
    </>
  );
}
