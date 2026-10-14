import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AdminHeader,
  Facts,
  Panel,
  ResponsiveTable,
  StatusBadge,
} from "@/components/admin/ui";
import { NoteForm } from "@/components/admin/note-form";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/client";
import { formatDate, formatPrice } from "@/lib/format";
import {
  formatPhone,
  readPurchases,
  whatsappLinkTo,
} from "@/lib/legacy/display";
import { SITE } from "@/lib/site";
import { saveLegacyNoteAction } from "@/lib/actions/admin/clients";

export const metadata: Metadata = { title: "Client RI01" };
export const dynamic = "force-dynamic";

export default async function AdminLegacyClientPage({
  params,
}: PageProps<"/admin/clients/ri01/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const client = await prisma.legacyClient.findUnique({ where: { id } });
  if (!client) notFound();

  const purchases = readPurchases(client.purchases);
  const siteAccount = client.email
    ? await prisma.profile.findUnique({
        where: { email: client.email.toLowerCase() },
        select: { id: true, name: true },
      })
    : null;
  const first = client.name.split(" ")[0];
  const inviteMessage = `Bonjour ${first}, ${SITE.name} a un nouveau site. Vous pouvez y accéder à votre espace avec votre adresse email : ${SITE.url}/connexion`;

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/clients", label: "Clients RI01" }}
        title={client.name}
        subtitle={`${client.code}${client.signedUpAt ? ` · inscrit sur l'ancien site le ${formatDate(client.signedUpAt)}` : ""}`}
        actions={
          client.phone ? (
            <Button asChild variant="whatsapp" size="sm">
              <a
                href={whatsappLinkTo(
                  client.phone,
                  `Bonjour ${first}, c'est ${SITE.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Panel title={`Achats sur l'ancien site (${purchases.length})`}>
            <ResponsiveTable
              rows={purchases.map((purchase, index) => ({
                ...purchase,
                index,
              }))}
              rowKey={(purchase) => String(purchase.index)}
              empty="Aucun achat enregistré."
              columns={[
                { header: "Produit", cell: (purchase) => purchase.product },
                {
                  header: "Date",
                  cell: (purchase) =>
                    purchase.date ? formatDate(purchase.date) : "—",
                },
                {
                  header: "Montant",
                  right: true,
                  cell: (purchase) =>
                    purchase.amount ? formatPrice(purchase.amount) : "—",
                },
                {
                  header: "État",
                  cell: (purchase) =>
                    purchase.status === "PAIEMENT_RECU" ? (
                      <StatusBadge
                        label="Paiement reçu, accès non activé"
                        variant="warning"
                      />
                    ) : (
                      <StatusBadge label="Accès activé" variant="success" />
                    ),
                },
              ]}
            />
          </Panel>

          <Panel title="Note interne">
            <NoteForm
              action={saveLegacyNoteAction}
              hidden={{ legacyId: client.id }}
              label="Visible uniquement par l'équipe"
              defaultValue={client.adminNote}
              placeholder="Ex. : a demandé à récupérer ses contenus, rappelé le 12/10…"
            />
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Coordonnées">
            <Facts
              items={[
                { label: "Téléphone", value: formatPhone(client.phone) || "—" },
                {
                  label: "Email",
                  value: client.email ?? "Pas d'adresse email",
                },
                { label: "Ville", value: client.city ?? "—" },
              ]}
            />
            <p className="text-ink-faint mt-4 text-xs leading-relaxed">
              Ce client n&apos;a pas de compte de connexion : c&apos;est une
              simple fiche de suivi, aucun compte n&apos;a été créé pour lui.
            </p>
          </Panel>

          <Panel title="Nouveau site">
            {siteAccount ? (
              <p className="text-ink-soft text-sm leading-relaxed">
                Cette personne a déjà un compte sur le nouveau site (
                <a
                  href={`/admin/clients/${siteAccount.id}`}
                  className="text-brand-text underline underline-offset-4"
                >
                  voir le compte
                </a>
                ).
              </p>
            ) : (
              <>
                <p className="text-ink-soft text-sm leading-relaxed">
                  Pour qu&apos;elle retrouve ses achats et en fasse de nouveaux,
                  invitez-la à se connecter : un lien lui est envoyé par email
                  et son compte se crée tout seul.
                </p>
                {client.phone ? (
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <a
                      href={whatsappLinkTo(client.phone, inviteMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Inviter par WhatsApp
                    </a>
                  </Button>
                ) : (
                  <p className="text-ink-faint mt-3 text-xs">
                    Pas de numéro WhatsApp pour cette fiche.
                  </p>
                )}
              </>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
