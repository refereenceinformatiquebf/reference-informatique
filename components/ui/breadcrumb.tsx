import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";

type Crumb = { label: string; href?: string };

/** Fil d'Ariane + données structurées BreadcrumbList. Le dernier élément
 * (la page courante) n'est pas un lien. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE.url}${item.href}` } : {}),
          })),
        }}
      />
      <nav aria-label="Fil d'Ariane">
        <ol className="text-ink-faint flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem]">
          {items.map((item, index) => (
            <li key={item.label} className="flex items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-brand-text transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink-soft">
                  {item.label}
                </span>
              )}
              {index < items.length - 1 ? (
                <span aria-hidden className="text-line-strong">
                  /
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
