import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { Button } from "@/components/ui/button";
import { ProductEditor } from "../product-editor";
import { LessonUpload } from "./lesson-upload";
import { prisma } from "@/lib/prisma/client";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { getAdminProduct } from "@/lib/catalog/live";
import { productToForm } from "@/lib/catalog/form";
import { deleteLessonAction } from "@/lib/actions/admin/lessons";
import {
  deleteProductAction,
  restoreProductDefaultsAction,
} from "@/lib/actions/admin/products";
import { formatDateTime, formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Modifier un produit" };
export const dynamic = "force-dynamic";

export default async function AdminProductPage({
  params,
  searchParams,
}: PageProps<"/admin/produits/[slug]">) {
  const { slug } = await params;
  const { rev } = await searchParams;
  const entry = await getAdminProduct(slug);
  if (!entry) notFound();

  const { product, commercial, source, edited, active } = entry;
  const row = await prisma.product.findUnique({
    where: { slug },
    select: {
      adminEditedAt: true,
      posterUrl: true,
      _count: {
        select: {
          orders: true,
          access: true,
          modules: true,
          testimonials: true,
        },
      },
    },
  });
  const modules = row
    ? await prisma.module.findMany({
        where: { product: { slug } },
        orderBy: { displayOrder: "asc" },
        include: { lessons: { orderBy: { displayOrder: "asc" } } },
      })
    : [];
  const original = ALL_PRODUCTS.find((item) => item.slug === slug);
  const used = row
    ? row._count.orders +
      row._count.access +
      row._count.modules +
      row._count.testimonials
    : 0;

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/produits", label: "Produits" }}
        title={product.name}
        subtitle={
          <>
            {formatPrice(product.price)} ·{" "}
            {active ? "visible sur le site" : "masqué du site"}
            {row?.adminEditedAt
              ? ` · dernière modification le ${formatDateTime(row.adminEditedAt)}`
              : " · version du catalogue (jamais modifiée ici)"}
          </>
        }
        actions={
          active ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/boutique/${product.slug}`} target="_blank">
                Voir la fiche
              </Link>
            </Button>
          ) : undefined
        }
      />

      {original?.restrictedTo?.length ? (
        <p className="bg-brand-50 text-ink mb-6 rounded-lg px-4 py-3 text-sm leading-relaxed">
          Ce produit est réservé aux visiteurs du Burkina Faso : depuis un
          ordinateur situé ailleurs, sa fiche s&apos;affiche en « page
          introuvable ». C&apos;est normal.
        </p>
      ) : null}

      <ProductEditor
        key={`${slug}-${typeof rev === "string" ? rev : "0"}`}
        existingSlug={slug}
        source={source}
        originallyRestricted={Boolean(original?.restrictedTo?.length)}
        values={productToForm(product)}
        currentPosterUrl={product.poster?.src}
        currentPosterAlt={product.poster?.alt}
        commercial={{
          price: commercial.price,
          compareAtPrice: commercial.compareAtPrice,
          promoEndsAt: commercial.promoEndsAt?.slice(0, 16) ?? "",
          badge: commercial.badge ?? "",
          active,
          displayOrder: commercial.displayOrder,
        }}
      />

      <Panel title="Contenu livré après l'achat" className="mt-8">
        <p className="text-ink-soft mb-4 text-sm leading-relaxed">
          Les livres (PDF) et vidéos ajoutés ici apparaissent dans « Mes
          formations » des clients qui ont acheté ce produit. Les fichiers sont
          dans un espace privé : personne ne peut les ouvrir sans avoir payé.
        </p>
        {modules.length === 0 ? (
          <p className="bg-paper-raised text-ink-soft mb-5 rounded-lg px-4 py-3 text-sm">
            Aucun contenu pour l&apos;instant : après paiement, le client verra
            un message l&apos;invitant à vous écrire sur WhatsApp.
          </p>
        ) : (
          <div className="mb-5 flex flex-col gap-4">
            {modules.map((module) => (
              <div key={module.id}>
                <p className="text-ink text-sm font-semibold">{module.title}</p>
                <ul className="mt-2 flex flex-col gap-2">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="border-line flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2"
                    >
                      <span className="text-ink text-sm">
                        {lesson.title}{" "}
                        <span className="text-ink-faint text-xs">
                          · {lesson.type === "PDF" ? "PDF" : "vidéo"}
                        </span>
                      </span>
                      <AdminAction
                        action={deleteLessonAction}
                        hidden={{ lessonId: lesson.id }}
                        label="Supprimer"
                        variant="ghost"
                        confirm={{
                          title: `Supprimer « ${lesson.title} » ?`,
                          description:
                            "Le fichier est effacé et les clients qui ont acheté ce produit ne le voient plus. Leur progression sur ce contenu est supprimée.",
                          confirmLabel: "Supprimer",
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <h3 className="font-display text-ink mb-3 text-[1.0625rem]">
          Ajouter un contenu
        </h3>
        <LessonUpload
          productSlug={slug}
          modules={modules.map((module) => ({
            id: module.id,
            title: module.title,
          }))}
        />
      </Panel>

      {source === "CODE" && edited ? (
        <Panel title="Revenir à la version d'origine" className="mt-8">
          <p className="text-ink-soft mb-4 text-sm leading-relaxed">
            Annule toutes les modifications faites ici sur ce produit (textes,
            prix, affiche, offre) et reprend la version du catalogue du site.
          </p>
          <AdminAction
            action={restoreProductDefaultsAction}
            hidden={{ slug }}
            label="Revenir à la version d'origine"
            variant="outline"
            confirm={{
              title: "Revenir à la version d'origine ?",
              description:
                "Vos modifications sur ce produit sont perdues. Les commandes et accès existants ne changent pas.",
              confirmLabel: "Revenir à l'original",
              reasonLabel: "Motif (journalisé)",
              reasonRequired: true,
            }}
          />
        </Panel>
      ) : null}

      {source === "ADMIN" ? (
        <Panel title="Supprimer ce produit" className="mt-8">
          <p className="text-ink-soft mb-4 text-sm leading-relaxed">
            {used > 0
              ? "Ce produit a déjà des commandes, des accès, des contenus ou des témoignages : il ne peut plus être supprimé. Décochez « Visible sur le site » pour le retirer de la boutique."
              : "Ce produit n'a jamais servi : vous pouvez le supprimer définitivement."}
          </p>
          {used === 0 ? (
            <AdminAction
              action={deleteProductAction}
              hidden={{ slug }}
              label="Supprimer le produit"
              variant="danger"
              confirm={{
                title: "Supprimer définitivement ce produit ?",
                description: "Cette action est irréversible.",
                confirmLabel: "Supprimer",
              }}
            />
          ) : null}
        </Panel>
      ) : null}
    </>
  );
}
