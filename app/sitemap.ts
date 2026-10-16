import type { MetadataRoute } from "next";
import { ALL_SERVICE_FAMILIES } from "@/lib/catalog";
import { getAllProducts, getAllServices } from "@/lib/catalog/live";
import { productPath } from "@/lib/catalog/paths";
import { getLegalSettings, isLegalComplete } from "@/lib/settings";
import { SITE } from "@/lib/site";

/**
 * Plan du site, construit depuis le catalogue vivant (produits et services
 * actifs ; si la base est injoignable, le catalogue du code prend le relais).
 *
 * Les produits réservés à un pays (les clés de formations) n'y figurent
 * PAS : le plan du site est public et lu par les robots depuis n'importe où,
 * il ne doit pas révéler l'existence d'une offre invisible hors du Burkina Faso.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services, legal] = await Promise.all([
    getAllProducts(),
    getAllServices(),
    getLegalSettings(),
  ]);
  const url = (path: string) => `${SITE.url}${path}`;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/boutique"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/services"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/a-propos"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.6 },
    { url: url("/faq"), changeFrequency: "monthly", priority: 0.5 },
    {
      url: url("/conditions-generales"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: url("/politique-de-confidentialite"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter(
      (product) => !product.restrictedTo || product.restrictedTo.length === 0,
    )
    .map((product) => ({
      url: url(productPath(product.slug)),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const familyRoutes: MetadataRoute.Sitemap = ALL_SERVICE_FAMILIES.map(
    (family) => ({
      url: url(`/services/${family.slug}`),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: url(`/services/${service.family}/${service.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const legalRoutes: MetadataRoute.Sitemap = isLegalComplete(legal)
    ? [
        {
          url: url("/mentions-legales"),
          changeFrequency: "yearly",
          priority: 0.2,
        },
      ]
    : [];

  return [
    ...staticRoutes,
    ...productRoutes,
    ...familyRoutes,
    ...serviceRoutes,
    ...legalRoutes,
  ];
}
