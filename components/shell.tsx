import type { ReactNode } from "react";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

/**
 * Structure commune à toutes les pages publiques : en-tête, contenu, pied de
 * page. Monté une seule fois dans le layout racine — aucune page ne doit
 * réimplémenter sa propre en-tête ou son propre pied de page.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
