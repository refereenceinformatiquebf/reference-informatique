import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Dépend de la base de données à chaque génération — voir app/page.tsx pour
// la justification de ce choix (pas de prérendu statique sans DB réelle).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, articles, caseStudies] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.serviceCategory.findMany({ select: { slug: true } }),
    prisma.article.findMany({
      where: { publishedAt: { not: null, lte: new Date() } },
      select: { slug: true, publishedAt: true },
    }),
    prisma.caseStudy.findMany({
      where: { publishedAt: { not: null, lte: new Date() } },
      select: { slug: true, publishedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/boutique`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${SITE_URL}/realisations`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${SITE_URL}/veille`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/boutique/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/services/${category.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/veille/${article.slug}`,
    lastModified: article.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((item) => ({
    url: `${SITE_URL}/realisations/${item.slug}`,
    lastModified: item.publishedAt ?? undefined,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...caseStudyRoutes,
  ];
}
