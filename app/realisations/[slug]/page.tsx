import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

async function getCaseStudy(slug: string) {
  return prisma.caseStudy.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: PageProps<"/realisations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCaseStudy(slug);
  if (!item) return {};
  return { title: item.title, description: item.summary };
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/realisations/[slug]">) {
  const { slug } = await params;
  const item = await getCaseStudy(slug);

  if (!item || !item.publishedAt || item.publishedAt > new Date()) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <span className="text-brand text-xs font-semibold uppercase">
        {item.categorySlug.replace("-", " ")} — {item.clientName}
      </span>
      <h1 className="text-ink mt-2 text-2xl font-bold">{item.title}</h1>

      {item.coverImageUrl ? (
        <div className="bg-paper-raised relative mt-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={item.coverImageUrl}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        <div>
          <h2 className="text-ink text-base font-bold">Le contexte</h2>
          <p className="text-ink-soft mt-2 leading-relaxed">{item.summary}</p>
        </div>
        {item.results ? (
          <div>
            <h2 className="text-ink text-base font-bold">Le résultat</h2>
            <p className="text-ink-soft mt-2 leading-relaxed">{item.results}</p>
          </div>
        ) : null}
      </div>

      {item.galleryUrls.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {item.galleryUrls.map((url) => (
            <div
              key={url}
              className="bg-paper-raised relative aspect-video w-full overflow-hidden rounded-md"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
