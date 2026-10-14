import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { getProduct } from "@/lib/catalog/live";
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

const PAID_MESSAGE = {
  "cle-physique":
    "Votre accès à la plateforme est activé dès maintenant. Votre clé USB vous est livrée gratuitement sous 24 à 48 h : nous vous contactons pour convenir de la remise.",
  numerique:
    "Votre accès est activé. Vous le retrouvez dans votre espace client, à tout moment.",
  manuel:
    "Votre paiement est confirmé. Notre équipe vous contacte sur WhatsApp pour vous remettre votre accès.",
  "licence-edn":
    "Votre paiement est confirmé. Votre licence d'activation vous attend dans votre espace client.",
} as const;

export default async function CommandeRetourPage({
  searchParams,
}: PageProps<"/commande/retour">) {
  const profile = await requireProfile();
  const { order: orderId } = await searchParams;

  // Le statut affiché vient TOUJOURS d'une requête sur l'Order réel, jamais
  // d'un paramètre d'URL — un paramètre `?status=paye` serait trivialement
  // falsifiable en le tapant à la main dans la barre d'adresse.
  let order =
    typeof orderId === "string"
      ? await prisma.order.findFirst({
          where: { id: orderId, profileId: profile.id },
          include: { product: true },
        })
      : null;

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
    if (nowPaid) {
      order = await prisma.order.findFirst({
        where: { id: order.id, profileId: profile.id },
        include: { product: true },
      });
    }
  }

  if (!order) {
    return (
      <Container className="max-w-md py-24 text-center">
        <IconChip name="recherche" size={56} className="mx-auto" />
        <h1 className="text-ink mt-5 text-[1.75rem] leading-tight">
          Commande introuvable
        </h1>
        <p className="text-ink-soft mt-3 text-[0.9375rem] leading-relaxed">
          Vérifiez le lien, ou retrouvez vos commandes dans votre espace.
        </p>
        <Button asChild className="mt-6">
          <Link href="/espace-client">Mon espace</Link>
        </Button>
      </Container>
    );
  }

  const isPaid = order.status === "PAYE";
  const delivery = order.product
    ? (await getProduct(order.product.slug))?.delivery
    : undefined;
  const productName = order.product?.name ?? "votre commande";

  return (
    <Container className="max-w-lg py-20 text-center sm:py-28">
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
        {isPaid
          ? "Paiement confirmé, merci !"
          : "Paiement en cours de vérification"}
      </h1>
      <p className="text-ink-soft mt-4 text-[1.0625rem] leading-relaxed">
        {fr(
          isPaid
            ? `${productName} : ${PAID_MESSAGE[delivery ?? "numerique"]}`
            : "Si vous venez de payer, la confirmation peut prendre quelques instants. Actualisez cette page dans une minute : votre accès s'activera tout seul.",
        )}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/espace-client">
            {isPaid ? "Accéder à mon espace" : "Voir mes commandes"}
          </Link>
        </Button>
        {!isPaid ? (
          <Button asChild size="lg" variant="outline">
            <Link href={`/commande/retour?order=${order.id}`}>Actualiser</Link>
          </Button>
        ) : null}
      </div>

      {!isPaid ? (
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
    </Container>
  );
}
