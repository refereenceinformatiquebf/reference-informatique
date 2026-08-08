"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "./nav-links";
import { IconUtilisateur, IconFleche } from "@/components/icons";
import { useCurrentProfile } from "./use-current-profile";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile, loading } = useCurrentProfile();

  return (
    <header className="border-line bg-paper sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-brand flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-white">
            RI
          </span>
          <span className="text-ink text-sm leading-tight font-bold">
            Référence
            <br />
            Informatique
          </span>
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
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-brand bg-brand/10"
                    : "text-ink-soft hover:text-ink hover:bg-paper-raised",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {loading ? (
            <div className="h-9 w-40" aria-hidden />
          ) : profile ? (
            <Link
              href={profile.role === "ADMIN" ? "/admin" : "/espace-client"}
              className="border-line hover:border-brand hover:text-brand flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
            >
              <IconUtilisateur size={16} />
              {profile.role === "ADMIN" ? "Administration" : "Mon espace"}
            </Link>
          ) : (
            <>
              <Link
                href="/connexion"
                className="border-line hover:border-brand hover:text-brand rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="bg-brand rounded-md px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Ouvrir le menu"
          className="border-line rounded-md border p-2 lg:hidden"
        >
          <IconFleche
            size={18}
            className={cn("transition-transform", open && "rotate-90")}
          />
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Navigation mobile"
          className="border-line flex flex-col gap-1 border-t px-4 py-3 lg:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-ink-soft hover:bg-paper-raised rounded-md px-3 py-2.5 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-line mt-2 flex flex-col gap-2 border-t pt-3">
            {profile ? (
              <Link
                href={profile.role === "ADMIN" ? "/admin" : "/espace-client"}
                className="border-line rounded-md border px-3 py-2.5 text-center text-sm font-semibold"
              >
                {profile.role === "ADMIN" ? "Administration" : "Mon espace"}
              </Link>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="border-line rounded-md border px-3 py-2.5 text-center text-sm font-semibold"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="bg-brand rounded-md px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
