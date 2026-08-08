import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Décision d'architecture (voir PLAYBOOK-CONSTRUCTION.md, Étape 1) :
  // Next.js 16 introduit un nouveau modèle de rendu opt-in ("Cache Components",
  // activé via `cacheComponents: true`) qui exige un traitement explicite
  // (`use cache`, `<Suspense>`, `connection()`) de chaque accès à cookies(),
  // headers(), searchParams ou à une donnée non mise en cache, sous peine
  // d'erreur de build. On le laisse volontairement désactivé (comportement
  // par défaut) pour tout le projet : le modèle de rendu précédent (stable,
  // documenté, sans nouvelle surface d'erreurs à apprendre) suffit largement
  // aux besoins de ce site. À reconsidérer plus tard uniquement si un besoin
  // de performance précis et mesuré le justifie — jamais par défaut.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
