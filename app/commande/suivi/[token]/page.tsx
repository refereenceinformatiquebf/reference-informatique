import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/dal";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { getProduct } from "@/lib/catalog/live";
import {
  openPurchase,
  resumePayment,
  sendFreshAccessLink,
} from "@/lib/actions/checkout";
import { findOrderByToken } from "@/lib/checkout/access";
import {
  accessDestination,
  accessLinkExpired,
  maskEmail,
} from "@/lib/checkout/rules";
import { ActionForm } from "@/components/checkout/action-form";
import { AutoRefresh } from "@/components/checkout/auto-refresh";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container, IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import { formatDateTime, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Suivi de ma commande",
  robots: { index: false, follow: false },
  // Le jeton est dans l'adresse : on évite qu'elle soit transmise à un site tiers.
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";

const KEY_TITLE = {
  A_PREPARER: "Nous préparons votre clé",
  EN_LIVRAISON: "Votre clé est en route",
  LIVREE: "Votre clé vous a été remise",
} as const;

const DELIVERY_LABEL = {
  A_PREPARER: "En préparation",
  EN_LIVRAISON: "En livraison",
  LIVREE: "Livrée",
} as const;

/** Ce que le client voit de l'historique : des phrases fixes, jamais les notes de l'équipe. */
const TIMELINE_LABEL: Record<string, string> = {
  CREATED: "Commande enregistrée",
  PAID: "Paiement confirmé",
  DELIVERY: "Livraison mise à jour",
  REFUNDED: "Commande remboursée",
  CANCELLED: "Commande annulée",
};

export default async function SuiviPage({
  params,
}: PageProps<"/commande/suivi/[token]">) {
  const { token } = await params;
  let order = await findOrderByToken(token);

  if (!order) {
    return (
      <Container className="max-w-md py-24 text-center">
        <IconChip name="recherche" size={56} className="mx-auto" />
        <h1 className="text-ink mt-5 text-[1.75rem] leading-tight">
          Ce lien n&apos;est pas valable
        </h1>
        <p className="text-ink-soft mt-3 text-[0.9375rem] leading-relaxed">
          Il est peut-être incomplet, ou remplacé par un lien plus récent.
          Retrouvez votre commande avec l&apos;adresse email utilisée pour
          payer.
        </p>
        <Button asChild className="mt-6">
          <Link href="/commande/suivi">Retrouver ma commande</Link>
        </Button>
      </Container>
    );
  }

  // Revient-on de la page de paiement ? On demande à SasPay plutôt que d'attendre le webhook.
  if (
    order.status === "EN_ATTENTE" &&
    order.paymentProvider === "SASPAY" &&
    order.providerSessionId
  ) {
    const nowPaid = await syncSaspayOrder(order).catch((error) => {
      console.error("[commande/suivi] revérification impossible", error);
      return false;
    });
    if (nowPaid) order = (await findOrderByToken(token)) ?? order;
  }

  const profile = await getCurrentProfile();
  const catalogProduct = order.product
    ? await getProduct(order.product.slug)
    : undefined;
  const delivery = catalogProduct?.delivery;
  // Une clé USB se livre : rien à ouvrir en ligne, on suit la livraison.
  const isKey = delivery === "cle-physique";
  const productName = order.product?.name ?? "Votre commande";
  const isPaid = order.status === "PAYE";
  const expired = isPaid && accessLinkExpired(order);
  const alreadyIn = profile?.id === order.profileId;
  const reference = order.id.slice(0, 8).toUpperCase();
  const pendingOnline =
    order.status === "EN_ATTENTE" && order.paymentProvider === "SASPAY";

  const status = {
    PAYE: { label: "Payée", variant: "success" as const },
    EN_ATTENTE: {
      label: "En attente de paiement",
      variant: "warning" as const,
    },
    ECHOUE: { label: "Paiement échoué", variant: "danger" as const },
    ANNULE: { label: "Annulée", variant: "outline" as const },
    REMBOURSE: { label: "Remboursée", variant: "outline" as const },
  }[order.status];

  const timeline = [...order.events]
    .filter((event) => TIMELINE_LABEL[event.type])
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <Container className="max-w-xl py-14 sm:py-20">
      {pendingOnline ? <AutoRefresh /> : null}
      <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
        Commande {reference}
      </p>
      <h1 className="text-ink mt-2 text-[1.875rem] leading-[1.1] sm:text-[2.25rem]">
        {fr(
          isPaid
            ? isKey
              ? KEY_TITLE[order.deliveryStatus ?? "A_PREPARER"]
              : "Votre achat est prêt"
            : order.status === "EN_ATTENTE"
              ? "Votre commande vous attend"
              : "Suivi de votre commande",
        )}
      </h1>

      <div className="border-line bg-paper shadow-card mt-8 rounded-xl border p-6">
        <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="font-display text-ink text-[1.25rem] leading-tight">
              {order.quantity > 1 ? `${order.quantity} × ` : ""}
              {productName}
            </p>
            <p className="text-ink-soft mt-1 text-sm">
              {formatPrice(order.amount)} · {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {order.deliveryStatus ? (
          <p className="text-ink-soft mt-4 text-sm">
            Livraison de la clé :{" "}
            <strong className="text-ink">
              {DELIVERY_LABEL[order.deliveryStatus]}
            </strong>
            {order.shippingCity ? ` — ${order.shippingCity}` : ""}
          </p>
        ) : null}

        {timeline.length > 0 ? (
          <ol className="border-line mt-5 space-y-2 border-t pt-4">
            {timeline.map((event) => (
              <li
                key={event.id}
                className="text-ink-soft flex justify-between gap-3 text-sm"
              >
                <span>{TIMELINE_LABEL[event.type]}</span>
                <span className="text-ink-faint tabular shrink-0 text-xs">
                  {formatDateTime(event.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col items-stretch gap-3">
        {isPaid && !expired ? (
          alreadyIn ? (
            <Button asChild size="lg" variant={isKey ? "outline" : "primary"}>
              <Link href={accessDestination(delivery, order.product?.slug)}>
                {isKey ? "Voir mes commandes" : "Accéder à mon achat"}
              </Link>
            </Button>
          ) : (
            <>
              <ActionForm
                action={openPurchase}
                fields={{ token }}
                label={
                  isKey
                    ? "Voir mes commandes et nos recommandations"
                    : "Accéder à mon achat"
                }
                pendingLabel="Ouverture en cours…"
                variant={isKey ? "outline" : "primary"}
                size="lg"
                className="flex flex-col items-stretch"
              />
              <p className="text-ink-faint text-center text-xs leading-relaxed">
                Un clic, sans mot de passe. Ce lien est personnel : ne le
                transmettez pas.
              </p>
            </>
          )
        ) : null}

        {expired ? (
          <>
            <p className="text-ink-soft text-sm leading-relaxed">
              Ce lien n&apos;est plus valable. Recevez-en un nouveau : il part
              vers{" "}
              {order.profile.email
                ? maskEmail(order.profile.email)
                : "votre adresse email"}
              .
            </p>
            <ActionForm
              action={sendFreshAccessLink}
              fields={{ token }}
              label="Recevoir un nouveau lien"
              pendingLabel="Envoi en cours…"
              size="lg"
              className="flex flex-col items-stretch"
            />
          </>
        ) : null}

        {pendingOnline ? (
          <>
            <p className="text-ink-soft text-sm leading-relaxed">
              Votre paiement n&apos;est pas encore confirmé. Si vous avez payé à
              l&apos;instant, patientez un moment : cette page se met à jour
              toute seule. Sinon, vous pouvez le reprendre.
            </p>
            <ActionForm
              action={resumePayment}
              fields={{ token }}
              label="Reprendre mon paiement"
              pendingLabel="Ouverture du paiement…"
              size="lg"
              className="flex flex-col items-stretch"
            />
          </>
        ) : null}

        {order.status === "EN_ATTENTE" && !pendingOnline ? (
          <p className="text-ink-soft text-sm leading-relaxed">
            Cette commande se règle avec notre équipe sur WhatsApp. Dès que le
            paiement est confirmé, votre accès s&apos;ouvre ici.
          </p>
        ) : null}

        {order.status === "REMBOURSE" ||
        order.status === "ANNULE" ||
        order.status === "ECHOUE" ? (
          <Button asChild size="lg" variant="outline">
            <Link href="/boutique">Voir la boutique</Link>
          </Button>
        ) : null}
      </div>

      <p className="text-ink-soft mt-10 text-center text-sm leading-relaxed">
        Une question sur cette commande ?{" "}
        <a
          href={whatsappLink(
            `Bonjour, une question sur ma commande « ${productName} ». Référence : ${order.id}`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-text inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
        >
          <IconWhatsapp size={16} />
          Écrivez-nous sur WhatsApp
        </a>
        .
      </p>
    </Container>
  );
}
