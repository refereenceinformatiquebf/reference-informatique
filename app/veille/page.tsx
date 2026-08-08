import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { IconVeille } from "@/components/icons";

export const metadata: Metadata = {
  title: "Veille",
  description:
    "Actualité technologique, sécurité et intelligence artificielle — par Référence Informatique.",
};

export const dynamic = "force-dynamic";

export default async function VeillePage() {
  const articles = await prisma.article.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="flex flex-col">
      <section className="border-line border-b px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-ink text-2xl font-bold">Veille</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Actualité technologique, sécurité et intelligence artificielle,
            expliquée simplement.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {articles.length === 0 ? (
            <div className="border-line mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed p-10 text-center">
              <span className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-full">
                <IconVeille size={22} />
              </span>
              <p className="text-ink-soft text-sm leading-relaxed">
                Nos premiers articles arrivent bientôt.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/veille/${article.slug}`}
                  className="border-line hover:border-brand flex flex-col gap-4 rounded-lg border p-6 sm:flex-row"
                >
                  {article.coverImageUrl ? (
                    <div className="bg-paper-raised relative aspect-video w-full shrink-0 overflow-hidden rounded-md sm:w-48">
                      <Image
                        src={article.coverImageUrl}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h2 className="text-ink text-base font-semibold">
                      {article.title}
                    </h2>
                    <p className="text-ink-soft mt-2 line-clamp-2 text-sm leading-relaxed">
                      {article.excerpt}
                    </p>
                    {article.publishedAt ? (
                      <time
                        dateTime={article.publishedAt.toISOString()}
                        className="text-ink-faint mt-3 block text-xs"
                      >
                        {article.publishedAt.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    ) : null}
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
