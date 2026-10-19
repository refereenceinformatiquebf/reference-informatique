"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";
import {
  IconCadenas,
  IconCroix,
  IconMenu,
  IconUtilisateur,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCurrentProfile } from "./use-current-profile";
import { Brand } from "./logo";
import { isFocusPath } from "@/lib/focus";

/**
 * Sur les pages sans distraction (lib/focus.ts : pages de vente, formulaire de
 * commande), l'en-tête n'offre plus aucun lien : le client ne voit que la
 * marque et la mention de paiement sécurisé, et ne peut pas quitter la page
 * par le haut. Le reste du site garde l'en-tête complet.
 */
export function Header() {
  const pathname = usePathname();
  return isFocusPath(pathname) ? <LockedHeader /> : <FullHeader />;
}

function LockedHeader() {
  return (
    <header className="border-line bg-paper border-b">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4">
        <span
          role="img"
          aria-label="Référence Informatique"
          className="min-w-0"
        >
          <Brand size={40} />
        </span>
        <p className="text-ink-soft flex shrink-0 items-center gap-2 text-[0.8125rem] font-medium whitespace-nowrap">
          <IconCadenas size={16} className="text-brand-text" />
          <span className="sm:hidden">Sécurisé</span>
          <span className="hidden sm:inline">Paiement sécurisé</span>
        </p>
      </div>
    </header>
  );
}

function FullHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile, loading } = useCurrentProfile();

  const accountHref = profile?.role === "ADMIN" ? "/admin" : "/espace-client";
  const accountLabel =
    profile?.role === "ADMIN" ? "Administration" : "Mon espace";

  return (
    <header className="border-line bg-paper/95 supports-[backdrop-filter]:bg-paper/85 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="rounded-md focus-visible:shadow-[var(--focus-halo)]"
        >
          <Brand size={40} />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-soft hover:bg-paper-raised hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-9 w-44" aria-hidden />
          ) : profile ? (
            <Button asChild variant="outline" size="sm">
              <Link href={accountHref}>
                <IconUtilisateur size={16} />
                {accountLabel}
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/inscription">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="border-line text-ink hover:bg-paper-raised flex h-11 w-11 items-center justify-center rounded-md border transition-colors lg:hidden"
        >
          {open ? <IconCroix size={20} /> : <IconMenu size={20} />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Navigation mobile"
          className="border-line bg-paper border-t px-4 pt-3 pb-5 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3.5 py-3 text-[0.9375rem] font-medium",
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-soft hover:bg-paper-raised",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="border-line mt-4 flex flex-col gap-2 border-t pt-4">
            {profile ? (
              <Button asChild variant="outline">
                <Link href={accountHref} onClick={() => setOpen(false)}>
                  <IconUtilisateur size={16} />
                  {accountLabel}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/connexion" onClick={() => setOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/inscription" onClick={() => setOpen(false)}>
                    Créer un compte
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
