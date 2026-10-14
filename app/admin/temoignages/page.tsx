import type { Metadata } from "next";
import { AdminHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { prisma } from "@/lib/prisma/client";
import { getAllProducts } from "@/lib/catalog/live";
import { formatDate } from "@/lib/format";
import {
  deleteTestimonialAction,
  toggleTestimonialPublishedAction,
} from "@/lib/actions/admin/testimonials";
import { EMPTY_TESTIMONIAL, TestimonialForm } from "./testimonial-form";

export const metadata: Metadata = { title: "Témoignages" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const [rows, products] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: { product: { select: { slug: true, name: true } } },
    }),
    getAllProducts(),
  ]);
  const productOptions = products.map((product) => ({
    slug: product.slug,
    name: product.name,
  }));

  return (
    <>
      <AdminHeader
        title="Témoignages"
        subtitle="Les messages de clients affichés sur l'accueil et sur les fiches produit. Le site les présente comme « reçus de clients, publiés tels quels » : n'ajoutez que de vrais messages."
      />

      <Panel title="Ajouter un témoignage" className="mb-6">
        <TestimonialForm
          initial={EMPTY_TESTIMONIAL}
          products={productOptions}
        />
      </Panel>

      {rows.length === 0 ? (
        <p className="border-line bg-paper text-ink-soft rounded-xl border px-4 py-10 text-center text-sm">
          Aucun témoignage en base : le site affiche ceux qui sont écrits dans
          le catalogue. Dès que vous en ajoutez un ici, seuls les témoignages
          publiés ici s&apos;affichent.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <Panel key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-ink font-semibold">
                    {row.authorName}
                    {row.authorCity ? `, ${row.authorCity}` : ""}
                  </p>
                  <p className="text-ink-faint text-xs">
                    {row.product?.name ?? "Message général"} · {row.rating}/5 ·
                    ajouté le {formatDate(row.createdAt)}
                    {row.featured ? " · mis en avant" : ""}
                  </p>
                </div>
                <StatusBadge
                  label={row.published ? "Publié" : "Non publié"}
                  variant={row.published ? "success" : "neutral"}
                />
              </div>
              <blockquote className="text-ink-soft mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                « {row.quote} »
              </blockquote>
              <div className="mt-4 flex flex-wrap items-start gap-3">
                <AdminAction
                  action={toggleTestimonialPublishedAction}
                  hidden={{
                    id: row.id,
                    published: row.published ? "false" : "true",
                  }}
                  label={
                    row.published ? "Retirer du site" : "Publier sur le site"
                  }
                  variant={row.published ? "ghost" : "primary"}
                />
                <AdminAction
                  action={deleteTestimonialAction}
                  hidden={{ id: row.id }}
                  label="Supprimer"
                  variant="ghost"
                  confirm={{
                    title: "Supprimer ce témoignage ?",
                    description:
                      "Il disparaît du site et de l'administration. Pour le garder en réserve, retirez-le plutôt du site.",
                    confirmLabel: "Supprimer",
                  }}
                />
              </div>
              <details className="border-line mt-4 border-t pt-4">
                <summary className="text-brand-text cursor-pointer text-sm font-medium">
                  Modifier
                </summary>
                <div className="mt-4">
                  <TestimonialForm
                    initial={{
                      id: row.id,
                      authorName: row.authorName,
                      authorCity: row.authorCity ?? "",
                      quote: row.quote,
                      rating: row.rating,
                      displayOrder: row.displayOrder,
                      productSlug: row.product?.slug ?? "",
                      published: row.published,
                      featured: row.featured,
                    }}
                    products={productOptions}
                  />
                </div>
              </details>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
