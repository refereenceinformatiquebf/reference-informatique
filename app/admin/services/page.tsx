import type { Metadata } from "next";
import { AdminHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { prisma } from "@/lib/prisma/client";
import { ALL_SERVICES, ALL_SERVICE_FAMILIES } from "@/lib/catalog";
import { formatServicePrice } from "@/lib/format";
import { ServiceForm } from "./service-form";

export const metadata: Metadata = { title: "Services" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const rows = await prisma.service.findMany({
    select: {
      slug: true,
      name: true,
      description: true,
      priceType: true,
      priceFrom: true,
      active: true,
      displayOrder: true,
      tagline: true,
      priceNote: true,
      timeline: true,
      adminEditedAt: true,
    },
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return (
    <>
      <AdminHeader
        title="Services"
        subtitle="Prix d'entrée, texte des cartes, délai indicatif et visibilité des prestations. Les étapes, livrables et questions détaillés de chaque page de service restent écrits dans le catalogue du site."
      />
      <div className="flex flex-col gap-8">
        {ALL_SERVICE_FAMILIES.map((family) => (
          <section key={family.slug}>
            <h2 className="font-display text-ink mb-3 text-[1.375rem] leading-tight">
              {family.name}
            </h2>
            <div className="flex flex-col gap-3">
              {ALL_SERVICES.filter(
                (service) => service.family === family.slug,
              ).map((base) => {
                const row = bySlug.get(base.slug);
                const edited = Boolean(row?.adminEditedAt);
                const view =
                  edited && row
                    ? {
                        name: row.name,
                        summary: row.description,
                        tagline: row.tagline ?? base.tagline,
                        priceType: row.priceType,
                        priceFrom: row.priceFrom,
                        priceNote: row.priceNote ?? base.priceNote,
                        timeline: row.timeline ?? base.timeline,
                        active: row.active,
                        displayOrder: row.displayOrder,
                      }
                    : {
                        name: base.name,
                        summary: base.summary,
                        tagline: base.tagline,
                        priceType: base.priceType,
                        priceFrom: base.priceFrom ?? null,
                        priceNote: base.priceNote,
                        timeline: base.timeline,
                        active: row ? row.active : true,
                        displayOrder: base.order,
                      };
                return (
                  <Panel key={base.slug}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-ink font-semibold">{view.name}</p>
                        <p className="text-ink-faint text-xs">
                          {formatServicePrice({
                            priceType: view.priceType,
                            priceFrom: view.priceFrom,
                          })}
                          {edited
                            ? " · modifié ici"
                            : " · version du catalogue"}
                        </p>
                      </div>
                      <StatusBadge
                        label={view.active ? "Proposé" : "Masqué"}
                        variant={view.active ? "success" : "neutral"}
                      />
                    </div>
                    <details className="border-line mt-4 border-t pt-4">
                      <summary className="text-brand-text cursor-pointer text-sm font-medium">
                        Modifier
                      </summary>
                      <div className="mt-4">
                        <ServiceForm values={{ slug: base.slug, ...view }} />
                      </div>
                    </details>
                  </Panel>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
