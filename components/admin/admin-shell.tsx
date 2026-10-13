"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/marketing/logo";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  href: string;
  label: string;
  /** Correspondance exacte (tableau de bord). */
  exact?: boolean;
  /** Pastille de comptage (à traiter). */
  badge?: number;
};

export type AdminNavGroup = { title: string; items: AdminNavItem[] };

function NavList({
  groups,
  onNavigate,
}: {
  groups: AdminNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-1 px-3 text-[0.6875rem] font-semibold tracking-wider text-white/60 uppercase">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center justify-between gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                      active
                        ? "text-brand-900 bg-white"
                        : "text-white/85 hover:bg-white/10",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "tabular rounded-full px-2 py-0.5 text-[0.6875rem] leading-none font-semibold",
                          active
                            ? "bg-brand text-white"
                            : "bg-white/20 text-white",
                        )}
                        aria-label={`${item.badge} à traiter`}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AccountLinks({
  adminName,
  signOutAction,
}: {
  adminName: string;
  signOutAction: () => Promise<void>;
}) {
  const link =
    "flex min-h-11 items-center rounded-md px-3 text-sm text-white/85 underline-offset-4 hover:bg-white/10 hover:text-white";
  return (
    <div className="mt-8 border-t border-white/15 pt-4">
      <p className="truncate px-3 pb-2 text-xs text-white/70">{adminName}</p>
      <Link href="/" className={link}>
        Voir le site
      </Link>
      <Link href="/espace-client" className={link}>
        Mon espace client
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className={`${link} w-full text-left font-semibold`}
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}

/** Menu latéral marine (ordinateur) ; barre supérieure + tiroir (mobile). */
export function AdminShell({
  groups,
  adminName,
  signOutAction,
  children,
}: {
  groups: AdminNavGroup[];
  adminName: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pending = groups
    .flatMap((group) => group.items)
    .reduce((sum, item) => sum + (item.badge ?? 0), 0);

  return (
    <div className="bg-paper-raised min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-brand-900 hidden p-4 lg:sticky lg:top-0 lg:block lg:h-dvh lg:overflow-y-auto">
        <Link
          href="/admin"
          className="mb-6 block px-2"
          aria-label="Administration"
        >
          <Brand tone="light" size={36} />
        </Link>
        <NavList groups={groups} />
        <AccountLinks adminName={adminName} signOutAction={signOutAction} />
      </aside>

      <div className="min-w-0">
        <header className="bg-brand-900 sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:hidden">
          <Link href="/admin" aria-label="Administration">
            <Brand tone="light" size={30} />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="admin-menu"
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            {open ? "Fermer" : "Menu"}
            {!open && pending > 0 ? (
              <span className="bg-brand tabular rounded-full px-2 py-0.5 text-[0.6875rem] leading-none">
                {pending}
              </span>
            ) : null}
          </button>
        </header>
        {open ? (
          <div
            id="admin-menu"
            className="bg-brand-900 fixed inset-x-0 top-14 bottom-0 z-20 overflow-y-auto p-4 lg:hidden"
          >
            <NavList groups={groups} onNavigate={() => setOpen(false)} />
            <AccountLinks adminName={adminName} signOutAction={signOutAction} />
          </div>
        ) : null}
        <main
          id="contenu"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1400px] px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
