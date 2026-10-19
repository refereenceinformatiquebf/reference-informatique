import type { ReactNode } from "react";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { ShellFrame } from "@/components/shell-frame";

/**
 * Structure commune à toutes les pages publiques : en-tête, contenu, pied de
 * page. Volontairement un Server Component SANS lecture de cookies() ici :
 * dans le modèle de rendu classique (Cache Components désactivé, voir
 * next.config.ts), la moindre lecture de session à ce niveau forcerait
 * TOUTES les pages du site à devenir dynamiques, y compris les pages
 * marketing statiques. L'état de connexion est donc résolu côté client
 * dans le Header (voir use-current-profile.ts), qui est le seul élément
 * du Shell qui en a besoin.
 *
 * L'administration (/admin) a son propre cadre : ShellFrame retire alors
 * l'en-tête et le pied de page publics.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <ShellFrame
      announcement={<AnnouncementBar />}
      header={<Header />}
      footer={<Footer />}
    >
      {children}
    </ShellFrame>
  );
}
