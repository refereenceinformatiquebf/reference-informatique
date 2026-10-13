"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { isProductAvailable, type Product } from "@/lib/catalog";
import { getProduct } from "@/lib/catalog/live";
import { ensureProductRow } from "@/lib/catalog/db-sync";
import { getVisitorCountry, isHomeCountry } from "@/lib/geo";
import {
  MAX_KEY_QUANTITY,
  shippingSchema,
  type ShippingInput,
} from "@/lib/validations/order";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { SITE, whatsappLink } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import {
  cancelSaspaySession,
  createSaspayCheckoutSession,
} from "@/lib/payments/saspay";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import {
  addOrderEvent,
  getClientEmail,
  notifyOrderCreated,
} from "@/lib/orders";

export type OrderFormState =
  | {
      error?: string;
      fieldErrors?: Partial<Record<keyof ShippingInput | "quantity", string[]>>;
    }
  | undefined;

type OrderContext = {
  profile: Awaited<ReturnType<typeof requireProfile>>;
  catalogProduct: Product;
  productRow: NonNullable<Awaited<ReturnType<typeof ensureProductRow>>>;
  shipping: ShippingInput | null;
  quantity: number;
  visitorCountry: Awaited<ReturnType<typeof getVisitorCountry>>;
};

class OrderError extends Error {}

/**
 * Prépare une commande : vérifie le produit, le pays du visiteur, la
 * livraison, la quantité. Toute la logique de refus est ici, pour que le
 * paiement en ligne et la commande WhatsApp appliquent EXACTEMENT les mêmes
 * règles.
 *
 * Règle d'accès par pays : un produit réservé à un pays (les clés de
 * formations) ne peut pas être commandé depuis un autre pays, même en
 * forgeant la requête — le contrôle est refait ici, côté serveur, et ne
 * dépend pas de ce que la page a affiché.
 */
async function prepareOrder(
  formData: FormData,
): Promise<
  | { ok: true; context: OrderContext }
  | { ok: false; state: NonNullable<OrderFormState> }
> {
  const slug = String(formData.get("productSlug") ?? "");
  const catalogProduct = await getProduct(slug);
  const visitorCountry = await getVisitorCountry();

  // Même message pour « inconnu » et « réservé à un autre pays » : on ne
  // révèle pas l'existence d'un produit invisible pour ce visiteur.
  if (!catalogProduct || !isProductAvailable(catalogProduct, visitorCountry)) {
    return {
      ok: false,
      state: {
        error:
          "Ce produit n'est pas disponible. Retournez à la boutique pour en choisir un autre.",
      },
    };
  }

  let shipping: ShippingInput | null = null;
  let quantity = 1;
  if (catalogProduct.delivery === "cle-physique") {
    const parsed = shippingSchema.safeParse({
      city: formData.get("city"),
      address: formData.get("address"),
      phone: formData.get("phone"),
    });
    if (!parsed.success) {
      return {
        ok: false,
        state: { fieldErrors: parsed.error.flatten().fieldErrors },
      };
    }
    shipping = parsed.data;

    // Nombre de clés : borné côté serveur, jamais cru tel quel.
    const rawQuantity = Number(formData.get("quantity") ?? 1);
    if (
      !Number.isInteger(rawQuantity) ||
      rawQuantity < 1 ||
      rawQuantity > MAX_KEY_QUANTITY
    ) {
      return {
        ok: false,
        state: {
          fieldErrors: {
            quantity: [`Choisissez entre 1 et ${MAX_KEY_QUANTITY} clés.`],
          },
        },
      };
    }
    quantity = rawQuantity;
  }

  const profile = await requireProfile();
  const productRow = await ensureProductRow(catalogProduct.slug);
  if (!productRow) {
    return { ok: false, state: { error: "Ce produit n'est plus disponible." } };
  }

  return {
    ok: true,
    context: {
      profile,
      catalogProduct,
      productRow,
      shipping,
      quantity,
      visitorCountry,
    },
  };
}

/**
 * Récupère (ou crée) la commande en attente pour ce produit.
 *  - une commande en attente est remise au prix ACTUEL du catalogue (un prix
 *    modifié ne laisse jamais une ancienne commande à l'ancien tarif) ;
 *  - un produit numérique déjà payé ne se commande pas deux fois ;
 *  - une clé USB peut être recommandée (famille, cadeau) : une nouvelle
 *    commande est alors créée.
 * Le montant est TOUJOURS calculé ici : prix du catalogue × quantité.
 */
async function getOrCreatePendingOrder(
  context: OrderContext,
  channel: "BOUTIQUE" | "WHATSAPP",
) {
  const { profile, catalogProduct, productRow, shipping, quantity } = context;
  const physical = catalogProduct.delivery === "cle-physique";
  const unitPrice = catalogProduct.price;
  const amount = unitPrice * quantity;
  const provider = channel === "BOUTIQUE" ? "SASPAY" : "WHATSAPP_MANUAL";

  const shippingData = shipping
    ? {
        shippingCity: shipping.city,
        shippingAddress: shipping.address,
        shippingPhone: shipping.phone,
      }
    : {};

  const pending = await prisma.order.findFirst({
    where: {
      profileId: profile.id,
      productId: productRow.id,
      status: "EN_ATTENTE",
    },
  });

  if (pending) {
    const updated = await prisma.order.update({
      where: { id: pending.id },
      data: {
        amount,
        unitPrice,
        quantity,
        channel,
        paymentProvider: provider,
        ...shippingData,
      },
    });
    return { order: updated, isNew: false };
  }

  if (!physical) {
    const paid = await prisma.order.findFirst({
      where: {
        profileId: profile.id,
        productId: productRow.id,
        status: "PAYE",
      },
    });
    if (paid) return { order: paid, isNew: false };
  }

  const order = await prisma.order.create({
    data: {
      profileId: profile.id,
      productId: productRow.id,
      amount,
      unitPrice,
      quantity,
      channel,
      paymentProvider: provider,
      status: "EN_ATTENTE",
      ...shippingData,
    },
  });
  await addOrderEvent(
    order.id,
    "CREATED",
    channel === "BOUTIQUE"
      ? "Commande créée (paiement en ligne)."
      : "Commande créée (paiement via WhatsApp).",
    profile.email ?? profile.name,
  );

  return { order, isNew: true };
}

/**
 * Point d'entrée du formulaire de commande. Le bouton cliqué envoie
 * `intent` = « online » (paiement en ligne) ou « whatsapp ».
 */
export async function submitOrder(
  _state: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  try {
    await enforceRateLimit("order", 12, 60);
  } catch (error) {
    if (error instanceof RateLimitError) return { error: error.message };
    throw error;
  }

  const prepared = await prepareOrder(formData);
  if (!prepared.ok) return prepared.state;

  const intent = formData.get("intent") === "whatsapp" ? "whatsapp" : "online";

  // Variable LOCALE à la requête : jamais d'état partagé entre deux clients.
  let target: string;
  try {
    target =
      intent === "whatsapp"
        ? await startWhatsappOrder(prepared.context)
        : await startSaspayCheckout(prepared.context);
  } catch (error) {
    if (error instanceof OrderError) return { error: error.message };
    console.error("[submitOrder]", error);
    return {
      error:
        "Nous n'avons pas pu lancer le paiement. Réessayez dans un instant, ou commandez par WhatsApp : nous vous aiderons tout de suite.",
    };
  }

  // La redirection est faite HORS du try/catch : une redirection Next.js est
  // une exception qu'il ne faut jamais avaler.
  redirect(target);
}

/** Paiement en ligne : ouvre une session SasPay et renvoie son adresse. */
async function startSaspayCheckout(context: OrderContext): Promise<string> {
  const { profile, catalogProduct, visitorCountry } = context;

  const { order, isNew } = await getOrCreatePendingOrder(context, "BOUTIQUE");

  if (order.status === "PAYE") return "/espace-client";

  // Le client relance un paiement : si sa session précédente a en réalité
  // été payée (webhook en retard), on le constate ici plutôt que de lui
  // ouvrir une seconde page de paiement et de risquer un double débit.
  if (order.providerSessionId) {
    const alreadyPaid = await syncSaspayOrder(order).catch((error) => {
      console.error("[startSaspayCheckout] revérification impossible", error);
      return false;
    });
    if (alreadyPaid) return "/espace-client";
  }

  const email = await getClientEmail(profile);
  if (!email) {
    throw new OrderError(
      "Votre compte n'a pas d'adresse email : impossible de lancer le paiement en ligne. Commandez par WhatsApp, nous vous aiderons.",
    );
  }

  if (isNew) {
    await notifyOrderCreated(order.id);
  }

  const label =
    order.quantity > 1
      ? `${order.quantity} × ${catalogProduct.name}`
      : catalogProduct.name;
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

  return session.checkoutUrl;
}

/** Commande par WhatsApp : enregistre la commande puis ouvre la conversation. */
async function startWhatsappOrder(context: OrderContext): Promise<string> {
  const { catalogProduct, shipping } = context;

  const { order, isNew } = await getOrCreatePendingOrder(context, "WHATSAPP");

  if (order.status === "PAYE") return "/espace-client";

  if (isNew) {
    await notifyOrderCreated(order.id);
  }

  const lines = [
    "Bonjour, je souhaite commander :",
    `${order.quantity > 1 ? `${order.quantity} × ` : ""}${catalogProduct.name} — ${formatPrice(order.amount)}`,
    `Référence de commande : ${order.id}`,
  ];
  if (shipping) {
    lines.push(
      `Livraison : ${shipping.city}, ${shipping.address}`,
      `Téléphone : ${shipping.phone}`,
    );
  }

  return whatsappLink(lines.join("\n"));
}
