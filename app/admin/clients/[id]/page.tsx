import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminHeader,
  Facts,
  Panel,
  ResponsiveTable,
  RowLink,
  StatusBadge,
} from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { NoteForm } from "@/components/admin/note-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/client";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { whatsappLinkTo } from "@/lib/site";
import { saveClientNoteAction } from "@/lib/actions/admin/clients";
import { revokeAccessAction } from "@/lib/actions/admin/access";
import { GrantAccessForm } from "../../acces/grant-access-form";
import { getAllProducts } from "@/lib/catalog/live";

export const metadata: Metadata = { title: "Client" };
export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: PageProps<"/admin/clients/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { product: true },
      },
      access: { orderBy: { grantedAt: "desc" }, include: { product: true } },
      quoteRequests: {
        orderBy: { createdAt: "desc" },
        include: { service: true },
      },
    },
  });
  if (!profile) notFound();

  const products = await getAllProducts();
  const paid = profile.orders.filter((order) => order.status === "PAYE");
  const spent = paid.reduce((sum, order) => sum + order.amount, 0);

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/clients?groupe=comptes", label: "Clients" }}
        title={profile.name}
        subtitle={`Inscrit le ${formatDate(profile.createdAt)}${profile.role === "ADMIN" ? " · administrateur" : ""}`}
        actions={
          <>
            {profile.phone ? (
              <Button asChild variant="whatsapp" size="sm">
                <a
                  href={whatsappLinkTo(
                    profile.phone,
                    `Bonjour ${profile.name.split(" ")[0]}, `,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            ) : null}
            {profile.email ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/admin/commandes/nouvelle?email=${encodeURIComponent(profile.email)}`}
                >
                  Créer une commande
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Panel title={`Commandes (${profile.orders.length})`}>
            <ResponsiveTable
              rows={profile.orders}
              rowKey={(order) => order.id}
              empty="Ce client n'a passé aucune commande."
              columns={[
                {
                  header: "Date",
                  cell: (order) => (
                    <RowLink href={`/admin/commandes/${order.id}`}>
                      {formatDate(order.createdAt)}
                    </RowLink>
                  ),
                },
                {
                  header: "Produit",
                  cell: (order) =>
                    `${order.quantity > 1 ? `${order.quantity} × ` : ""}${order.product?.name ?? "—"}`,
                },
                {
                  header: "Montant",
                  right: true,
                  cell: (order) => formatPrice(order.amount),
                },
                {
                  header: "Statut",
                  cell: (order) => {
                    const status = ORDER_STATUS_LABELS[order.status];
                    return (
                      <StatusBadge
                        label={status.label}
                        variant={status.variant}
                      />
                    );
                  },
                },
              ]}
            />
          </Panel>

          <Panel title={`Accès aux contenus (${profile.access.length})`}>
            <ResponsiveTable
              rows={profile.access}
              rowKey={(access) => access.id}
              empty="Aucun accès actif."
              columns={[
                { header: "Produit", cell: (access) => access.product.name },
                {
                  header: "Depuis le",
                  cell: (access) => formatDate(access.grantedAt),
                },
                {
                  header: "",
                  right: true,
                  cell: (access) => (
                    <AdminAction
                      action={revokeAccessAction}
                      hidden={{ accessId: access.id }}
                      label="Retirer"
                      variant="ghost"
                      confirm={{
                        title: `Retirer l'accès à « ${access.product.name} » ?`,
                        description:
                          "Le client ne pourra plus ouvrir ce contenu. Ses commandes ne sont pas modifiées.",
                        confirmLabel: "Retirer l'accès",
                        reasonLabel: "Motif (journalisé)",
                        reasonRequired: true,
                      }}
                    />
                  ),
                },
              ]}
            />
            <div className="border-line mt-5 border-t pt-5">
              <h3 className="font-display text-ink mb-3 text-[1.0625rem]">
                Donner un accès
              </h3>
              <GrantAccessForm
                profileId={profile.id}
                products={products.map((product) => ({
                  slug: product.slug,
                  name: product.name,
                }))}
              />
            </div>
          </Panel>

          <Panel title={`Demandes de devis (${profile.quoteRequests.length})`}>
            <ResponsiveTable
              rows={profile.quoteRequests}
              rowKey={(quote) => quote.id}
              empty="Aucune demande de devis liée à ce compte."
              columns={[
                {
                  header: "Date",
                  cell: (quote) => (
                    <RowLink href={`/admin/devis/${quote.id}`}>
                      {formatDate(quote.createdAt)}
                    </RowLink>
                  ),
                },
                { header: "Prestation", cell: (quote) => quote.service.name },
                { header: "Statut", cell: (quote) => quote.status },
              ]}
            />
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Coordonnées">
            <Facts
              items={[
                { label: "Email", value: profile.email ?? "—" },
                { label: "Téléphone", value: profile.phone ?? "—" },
                { label: "Achats payés", value: paid.length },
                {
                  label: "Total dépensé",
                  value: (
                    <strong className="tabular">{formatPrice(spent)}</strong>
                  ),
                },
                {
                  label: "Dernière commande",
                  value: profile.orders[0]
                    ? formatDateTime(profile.orders[0].createdAt)
                    : "—",
                },
              ]}
            />
          </Panel>

          <Panel title="Note interne">
            <NoteForm
              action={saveClientNoteAction}
              hidden={{ profileId: profile.id }}
              label="Visible uniquement par l'équipe"
              defaultValue={profile.internalNote}
              placeholder="Ex. : préfère être appelé le matin…"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
