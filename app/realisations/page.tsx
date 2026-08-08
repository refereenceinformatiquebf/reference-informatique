import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { Button } from "@/components/ui/button";
import { IconCode } from "@/components/icons";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Sites, logiciels et automatisations livrés par Référence Informatique.",
};

export const dynamic = "force-dynamic";

export default async function RealisationsPage() {
  const realisations = await prisma.caseStudy.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="flex flex-col">
      <section className="border-line border-b px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-ink text-2xl font-bold">Réalisations</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Des projets concrets, livrés pour des clients réels.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {realisations.length === 0 ? (
            <div className="border-line mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed p-10 text-center">
              <span className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-full">
                <IconCode size={22} />
              </span>
              <p className="text-ink-soft text-sm leading-relaxed">
                Nos premières réalisations arrivent bientôt. En attendant,
                parlons de votre projet — nous avons déjà livré des sites et
                automatisations pour des clients au Burkina Faso.
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {realisations.map((item) => (
                <Link
                  key={item.id}
                  href={`/realisations/${item.slug}`}
                  className="border-line hover:border-brand flex flex-col overflow-hidden rounded-lg border"
                >
                  <div className="bg-paper-raised relative aspect-video w-full">
                    {item.coverImageUrl ? (
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5 p-5">
                    <span className="text-brand text-xs font-semibold uppercase">
                      {item.categorySlug.replace("-", " ")}
                    </span>
                    <h2 className="text-ink text-sm font-semibold">
                      {item.title}
                    </h2>
                    <p className="text-ink-soft line-clamp-2 text-xs leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
