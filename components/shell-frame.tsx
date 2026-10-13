"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Cadre des pages : en-tête public, contenu, pied de page — sauf dans
 * l'administration, qui a son propre cadre (menu latéral) et ne montre ni
 * l'en-tête ni le pied de page du site.
 */
export function ShellFrame({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
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
      {header}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {footer}
    </div>
  );
}
