import type { MetadataRoute } from "next";
import {
  ALL_PRODUCTS,
  ALL_SERVICES,
  ALL_SERVICE_FAMILIES,
} from "@/lib/catalog";
import { SITE } from "@/lib/site";

/**
 * Plan du site, construit depuis le catalogue (aucune lecture en base : il
 * reste disponible même si la base est injoignable).
 *
 * Les produits réservés à un pays (les clés de formations) n'y figurent
 * PAS : le plan du site est public et lu par les robots depuis n'importe où,
 * il ne doit pas révéler l'existence d'une offre invisible hors du Burkina Faso.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes: MetadataRoute.Sitemap = ALL_PRODUCTS.filter(
    (product) => !product.restrictedTo || product.restrictedTo.length === 0,
  ).map((product) => ({
    url: url(`/boutique/${product.slug}`),
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

  const serviceRoutes: MetadataRoute.Sitemap = ALL_SERVICES.map((service) => ({
    url: url(`/services/${service.family}/${service.slug}`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes, ...familyRoutes, ...serviceRoutes];
}
