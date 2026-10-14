import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminHeader, Facts, Panel, StatusBadge } from "@/components/admin/ui";
import { NoteForm } from "@/components/admin/note-form";
import { ReplyForm } from "@/components/admin/reply-form";
import { SelectAction } from "@/components/admin/select-action";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/client";
import { formatDateTime } from "@/lib/format";
import { QUOTE_STATUS_LABELS } from "@/lib/status-labels";
import { SITE, whatsappLinkTo } from "@/lib/site";
import {
  replyToQuoteAction,
  saveQuoteNoteAction,
  setQuoteStatusAction,
} from "@/lib/actions/admin/quotes";

export const metadata: Metadata = { title: "Demande de devis" };
export const dynamic = "force-dynamic";

export default async function AdminQuoteDetailPage({
  params,
}: PageProps<"/admin/devis/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { service: true, profile: true },
  });
  if (!quote) notFound();

  const history = await prisma.adminAuditLog.findMany({
    where: { entity: "quote", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const status = QUOTE_STATUS_LABELS[quote.status];
  const first = quote.name.split(" ")[0];

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/devis", label: "Devis" }}
        title={quote.name}
        subtitle={`${quote.service.name} · reçue le ${formatDateTime(quote.createdAt)}`}
        actions={
          <>
            <StatusBadge label={status.label} variant={status.variant} />
            <Button asChild variant="whatsapp" size="sm">
              <a
                href={whatsappLinkTo(
                  quote.phone,
                  `Bonjour ${first}, c'est ${SITE.name} au sujet de votre demande « ${quote.service.name} ».`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Panel title="La demande">
            <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
              {quote.message}
            </p>
            {quote.budget ? (
              <p className="text-ink-soft mt-4 text-sm">
                Budget indicatif :{" "}
                <strong className="text-ink">{quote.budget}</strong>
              </p>
            ) : null}
          </Panel>

          <Panel title="Répondre par email">
            <ReplyForm
              action={replyToQuoteAction}
              hidden={{ quoteId: quote.id }}
              to={quote.email}
              defaultSubject={`Votre demande de devis — ${quote.service.name}`}
              defaultBody={`Bonjour ${first},\n\nMerci pour votre demande concernant « ${quote.service.name} ».\n\n\n\nCordialement,\nL'équipe ${SITE.name}\n${SITE.phoneDisplay}`}
            />
          </Panel>

          <Panel title="Historique">
            {history.length === 0 ? (
              <p className="text-ink-soft text-sm">
                Aucune action de l&apos;équipe pour l&apos;instant.
              </p>
            ) : (
              <ol className="border-line relative ml-2 border-l">
                {history.map((entry) => (
                  <li key={entry.id} className="mb-4 ml-4 last:mb-0">
                    <span className="bg-brand absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full" />
                    <p className="text-ink text-sm">
                      {entry.summary ?? entry.action}
                    </p>
                    <p className="text-ink-faint text-xs">
                      {formatDateTime(entry.createdAt)}
                      {entry.adminLabel ? ` · ${entry.adminLabel}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Avancement">
            <SelectAction
              action={setQuoteStatusAction}
              hidden={{ quoteId: quote.id }}
              name="status"
              label="Statut de la demande"
              value={quote.status}
              options={Object.entries(QUOTE_STATUS_LABELS).map(
                ([value, item]) => ({
                  value,
                  label: item.label,
                }),
              )}
            />
          </Panel>

          <Panel title="Coordonnées">
            <Facts
              items={[
                {
                  label: "Email",
                  value: <span className="break-all">{quote.email}</span>,
                },
                { label: "Téléphone", value: quote.phone },
                { label: "Entreprise", value: quote.company ?? "—" },
                {
                  label: "Compte client",
                  value: quote.profile ? (
                    <a
                      href={`/admin/clients/${quote.profile.id}`}
                      className="text-brand-text underline underline-offset-4"
                    >
                      {quote.profile.name}
                    </a>
                  ) : (
                    "Demande faite sans compte"
                  ),
                },
              ]}
            />
          </Panel>

          <Panel title="Note interne">
            <NoteForm
              action={saveQuoteNoteAction}
              hidden={{ quoteId: quote.id }}
              label="Visible uniquement par l'équipe"
              defaultValue={quote.internalNote}
              placeholder="Ex. : devis envoyé le 15/10, relancer vendredi…"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
