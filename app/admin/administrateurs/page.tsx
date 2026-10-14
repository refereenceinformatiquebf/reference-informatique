import type { Metadata } from "next";
import { AdminHeader, Panel, ResponsiveTable } from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma/client";
import { formatDate } from "@/lib/format";
import { removeAdminAction } from "@/lib/actions/admin/admins";
import { AddAdminForm } from "./add-admin-form";

export const metadata: Metadata = { title: "Administrateurs" };
export const dynamic = "force-dynamic";

export default async function AdminAdminsPage() {
  const me = await requireAdmin();
  const admins = await prisma.profile.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <AdminHeader
        title="Administrateurs"
        subtitle="Les personnes qui ont accès à cette administration : elles voient les données de tous les clients. Ajoutez-en le moins possible."
      />

      <div className="flex flex-col gap-6">
        <ResponsiveTable
          rows={admins}
          rowKey={(admin) => admin.id}
          columns={[
            {
              header: "Administrateur",
              cell: (admin) => (
                <div className="min-w-0">
                  <p className="font-medium">
                    {admin.name}
                    {admin.id === me.id ? " (vous)" : ""}
                  </p>
                  <p className="text-ink-faint text-xs break-all">
                    {admin.email}
                  </p>
                </div>
              ),
            },
            {
              header: "Compte créé le",
              hideOnMobile: true,
              cell: (admin) => formatDate(admin.createdAt),
            },
            {
              header: "",
              right: true,
              cell: (admin) =>
                admin.id === me.id ? null : (
                  <AdminAction
                    action={removeAdminAction}
                    hidden={{ profileId: admin.id }}
                    label="Retirer"
                    variant="ghost"
                    confirm={{
                      title: `Retirer ${admin.name} des administrateurs ?`,
                      description:
                        "Cette personne perd l'accès à l'administration. Son compte client reste.",
                      confirmLabel: "Retirer",
                      reasonLabel: "Motif (journalisé)",
                      reasonRequired: true,
                    }}
                  />
                ),
            },
          ]}
        />

        <Panel title="Ajouter un administrateur">
          <AddAdminForm />
        </Panel>
      </div>
    </>
  );
}
