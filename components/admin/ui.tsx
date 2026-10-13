import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Briques de l'administration — mêmes jetons et même ton que le reste du
 * site (charte Boulga AI). Aucune n'a besoin de JavaScript côté navigateur :
 * ce sont des composants serveur.
 */

export function AdminHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Lien « retour » au-dessus du titre (pages de détail). */
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link
          href={back.href}
          className="text-ink-faint hover:text-brand-text mb-2 inline-block text-sm transition-colors"
        >
          ← {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-ink text-[1.75rem] leading-tight sm:text-[2rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-ink-soft mt-1 text-sm">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  actions,
  className,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "border-line bg-paper shadow-card rounded-xl border p-4 sm:p-5",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-ink text-[1.25rem] leading-tight">
            {title}
          </h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "warning";
  href?: string;
}) {
  const body = (
    <div
      className={cn(
        "bg-paper shadow-card h-full rounded-xl border p-4 transition-colors",
        tone === "warning" ? "border-warning" : "border-line",
        href && "hover:border-brand",
      )}
    >
      <p className="text-ink-soft text-sm">{label}</p>
      <p className="font-display text-ink tabular mt-1 text-[1.75rem] leading-tight">
        {value}
      </p>
      {hint ? (
        <p className="text-ink-faint mt-1 text-[0.8125rem]">{hint}</p>
      ) : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  /** Colonne alignée à droite (montants). */
  right?: boolean;
  /** Masquée dans les cartes mobiles. */
  hideOnMobile?: boolean;
};

/** Tableau (≥ 768 px) / cartes empilées (mobile) : jamais de défilement horizontal. */
export function ResponsiveTable<T>({
  columns,
  rows,
  rowKey,
  empty = "Aucun résultat.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="border-line bg-paper text-ink-soft rounded-xl border px-4 py-10 text-center text-sm">
        {empty}
      </p>
    );
  }
  return (
    <>
      <div className="border-line bg-paper shadow-card hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-raised text-ink-faint text-xs tracking-wide uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-semibold",
                    column.right && "text-right",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-paper-raised/60">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn(
                      "px-4 py-3 align-middle",
                      column.right && "text-right",
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="border-line bg-paper shadow-card rounded-xl border p-4"
          >
            <dl className="space-y-1.5 text-sm">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div
                    key={column.header}
                    className="flex justify-between gap-3"
                  >
                    <dt className="text-ink-faint shrink-0">{column.header}</dt>
                    <dd className="text-ink min-w-0 text-right font-medium break-words">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Pagination par adresse (?page=2), en conservant les autres filtres. */
export function Pager({
  page,
  pageCount,
  basePath,
  params,
  total,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
  total?: number;
}) {
  if (pageCount <= 1) {
    return total !== undefined ? (
      <p className="text-ink-faint mt-4 text-xs">
        {total} résultat{total > 1 ? "s" : ""}
      </p>
    ) : null;
  }
  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  };
  const link =
    "border-line text-ink-soft hover:border-brand hover:text-brand-text rounded-md border px-3 py-1.5 text-sm";
  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-ink-faint text-xs">
        Page {page} sur {pageCount}
        {total !== undefined ? ` · ${total} résultats` : ""}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={link} rel="prev">
            ← Précédent
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link href={hrefFor(page + 1)} className={link} rel="next">
            Suivant →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "neutral" | "success" | "warning" | "danger";
}) {
  return <Badge variant={variant}>{label}</Badge>;
}

export function RowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-brand-text font-semibold underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}

/** Formulaire de filtres (GET) : champs en ligne, bouton « Filtrer ». */
export function FilterBar({
  children,
  action,
  resetHref,
}: {
  children: ReactNode;
  action: string;
  resetHref?: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className="border-line bg-paper shadow-card mb-5 flex flex-wrap items-end gap-3 rounded-xl border p-4"
    >
      {children}
      <button
        type="submit"
        className="bg-brand text-brand-contrast min-h-11 rounded-md px-5 text-sm font-medium hover:brightness-110"
      >
        Filtrer
      </button>
      {resetHref ? (
        <Link
          href={resetHref}
          className="text-ink-soft hover:text-brand-text flex min-h-11 items-center px-2 text-sm underline underline-offset-4"
        >
          Réinitialiser
        </Link>
      ) : null}
    </form>
  );
}

export const fieldClass =
  "border-line-strong bg-paper text-ink focus:border-brand min-h-11 w-full rounded-md border px-3 text-sm focus:outline-none focus:shadow-[var(--focus-halo)]";

export function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "text-ink-soft flex min-w-36 flex-col gap-1 text-xs font-medium",
        className,
      )}
    >
      {label}
      {children}
    </label>
  );
}

/** Définition en deux colonnes (fiches de détail). */
export function Facts({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-ink-faint text-xs tracking-wide uppercase">
            {item.label}
          </dt>
          <dd className="text-ink mt-0.5 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const ADMIN_PAGE_SIZE = 25;

/** Page demandée (≥ 1) à partir du paramètre d'adresse. */
export function pageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function pageCountFor(total: number, size = ADMIN_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / size));
}

/** Valeur de paramètre d'adresse sous forme de texte simple. */
export function paramText(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const text = raw?.trim();
  return text ? text : undefined;
}
