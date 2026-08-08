import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { ServiceCategoryIcon } from "@/components/marketing/service-category-icon";
import { IconFleche } from "@/components/icons";

export const metadata: Metadata = {
  title: "Nos Services",
  description:
    "Conception de sites web, agents IA, logiciels sur mesure et maintenance informatique.",
};

// Catalogue lu en base à chaque requête — voir app/page.tsx pour la
// justification de force-dynamic.
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { services: true } } },
  });

  return (
    <div className="flex flex-col">
      <section className="border-line border-b px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-ink text-2xl font-bold">Nos Services</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Quatre familles de prestations, du site vitrine à l&apos;agent IA
            sur mesure. Chaque projet commence par un échange, pas par un
            formulaire générique.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/services/${category.slug}`}
              className="border-line hover:border-brand group flex flex-col gap-4 rounded-lg border p-7"
            >
              <span className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-md">
                <ServiceCategoryIcon iconKey={category.iconKey} size={24} />
              </span>
              <div>
                <h2 className="text-ink text-lg font-semibold">
                  {category.name}
                </h2>
                <p className="text-ink-soft mt-2 text-sm leading-relaxed">
                  {category.description}
                </p>
              </div>
              <span className="text-brand mt-auto flex items-center gap-1 text-sm font-semibold">
                {category._count.services} prestation
                {category._count.services > 1 ? "s" : ""}
                <IconFleche
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
