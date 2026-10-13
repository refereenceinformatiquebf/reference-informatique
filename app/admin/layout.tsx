import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/dal";
import { signOut } from "@/lib/actions/auth";
import { adminBadgeCounts } from "@/lib/admin/counts";
import { AdminShell, type AdminNavGroup } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s — Administration" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdmin();
  const counts = await adminBadgeCounts();

  const groups: AdminNavGroup[] = [
    {
      title: "Ventes",
      items: [
        { href: "/admin", label: "Tableau de bord", exact: true },
        {
          href: "/admin/commandes",
          label: "Commandes",
          badge: counts.deliveries + counts.whatsapp,
        },
        { href: "/admin/clients", label: "Clients" },
        { href: "/admin/acces", label: "Accès" },
      ],
    },
    {
      title: "Catalogue",
      items: [
        { href: "/admin/produits", label: "Produits" },
        { href: "/admin/services", label: "Services" },
        { href: "/admin/temoignages", label: "Témoignages" },
      ],
    },
    {
      title: "Relation client",
      items: [
        { href: "/admin/devis", label: "Devis", badge: counts.quotes },
        { href: "/admin/messages", label: "Messages", badge: counts.messages },
      ],
    },
    {
      title: "Système",
      items: [
        { href: "/admin/parametres", label: "Paramètres" },
        { href: "/admin/emails", label: "Emails envoyés" },
        { href: "/admin/journal", label: "Journal d'audit" },
        { href: "/admin/administrateurs", label: "Administrateurs" },
        { href: "/admin/securite", label: "Sécurité (2FA)" },
        { href: "/admin/etat", label: "État du système" },
      ],
    },
  ];

  return (
    <AdminShell
      groups={groups}
      adminName={admin.email ?? admin.name}
      signOutAction={signOut}
    >
      {children}
    </AdminShell>
  );
}
