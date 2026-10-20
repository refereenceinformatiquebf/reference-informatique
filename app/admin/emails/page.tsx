import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@/lib/generated/prisma/client";
import {
  AdminHeader,
  FilterBar,
  FilterField,
  Kpi,
  Pager,
  ResponsiveTable,
  StatusBadge,
  fieldClass,
  pageCountFor,
  pageParam,
  paramText,
} from "@/components/admin/ui";
import { prisma } from "@/lib/prisma/client";
import { emailStats24h } from "@/lib/admin/email-stats";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Emails envoyés" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

const TEMPLATE_LABELS: Record<string, string> = {
  "order-confirmation": "Commande reçue (client)",
  "payment-confirmation": "Paiement confirmé (client)",
  "access-granted": "Accès accordé",
  "licence-ready": "Licence prête",
  "order-new-admin": "Nouvelle commande (équipe)",
  "order-paid-admin": "Paiement reçu (équipe)",
  "delivery-update": "Suivi de livraison",
  "refund-notice": "Remboursement",
  "devis-received-client": "Devis reçu (client)",
  "devis-received-admin": "Devis reçu (équipe)",
  "contact-received-client": "Message reçu (client)",
  "contact-message-admin": "Message reçu (équipe)",
  "quote-reply": "Réponse à un devis",
  "message-reply": "Réponse à un message",
  "auth-magiclink": "Lien de connexion",
  "auth-signup": "Confirmation d'inscription",
  "auth-recovery": "Mot de passe oublié",
};

const STATUS = {
  SENT: { label: "Envoyé", variant: "success" },
  FAILED: { label: "Échec", variant: "danger" },
  SKIPPED: { label: "Non envoyé (mode test)", variant: "neutral" },
} as const;

export default async function AdminEmailsPage({
  searchParams,
}: PageProps<"/admin/emails">) {
  const params = await searchParams;
  const q = paramText(params.q)?.slice(0, 100);
  const statutRaw = paramText(params.statut);
  const statut = statutRaw && statutRaw in STATUS ? statutRaw : undefined;
  const modele = paramText(params.modele);
  const page = pageParam(params.page);

  const where: Prisma.EmailLogWhereInput = {
    ...(statut ? { status: statut } : {}),
    ...(modele ? { template: modele } : {}),
    ...(q
      ? {
          OR: [
            { toEmail: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [rows, total, stats] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.emailLog.count({ where }),
    emailStats24h(),
  ]);
  const sent24 = stats.sent;
  const failed24 = stats.failed;

  return (
    <>
      <AdminHeader
        title="Emails envoyés"
        subtitle="Tous les emails du site (confirmations, alertes, connexion) et leur résultat. Un client qui dit ne rien avoir reçu : cherchez son adresse ici."
      />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Envoyés (24 h)" value={sent24} />
        <Kpi
          label="En échec (24 h)"
          value={failed24}
          tone={failed24 > 0 ? "warning" : "default"}
          href={failed24 > 0 ? "/admin/emails?statut=FAILED" : undefined}
        />
        <Kpi
          label="Boîte d'envoi Brevo"
          value="Brevo"
          hint="Détail de livraison dans votre compte Brevo"
        />
      </div>

      <FilterBar action="/admin/emails" resetHref="/admin/emails">
        <FilterField label="Destinataire ou objet" className="min-w-56 flex-1">
          <input
            name="q"
            defaultValue={q}
            placeholder="Adresse email, objet…"
            className={fieldClass}
          />
        </FilterField>
        <FilterField label="Résultat">
          <select
            name="statut"
            defaultValue={statut ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            {Object.entries(STATUS).map(([value, item]) => (
              <option key={value} value={value}>
                {item.label}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Type" className="min-w-52">
          <select
            name="modele"
            defaultValue={modele ?? ""}
            className={fieldClass}
          >
            <option value="">Tous</option>
            {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FilterField>
      </FilterBar>

      <ResponsiveTable
        rows={rows}
        rowKey={(row) => row.id}
        empty="Aucun email ne correspond à ces filtres."
        columns={[
          {
            header: "Date",
            cell: (row) => (
              <span className="text-ink-soft text-xs whitespace-nowrap">
                {formatDateTime(row.createdAt)}
              </span>
            ),
          },
          {
            header: "Destinataire",
            cell: (row) => (
              <span className="text-xs break-all">{row.toEmail}</span>
            ),
          },
          {
            header: "Objet",
            cell: (row) => (
              <div className="min-w-0">
                <p className="text-sm">{row.subject}</p>
                <p className="text-ink-faint text-xs">
                  {TEMPLATE_LABELS[row.template] ?? row.template}
                  {row.relatedOrderId ? (
                    <>
                      {" · "}
                      <Link
                        href={`/admin/commandes/${row.relatedOrderId}`}
                        className="text-brand-text underline underline-offset-2"
                      >
                        commande
                      </Link>
                    </>
                  ) : null}
                </p>
                {row.error ? (
                  <p className="text-danger-text mt-0.5 text-xs break-words">
                    {row.error}
                  </p>
                ) : null}
              </div>
            ),
          },
          {
            header: "Résultat",
            cell: (row) => {
              const item =
                STATUS[row.status as keyof typeof STATUS] ?? STATUS.SKIPPED;
              return <StatusBadge label={item.label} variant={item.variant} />;
            },
          },
        ]}
      />
      <Pager
        page={page}
        pageCount={pageCountFor(total, PAGE_SIZE)}
        total={total}
        basePath="/admin/emails"
        params={{ q, statut, modele }}
      />
    </>
  );
}
