import "server-only";
import { prisma } from "@/lib/prisma/client";
import type { Order, Profile } from "@/lib/generated/prisma/client";
import { isHomeCountry } from "@/lib/geo";
import type { CountryCode } from "@/lib/catalog/types";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import {
  cancelSaspaySession,
  createSaspayCheckoutSession,
} from "@/lib/payments/saspay";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { addOrderEvent, getClientEmail } from "@/lib/orders";

/** Erreur dont le message peut être montré tel quel au client. */
export class CheckoutError extends Error {}

export type OnlinePayment =
  { paid: true } | { paid: false; checkoutUrl: string };

/**
 * Ouvre (ou rouvre) la page de paiement SasPay d'une commande. Utilisée par le
 * formulaire de commande ET par « Reprendre mon paiement » (lien d'un email) :
 * mêmes garde-fous aux deux endroits.
 *
 * Si la session précédente a en réalité été payée (webhook en retard), on le
 * constate ici plutôt que d'ouvrir une seconde page de paiement et de risquer
 * un double débit.
 */
export async function openOnlinePayment(params: {
  order: Order;
  profile: Pick<Profile, "id" | "email" | "name" | "phone">;
  productName: string;
  visitorCountry: CountryCode | null;
}): Promise<OnlinePayment> {
  const { order, profile, productName, visitorCountry } = params;

  if (order.status === "PAYE") return { paid: true };

  if (order.providerSessionId) {
    const alreadyPaid = await syncSaspayOrder(order).catch((error) => {
      console.error("[openOnlinePayment] revérification impossible", error);
      return false;
    });
    if (alreadyPaid) return { paid: true };
  }

  const email = await getClientEmail(profile);
  if (!email) {
    throw new CheckoutError(
      "Nous n'avons pas d'adresse email pour cette commande : impossible de lancer le paiement en ligne. Commandez par WhatsApp, nous vous aiderons.",
    );
  }

  const label =
    order.quantity > 1 ? `${order.quantity} × ${productName}` : productName;
  const session = await createSaspayCheckoutSession({
    description: `${label} — ${SITE.name}`,
    amount: order.amount,
    orderId: order.id,
    returnUrl: `${SITE.url}/commande/retour?order=${order.id}`,
    // Burkina Faso : présélectionné sur la page de paiement. Ailleurs, on
    // laisse le client choisir son pays plutôt que d'en deviner un.
    country: isHomeCountry(visitorCountry) ? "BF" : undefined,
    customer: {
      email,
      name: profile.name,
      phone: order.shippingPhone ?? profile.phone ?? undefined,
    },
  });

  // La session est enregistrée AVANT la redirection : c'est elle qui permet
  // de relier le paiement à cette commande quand SasPay nous notifie.
  const previousSessionId = order.providerSessionId;
  await prisma.order.update({
    where: { id: order.id },
    data: { providerSessionId: session.id },
  });
  await addOrderEvent(
    order.id,
    "SESSION_OPENED",
    `Page de paiement SasPay ouverte (${formatPrice(order.amount)}).`,
    email,
  );

  // L'ancienne page de paiement ne doit plus rester utilisable.
  if (previousSessionId) {
    await cancelSaspaySession(previousSessionId);
  }

  return { paid: false, checkoutUrl: session.checkoutUrl };
}
