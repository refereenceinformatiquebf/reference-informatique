import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { getCurrentProfile } from "@/lib/auth/dal";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { getProduct } from "@/lib/catalog/live";
import { resendOrderLink, resumePayment } from "@/lib/actions/checkout";
import {
  accessDestination,
  isOrderIdShape,
  maskEmail,
} from "@/lib/checkout/rules";
import { ActionForm } from "@/components/checkout/action-form";
import { AutoRefresh } from "@/components/checkout/auto-refresh";
import { Button } from "@/components/ui/button";
import { Container, IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import { Icon } from "@/components/icons/icon-by-key";
import { whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Votre commande",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/** Ce qui suit un paiement confirmé, selon le mode de remise. */
const PAID_MESSAGE = {
  "cle-physique":
    "Votre clé USB vous est livrée gratuitement sous 24 à 48 h : nous vous contactons pour convenir de la remise.",
  numerique: "Votre achat est prêt.",
  manuel:
    "Votre paiement est confirmé. Notre équipe vous contacte sur WhatsApp pour vous remettre votre accès.",
  "licence-edn": "Votre licence d'activation est prête.",
} as const;

export default async function CommandeRetourPage({
  searchParams,
}: PageProps<"/commande/retour">) {
  const { order: orderId, deja } = await searchParams;
  const profile = await getCurrentProfile();

  // Le statut affiché vient TOUJOURS d'une requête sur l'Order réel, jamais
  // d'un paramètre d'URL — un paramètre `?status=paye` serait trivialement
  // falsifiable en le tapant à la main dans la barre d'adresse. L'identifiant
  // de commande (UUID) est impossible à deviner : il suffit à voir l'état, mais
  // il n'ouvre jamais l'achat (seul le lien reçu par email le fait).
  const load = (id: string) =>
    prisma.order.findUnique({
      where: { id },
      include: { product: true, profile: true },
    });
  let order = isOrderIdShape(orderId) ? await load(orderId) : null;

  // Le client revient de la page de paiement : on n'attend pas le webhook,
  // on demande directement à SasPay si la session est payée. Idempotent —
  // si le webhook est passé entre-temps, rien n'est dupliqué.
  if (
    order &&
    order.status === "EN_ATTENTE" &&
    order.paymentProvider === "SASPAY" &&
    order.providerSessionId
  ) {
    const nowPaid = await syncSaspayOrder(order).catch((error) => {
      // SasPay injoignable : on affiche l'état connu plutôt qu'une erreur.
      console.error("[commande/retour] revérification impossible", error);
      return false;
    });
    if (nowPaid) order = await load(order.id);
  }

  if (!order) {
    return (
      <Container className="max-w-md py-24 text-center">
        <IconChip name="recherche" size={56} className="mx-auto" />
        <h1 className="text-ink mt-5 text-[1.75rem] leading-tight">
          Commande introuvable
        </h1>
        <p className="text-ink-soft mt-3 text-[0.9375rem] leading-relaxed">
          Vérifiez le lien, ou retrouvez votre commande avec l&apos;adresse
          email utilisée pour payer.
        </p>
        <Button asChild className="mt-6">
          <Link href="/commande/suivi">Retrouver ma commande</Link>
        </Button>
      </Container>
    );
  }

  const isPaid = order.status === "PAYE";
  const isOwner = profile?.id === order.profileId;
  const delivery = order.product
    ? (await getProduct(order.product.slug))?.delivery
    : undefined;
  const productName = order.product?.name ?? "votre commande";
  const maskedEmail = order.profile.email
    ? maskEmail(order.profile.email)
    : "votre adresse email";
  const closed =
    order.status === "ANNULE" ||
    order.status === "REMBOURSE" ||
    order.status === "ECHOUE";
  const pendingOnline =
    order.status === "EN_ATTENTE" && order.paymentProvider === "SASPAY";

  const title = isPaid
    ? deja
      ? "Vous avez déjà cet achat"
      : "Paiement confirmé, merci !"
    : order.status === "REMBOURSE"
      ? "Commande remboursée"
      : order.status === "ANNULE"
        ? "Commande annulée"
        : order.status === "ECHOUE"
          ? "Paiement non abouti"
          : "Paiement en cours de vérification";

  let body: string;
  if (isPaid) {
    const base = `${productName} : ${PAID_MESSAGE[delivery ?? "numerique"]}`;
    body = isOwner
      ? base
      : delivery === "cle-physique"
        ? `${base} Le lien pour suivre la livraison est envoyé à ${maskedEmail} : pas de compte à créer.`
        : `${base} Votre lien d'accès personnel est envoyé à ${maskedEmail} : un clic ouvre votre achat, sans mot de passe.`;
  } else if (closed) {
    body =
      "Cette commande est clôturée. Vous pouvez en passer une nouvelle depuis la boutique, ou nous écrire sur WhatsApp.";
  } else {
    body =
      "Si vous venez de payer, la confirmation peut prendre quelques instants : cette page se met à jour toute seule. Si vous avez quitté le paiement avant la fin, vous pouvez le reprendre.";
  }

  return (
    <Container className="max-w-lg py-20 text-center sm:py-28">
      {pendingOnline ? <AutoRefresh /> : null}
      <span
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          isPaid
            ? "bg-success-bg text-success-text"
            : "bg-warning-bg text-warning-text"
        }`}
      >
        <Icon name={isPaid ? "verifie" : "horloge"} size={34} />
      </span>
      <h1 className="text-ink mt-6 text-[2rem] leading-[1.1] sm:text-[2.5rem]">
        {title}
      </h1>
      <p className="text-ink-soft mt-4 text-[1.0625rem] leading-relaxed">
        {fr(body)}
      </p>

      {isPaid ? (
        <div className="mt-8 flex flex-col items-stretch gap-3">
          {isOwner ? (
            <Button asChild size="lg">
              <Link href={accessDestination(delivery, order.product?.slug)}>
                {delivery === "cle-physique"
                  ? "Voir mes commandes"
                  : "Accéder à mon achat"}
              </Link>
            </Button>
          ) : (
            <>
              <p className="text-ink-soft text-sm leading-relaxed">
                Rien dans votre boîte email ? Regardez dans les courriers
                indésirables, ou renvoyez le lien.
              </p>
              <ActionForm
                action={resendOrderLink}
                fields={{ order: order.id }}
                label="Renvoyer le lien d'accès"
                pendingLabel="Envoi en cours…"
                variant="outline"
                size="lg"
                className="flex flex-col items-stretch"
              />
            </>
          )}
        </div>
      ) : closed ? (
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/boutique">Voir la boutique</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-stretch gap-3">
          <Button asChild size="lg" variant="outline">
            <Link href={`/commande/retour?order=${order.id}`}>Actualiser</Link>
          </Button>
          {pendingOnline ? (
            <ActionForm
              action={resumePayment}
              fields={{ order: order.id }}
              label="Reprendre mon paiement"
              pendingLabel="Ouverture du paiement…"
              size="lg"
              className="flex flex-col items-stretch"
            />
          ) : null}
        </div>
      )}

      {!isPaid && !closed ? (
        <p className="text-ink-soft mt-8 text-sm leading-relaxed">
          Toujours rien après quelques minutes ?{" "}
          <a
            href={whatsappLink(
              `Bonjour, j'ai payé pour « ${productName} » mais mon accès n'est pas encore actif. Référence : ${order.id}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-text inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
          >
            <IconWhatsapp size={16} />
            Écrivez-nous sur WhatsApp
          </a>
          , nous vérifions tout de suite.
        </p>
      ) : null}

      {isPaid && !isOwner ? (
        <p className="text-ink-faint mt-8 text-xs leading-relaxed">
          Ce lien d&apos;accès est personnel. Plus tard, votre adresse email
          suffit pour retrouver vos achats :{" "}
          <Link
            href="/commande/suivi"
            className="text-brand-text underline underline-offset-4"
          >
            Retrouver ma commande
          </Link>
          .
        </p>
      ) : null}
    </Container>
  );
}
