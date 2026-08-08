import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { prisma } from "@/lib/prisma/client";
import { JsonLd } from "@/components/json-ld";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  return prisma.article.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: PageProps<"/veille/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt,
    openGraph: article.coverImageUrl
      ? { images: [article.coverImageUrl] }
      : undefined,
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/veille/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article || !article.publishedAt || article.publishedAt > new Date()) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl ?? undefined,
    datePublished: article.publishedAt.toISOString(),
    author: { "@type": "Organization", name: "Référence Informatique" },
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <JsonLd data={articleJsonLd} />
      {article.tags.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-brand/10 text-brand rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <h1 className="text-ink text-2xl font-bold">{article.title}</h1>

      {article.publishedAt ? (
        <time
          dateTime={article.publishedAt.toISOString()}
          className="text-ink-faint mt-2 block text-xs"
        >
          {article.publishedAt.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      ) : null}

      {article.coverImageUrl ? (
        <div className="bg-paper-raised relative mt-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      ) : null}

      {/* ReactMarkdown échappe le HTML par défaut — pas de rendu de script
          injecté depuis le contenu admin (Étape 14). */}
      <div className="prose prose-sm text-ink-soft [&_a]:text-brand [&_h2]:text-ink mt-8 max-w-none leading-relaxed [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_p]:mb-4">
        <ReactMarkdown>{article.body}</ReactMarkdown>
      </div>
    </article>
  );
}
