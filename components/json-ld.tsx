/**
 * Injecte un bloc JSON-LD. `JSON.stringify` n'échappe pas les caractères
 * dangereux pour une injection XSS si jamais une donnée admin contenait
 * "</script>" — l'échappement de "<" neutralise ce risque, comme recommandé
 * par la documentation Next.js sur JSON-LD.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
