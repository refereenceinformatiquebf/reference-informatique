import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { IconFormation } from "@/components/icons";

export const metadata: Metadata = { title: "Votre commande" };
export const dynamic = "force-dynamic";

export default async function CommandeRetourPage({
  searchParams,
}: PageProps<"/commande/retour">) {
  const profile = await requireProfile();
  const { order: orderId } = await searchParams;

  // Le statut affiché vient TOUJOURS d'une requête sur l'Order réel, jamais
  // d'un paramètre d'URL — un paramètre `?status=paye` serait trivialement
  // falsifiable en le tapant à la main dans la barre d'adresse.
  const order =
    typeof orderId === "string"
      ? await prisma.order.findFirst({
          where: { id: orderId, profileId: profile.id },
          include: { product: true },
        })
      : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-ink text-lg font-bold">Commande introuvable</h1>
        <p className="text-ink-soft mt-2 text-sm">
          Vérifiez le lien ou consultez vos commandes dans votre espace.
        </p>
        <Button asChild className="mt-6">
          <Link href="/espace-client">Mon espace</Link>
        </Button>
      </div>
    );
  }

  const isPaid = order.status === "PAYE";

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
          isPaid ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
        }`}
      >
        <IconFormation size={26} />
      </span>
      <h1 className="text-ink mt-4 text-lg font-bold">
        {isPaid ? "Paiement confirmé !" : "Paiement en cours de traitement"}
      </h1>
      <p className="text-ink-soft mt-2 text-sm leading-relaxed">
        {isPaid
          ? `Votre accès à « ${order.product?.name} » est activé.`
          : "Si vous venez de payer, la confirmation peut prendre quelques instants. Actualisez votre espace client dans une minute."}
      </p>
      <Button asChild className="mt-6">
        <Link href="/espace-client">
          {isPaid ? "Accéder à ma formation" : "Voir mes commandes"}
        </Link>
      </Button>
    </div>
  );
}
