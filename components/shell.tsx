import type { ReactNode } from "react";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";

/**
 * Structure commune à toutes les pages publiques : en-tête, contenu, pied de
 * page. Volontairement un Server Component SANS lecture de cookies() ici :
 * dans le modèle de rendu classique (Cache Components désactivé, voir
 * next.config.ts), la moindre lecture de session à ce niveau forcerait
 * TOUTES les pages du site à devenir dynamiques, y compris les pages
 * marketing statiques. L'état de connexion est donc résolu côté client
 * dans le Header (voir use-current-profile.ts), qui est le seul élément
 * du Shell qui en a besoin.
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
