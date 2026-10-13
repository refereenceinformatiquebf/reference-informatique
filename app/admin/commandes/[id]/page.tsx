import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminHeader,
  Facts,
  Panel,
  ResponsiveTable,
  StatusBadge,
} from "@/components/admin/ui";
import { AdminAction } from "@/components/admin/admin-action";
import { NoteForm } from "@/components/admin/note-form";
import { prisma } from "@/lib/prisma/client";
import { getProduct } from "@/lib/catalog/live";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { whatsappLinkTo } from "@/lib/site";
import {
  cancelOrderAction,
  refundOrderAction,
  resendPaymentEmailAction,
  saveOrderNoteAction,
  setDeliveryStatusAction,
  validateOrderManuallyAction,
  verifySaspayOrderAction,
} from "@/lib/actions/admin/orders";

export const metadata: Metadata = { title: "Commande" };
export const dynamic = "force-dynamic";

const DELIVERY = {
  A_PREPARER: { label: "À préparer", variant: "warning" },
  EN_LIVRAISON: { label: "En livraison", variant: "neutral" },
  LIVREE: { label: "Livrée", variant: "success" },
} as const;

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/commandes/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      product: true,
      service: true,
      profile: true,
      payments: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const catalogProduct = order.product
    ? await getProduct(order.product.slug)
    : null;
  const status = ORDER_STATUS_LABELS[order.status];
  const ref = order.id.slice(0, 8).toUpperCase();
  const physical =
    Boolean(order.deliveryStatus) || Boolean(order.shippingAddress);
  const shippingPhone = order.shippingPhone ?? order.profile.phone;

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/commandes", label: "Commandes" }}
        title={`Commande ${ref}`}
        subtitle={
          <>
            Créée le {formatDateTime(order.createdAt)}
            {order.manual ? " par l'équipe" : ""}
            {order.paidAt ? ` · payée le ${formatDateTime(order.paidAt)}` : ""}
          </>
        }
        actions={<StatusBadge label={status.label} variant={status.variant} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Panel title="Actions">
            <div className="flex flex-wrap items-start gap-3">
              {order.status === "EN_ATTENTE" ? (
                <>
                  {order.paymentProvider === "SASPAY" &&
                  order.providerSessionId ? (
                    <AdminAction
                      action={verifySaspayOrderAction}
                      hidden={{ orderId: order.id }}
                      label="Vérifier auprès de SasPay"
                      variant="primary"
                    />
                  ) : null}
                  <AdminAction
                    action={validateOrderManuallyAction}
                    hidden={{ orderId: order.id }}
                    label="Valider le paiement"
                    variant={
                      order.paymentProvider === "SASPAY" ? "outline" : "primary"
                    }
                    confirm={{
                      title: "Valider le paiement à la main",
                      description:
                        "À utiliser quand l'argent est bien arrivé en dehors du site (Mobile Money direct, espèces, WhatsApp). Le client reçoit son accès et un email de confirmation.",
                      confirmLabel: "Valider le paiement",
                      reasonLabel: "Comment le paiement a-t-il été reçu ?",
                      reasonRequired: true,
                    }}
                  />
                  <AdminAction
                    action={cancelOrderAction}
                    hidden={{ orderId: order.id }}
                    label="Annuler la commande"
                    variant="ghost"
                    confirm={{
                      title: "Annuler cette commande ?",
                      description:
                        "La commande n'est pas payée : elle sera simplement clôturée. Une page de paiement encore ouverte ne sera plus utilisable.",
                      confirmLabel: "Annuler la commande",
                      reasonLabel: "Motif (facultatif)",
                    }}
                  />
                </>
              ) : null}

              {order.status === "PAYE" ? (
                <>
                  <AdminAction
                    action={resendPaymentEmailAction}
                    hidden={{ orderId: order.id }}
                    label="Renvoyer l'email de confirmation"
                  />
                  <AdminAction
                    action={refundOrderAction}
                    hidden={{ orderId: order.id }}
                    label="Rembourser"
                    variant="danger"
                    confirm={{
                      title: "Marquer cette commande comme remboursée",
                      description:
                        "L'accès du client à ce produit est retiré. Le remboursement de l'argent lui-même se fait en dehors du site (Mobile Money, SasPay) : ici, nous en gardons la trace.",
                      confirmLabel: "Marquer comme remboursée",
                      reasonLabel: "Motif du remboursement",
                      reasonRequired: true,
                      notifyLabel: "Prévenir le client par email",
                    }}
                  />
                </>
              ) : null}

              {order.status === "ANNULE" ||
              order.status === "REMBOURSE" ||
              order.status === "ECHOUE" ? (
                <p className="text-ink-soft text-sm">
                  Cette commande est clôturée : aucune action n&apos;est
                  possible. Pour la refaire, créez une nouvelle commande.
                </p>
              ) : null}
            </div>
          </Panel>

          {physical ? (
            <Panel
              title="Livraison"
              actions={
                order.deliveryStatus ? (
                  <StatusBadge
                    label={DELIVERY[order.deliveryStatus].label}
                    variant={DELIVERY[order.deliveryStatus].variant}
                  />
                ) : undefined
              }
            >
              <Facts
                items={[
                  { label: "Ville", value: order.shippingCity ?? "—" },
                  {
                    label: "Téléphone de livraison",
                    value: shippingPhone ?? "—",
                  },
                  {
                    label: "Adresse et repère",
                    value: (
                      <span className="whitespace-pre-wrap">
                        {order.shippingAddress ?? "—"}
                      </span>
                    ),
                  },
                  {
                    label: "Remise",
                    value: order.deliveredAt
                      ? `Remise le ${formatDateTime(order.deliveredAt)}`
                      : "Pas encore remise",
                  },
                ]}
              />
              {order.status === "PAYE" ? (
                <div className="mt-5 flex flex-wrap items-start gap-3">
                  {shippingPhone ? (
                    <a
                      href={whatsappLinkTo(
                        shippingPhone,
                        `Bonjour ${order.profile.name}, nous préparons la livraison de votre clé USB. Où et quand pouvons-nous vous la remettre ?`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-line text-success-text hover:border-success inline-flex min-h-9 items-center rounded-md border px-3 text-[0.8125rem] font-medium"
                    >
                      Écrire au client sur WhatsApp
                    </a>
                  ) : null}
                  {order.deliveryStatus !== "EN_LIVRAISON" &&
                  order.deliveryStatus !== "LIVREE" ? (
                    <AdminAction
                      action={setDeliveryStatusAction}
                      hidden={{ orderId: order.id, status: "EN_LIVRAISON" }}
                      label="Marquer en livraison"
                      confirm={{
                        title: "Clé en cours de livraison",
                        description: "Le statut passe à « En livraison ».",
                        notifyLabel: "Prévenir le client par email",
                      }}
                    />
                  ) : null}
                  {order.deliveryStatus !== "LIVREE" ? (
                    <AdminAction
                      action={setDeliveryStatusAction}
                      hidden={{ orderId: order.id, status: "LIVREE" }}
                      label="Marquer comme livrée"
                      variant="primary"
                      confirm={{
                        title: "Clé remise au client",
                        description: "Le statut passe à « Livrée ».",
                        notifyLabel: "Prévenir le client par email",
                      }}
                    />
                  ) : (
                    <AdminAction
                      action={setDeliveryStatusAction}
                      hidden={{ orderId: order.id, status: "A_PREPARER" }}
                      label="Remettre à préparer"
                      variant="ghost"
                    />
                  )}
                </div>
              ) : null}
            </Panel>
          ) : null}

          <Panel title="Paiements enregistrés">
            <ResponsiveTable
              rows={order.payments}
              rowKey={(payment) => payment.id}
              empty="Aucun paiement enregistré pour cette commande."
              columns={[
                {
                  header: "Date",
                  cell: (payment) => formatDateTime(payment.createdAt),
                },
                {
                  header: "Fournisseur",
                  cell: (payment) =>
                    payment.provider === "SASPAY"
                      ? "SasPay"
                      : "Validation manuelle",
                },
                {
                  header: "Référence",
                  hideOnMobile: true,
                  cell: (payment) => (
                    <code className="text-xs break-all">
                      {payment.providerRef}
                    </code>
                  ),
                },
                { header: "Statut", cell: (payment) => payment.status },
                {
                  header: "Montant",
                  right: true,
                  cell: (payment) => formatPrice(payment.amount),
                },
              ]}
            />
          </Panel>

          <Panel title="Historique">
            {order.events.length === 0 ? (
              <p className="text-ink-soft text-sm">
                Aucun événement enregistré.
              </p>
            ) : (
              <ol className="border-line relative ml-2 border-l">
                {order.events.map((event) => (
                  <li key={event.id} className="mb-4 ml-4 last:mb-0">
                    <span className="bg-brand absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full" />
                    <p className="text-ink text-sm">{event.message}</p>
                    <p className="text-ink-faint text-xs">
                      {formatDateTime(event.createdAt)}
                      {event.actorLabel ? ` · ${event.actorLabel}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Commande">
            <Facts
              items={[
                {
                  label: "Produit",
                  value: order.product?.name ?? order.service?.name ?? "—",
                },
                { label: "Quantité", value: order.quantity },
                {
                  label: "Prix unitaire",
                  value: formatPrice(order.unitPrice ?? order.amount),
                },
                {
                  label: "Total",
                  value: (
                    <strong className="tabular">
                      {formatPrice(order.amount)}
                    </strong>
                  ),
                },
                {
                  label: "Canal",
                  value:
                    order.channel === "BOUTIQUE"
                      ? "Paiement en ligne (SasPay)"
                      : "WhatsApp",
                },
                {
                  label: "Mode de remise",
                  value:
                    catalogProduct?.delivery === "cle-physique"
                      ? "Clé USB livrée"
                      : catalogProduct?.delivery === "manuel"
                        ? "Remise par WhatsApp"
                        : "Accès numérique",
                },
                {
                  label: "Référence",
                  value: <code className="text-xs break-all">{order.id}</code>,
                },
              ]}
            />
          </Panel>

          <Panel title="Client">
            <Facts
              items={[
                {
                  label: "Nom",
                  value: (
                    <Link
                      href={`/admin/clients/${order.profile.id}`}
                      className="text-brand-text font-medium underline-offset-4 hover:underline"
                    >
                      {order.profile.name}
                    </Link>
                  ),
                },
                { label: "Email", value: order.profile.email ?? "—" },
                { label: "Téléphone", value: order.profile.phone ?? "—" },
              ]}
            />
            {order.profile.phone ? (
              <a
                href={whatsappLinkTo(
                  order.profile.phone,
                  `Bonjour ${order.profile.name}, `,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-success-text mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline"
              >
                Écrire sur WhatsApp
              </a>
            ) : null}
          </Panel>

          <Panel title="Note interne">
            <NoteForm
              action={saveOrderNoteAction}
              hidden={{ orderId: order.id }}
              label="Visible uniquement par l'équipe"
              defaultValue={order.internalNote}
              placeholder="Ex. : client rappelé, remise prévue samedi…"
            />
          </Panel>
        </div>
      </div>
    </>
  );
}
