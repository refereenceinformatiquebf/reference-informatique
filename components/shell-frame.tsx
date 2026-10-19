"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFocusPath } from "@/lib/focus";

/**
 * Cadre des pages : en-tête public, contenu, pied de page — sauf dans
 * l'administration, qui a son propre cadre (menu latéral) et ne montre ni
 * l'en-tête ni le pied de page du site.
 *
 * Pages sans distraction (lib/focus.ts : pages de vente et formulaire de
 * commande) : pas de bandeau d'annonce, et un pied de page réduit aux
 * mentions légales. L'en-tête, lui, se verrouille tout seul (voir Header).
 */
export function ShellFrame({
  announcement,
  header,
  footer,
  focusFooter,
  children,
}: {
  announcement: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  focusFooter: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const focus = isFocusPath(pathname);
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Lien d'évitement — invisible tant qu'il n'a pas le focus clavier,
          permet de sauter la navigation répétée sur chaque page (Étape 18). */}
      <a
        href="#main-content"
        className="bg-brand fixed -top-full left-3 z-[100] rounded-md px-4 py-2 text-sm font-semibold text-white transition-[top] focus:top-3 focus:left-3"
      >
        Aller au contenu principal
      </a>
      {focus ? null : announcement}
      {header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {focus ? focusFooter : footer}
    </div>
  );
}
