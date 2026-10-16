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

  // Anciennes adresses du produit « Activation Windows 11 et 10 + Office 365
  // à vie » (voir lib/catalog/paths.ts) : redirigées pour que les liens déjà
  // partagés ou indexés continuent de mener à la fiche.
  async redirects() {
    return [
      {
        source: "/boutique/licence-expert-office-365-windows-11",
        destination: "/activation-windows11et10-et-office365-a-vie",
        permanent: true,
      },
      {
        source: "/commande/licence-expert-office-365-windows-11",
        destination: "/commande/activation-windows11et10-et-office365-a-vie",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        // S'applique à toutes les routes.
        source: "/:path*",
        headers: [
          // Empêche toute intégration du site dans une iframe externe —
          // vise en particulier les routes de streaming de contenu
          // (Étape 15), qui ne doivent jamais être embarquées ailleurs.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Décision d'architecture (voir PLAYBOOK-CONSTRUCTION.md, Étape 19) :
          // une CSP stricte avec script-src à base de nonce (le modèle
          // recommandé par Next.js) exige un nonce différent à chaque
          // requête, ce qui force TOUTES les pages en rendu dynamique —
          // annulerait directement le travail de l'Étape 5 (pages marketing
          // statiques et rapides). On pose ici les directives qui ne posent
          // pas ce compromis (frame-ancestors, object-src, base-uri) ; la
          // directive script-src stricte à base de nonce reste un chantier
          // documenté à part, à activer seulement si mesuré nécessaire.
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
