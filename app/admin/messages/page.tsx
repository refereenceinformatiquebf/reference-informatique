import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  Pager,
  Panel,
  fieldClass,
  pageCountFor,
  pageParam,
  paramText,
} from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { ReplyForm } from "@/components/admin/reply-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma/client";
import { formatDateTime } from "@/lib/format";
import { SITE, whatsappLinkTo } from "@/lib/site";
import {
  replyToMessageAction,
  setMessageHandledAction,
} from "@/lib/actions/admin/messages";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminMessagesPage({
  searchParams,
}: PageProps<"/admin/messages">) {
  const params = await searchParams;
  const q = paramText(params.q)?.slice(0, 100);
  const etat =
    paramText(params.etat) === "traites"
      ? "traites"
      : paramText(params.etat) === "tous"
        ? "tous"
        : "a-traiter";
  const page = pageParam(params.page);

  const where: Prisma.ContactMessageWhereInput = {
    ...(etat === "a-traiter"
      ? { handled: false }
      : etat === "traites"
        ? { handled: true }
        : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [messages, total, pending] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { handled: false } }),
  ]);

  return (
    <>
      <AdminHeader
        title="Messages"
        subtitle={`${pending} message${pending > 1 ? "s" : ""} à traiter. Ce sont les questions envoyées depuis la page Contact.`}
        actions={
          <Button asChild variant="outline" size="sm">
            {/* Téléchargement de fichier : un lien classique est voulu. */}
            <a href="/admin/export/messages" download>
              Exporter en CSV
            </a>
          </Button>
        }
      />

      <FilterBar action="/admin/messages" resetHref="/admin/messages">
        <FilterField label="Recherche" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Nom, email, texte du message…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Afficher">
          <select name="etat" defaultValue={etat} className={fieldClass}>
            <option value="a-traiter">À traiter</option>
            <option value="traites">Traités</option>
            <option value="tous">Tous</option>
          </select>
        </FilterField>
      </FilterBar>

      {messages.length === 0 ? (
        <p className="border-line bg-paper text-ink-soft rounded-xl border px-4 py-10 text-center text-sm">
          {etat === "a-traiter"
            ? "Aucun message à traiter. Tout est à jour."
            : "Aucun message ne correspond à ces filtres."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <Panel key={message.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-ink font-semibold">{message.name}</p>
                  <p className="text-ink-faint text-xs break-all">
                    {message.email}
                    {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <Badge variant={message.handled ? "success" : "warning"}>
                  {message.handled ? "Traité" : "À traiter"}
                </Badge>
              </div>
              <p className="text-ink mt-3 text-sm leading-relaxed whitespace-pre-wrap">
                {message.message}
              </p>
              <div className="mt-4 flex flex-wrap items-start gap-3">
                {message.phone ? (
                  <Button asChild variant="whatsapp" size="sm">
                    <a
                      href={whatsappLinkTo(
                        message.phone,
                        `Bonjour ${message.name.split(" ")[0]}, c'est ${SITE.name} au sujet de votre message.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Button>
                ) : null}
                <AdminAction
                  action={setMessageHandledAction}
                  hidden={{
                    messageId: message.id,
                    handled: message.handled ? "false" : "true",
                  }}
                  label={
                    message.handled
                      ? "Remettre à traiter"
                      : "Marquer comme traité"
                  }
                  variant={message.handled ? "ghost" : "outline"}
                />
              </div>
              <details className="border-line mt-4 border-t pt-4">
                <summary className="text-brand-text cursor-pointer text-sm font-medium">
                  Répondre par email
                </summary>
                <div className="mt-4">
                  <ReplyForm
                    action={replyToMessageAction}
                    hidden={{ messageId: message.id }}
                    to={message.email}
                    defaultSubject={`Votre message à ${SITE.name}`}
                    defaultBody={`Bonjour ${message.name.split(" ")[0]},\n\nMerci pour votre message.\n\n\n\nCordialement,\nL'équipe ${SITE.name}\n${SITE.phoneDisplay}`}
                  />
                </div>
              </details>
            </Panel>
          ))}
        </div>
      )}
      <Pager
        page={page}
        pageCount={pageCountFor(total, PAGE_SIZE)}
        total={total}
        basePath="/admin/messages"
        params={{ q, etat: etat === "a-traiter" ? undefined : etat }}
      />
      <p className="text-ink-faint mt-6 text-xs">
        Les devis se traitent dans{" "}
        <Link href="/admin/devis" className="underline underline-offset-4">
          Devis
        </Link>
        .
      </p>
    </>
  );
}
