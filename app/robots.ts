import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/espace-client",
        "/espace-client/",
        "/dev/",
        "/api/",
        "/commande/",
        "/connexion",
        "/inscription",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
