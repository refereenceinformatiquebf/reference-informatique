"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { getCurrentProfile } from "@/lib/auth/dal";
import { isProductAvailable, type Product } from "@/lib/catalog";
import { getProduct } from "@/lib/catalog/live";
import { ensureProductRow } from "@/lib/catalog/db-sync";
import { getVisitorCountry } from "@/lib/geo";
import {
  MAX_KEY_QUANTITY,
  buyerSchema,
  shippingSchema,
  type BuyerInput,
  type ShippingInput,
} from "@/lib/validations/order";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/honeypot";
import { whatsappLink } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { addOrderEvent } from "@/lib/orders";
import { runAfterResponse } from "@/lib/after-response";
import { resolveBuyer } from "@/lib/checkout/buyer";
import { ensureAccessToken, newAccessToken } from "@/lib/checkout/access";
import { CheckoutError, openOnlinePayment } from "@/lib/checkout/pay";
import { sendLinksForOrder } from "@/lib/checkout/links";
import { phoneRequired } from "@/lib/checkout/rules";

export type OrderFormState =
  | {
      error?: string;
      fieldErrors?: Partial<
        Record<keyof ShippingInput | keyof BuyerInput | "quantity", string[]>
      >;
    }
  | undefined;

type Buyer = Awaited<ReturnType<typeof resolveBuyer>>;

type OrderContext = {
  profile: Buyer["profile"];
  catalogProduct: Product;
  productRow: NonNullable<Awaited<ReturnType<typeof ensureProductRow>>>;
  shipping: ShippingInput | null;
  quantity: number;
  visitorCountry: Awaited<ReturnType<typeof getVisitorCountry>>;
};

const UNAVAILABLE =
  "Ce produit n'est pas disponible. Retournez à la boutique pour en choisir un autre.";

/** Page qui suit la commande ; elle se rafraîchit seule tant que le paiement n'est pas confirmé. */
function followUpUrl(orderId: string) {
  return `/commande/retour?order=${orderId}`;
}

/**
 * Prépare une commande : vérifie le produit, le pays du visiteur, les
 * coordonnées de l'acheteur, la livraison, la quantité. Toute la logique de
 * refus est ici, pour que le paiement en ligne et la commande WhatsApp
 * appliquent EXACTEMENT les mêmes règles.
 *
 * Aucun compte n'est exigé : un visiteur non connecté commande avec son nom,
 * son email et son téléphone (voir lib/checkout/buyer.ts).
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
    return { ok: false, state: { error: UNAVAILABLE } };
  }

  // Connecté : son compte fait foi (son email n'est pas modifiable ici).
  // Sinon : l'email saisi.
  const signedIn = await getCurrentProfile();
  const signedInEmail = signedIn?.email ?? null;
  const parsedBuyer = buyerSchema.safeParse({
    name: formData.get("name") ?? signedIn?.name,
    email: signedInEmail ?? formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsedBuyer.success) {
    return {
      ok: false,
      state: { fieldErrors: parsedBuyer.error.flatten().fieldErrors },
    };
  }
  const buyer = parsedBuyer.data;
  if (phoneRequired(catalogProduct.delivery) && buyer.phone === "") {
    return {
      ok: false,
      state: {
        fieldErrors: {
          phone: [
            "Indiquez un numéro joignable (WhatsApp si possible) : notre équipe vous contacte pour la remise.",
          ],
        },
      },
    };
  }

  let shipping: ShippingInput | null = null;
  let quantity = 1;
  if (catalogProduct.delivery === "cle-physique") {
    const parsed = shippingSchema.safeParse({
      city: formData.get("city"),
      address: formData.get("address"),
      phone: buyer.phone,
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

  // Une même adresse ne peut pas déclencher une avalanche de commandes (donc
  // d'emails) vers la boîte de quelqu'un d'autre.
  await enforceRateLimit("order-buyer", 10, 60 * 60, buyer.email);

  const productRow = await ensureProductRow(catalogProduct.slug);
  if (!productRow) {
    return { ok: false, state: { error: "Ce produit n'est plus disponible." } };
  }

  const { profile } = await resolveBuyer(buyer, signedIn);

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
    await ensureAccessToken(pending.id);
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
      // Lien personnel de suivi : prêt dès la création (envoyé par email, jamais affiché).
      accessToken: newAccessToken(),
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
  // Champ piège rempli = robot : on fait semblant, sans rien enregistrer.
  if (isHoneypotFilled(formData)) redirect("/boutique");

  let prepared: Awaited<ReturnType<typeof prepareOrder>>;
  try {
    await enforceRateLimit("order", 12, 60);
    prepared = await prepareOrder(formData);
  } catch (error) {
    if (error instanceof RateLimitError) return { error: error.message };
    console.error("[submitOrder] préparation impossible", error);
    return {
      error:
        "Nous n'avons pas pu enregistrer votre commande. Réessayez dans un instant, ou commandez par WhatsApp : nous vous aiderons tout de suite.",
    };
  }
  if (!prepared.ok) return prepared.state;

  const intent = formData.get("intent") === "whatsapp" ? "whatsapp" : "online";

  // Variable LOCALE à la requête : jamais d'état partagé entre deux clients.
  let target: string;
  try {
    target =
      intent === "whatsapp"
        ? await startWhatsappOrder(prepared.context)
        : await startOnlineCheckout(prepared.context);
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.message };
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
async function startOnlineCheckout(context: OrderContext): Promise<string> {
  const { profile, catalogProduct, visitorCountry } = context;

  const { order } = await getOrCreatePendingOrder(context, "BOUTIQUE");

  // Déjà payée (produit numérique commandé une seconde fois, ou paiement
  // précédent confirmé en retard) : on renvoie le lien d'accès à l'adresse du
  // client plutôt que de lui faire payer deux fois.
  const payment = await openOnlinePayment({
    order,
    profile,
    productName: catalogProduct.name,
    visitorCountry,
  });
  if (payment.paid) {
    runAfterResponse(() => sendLinksForOrder(order.id));
    return `${followUpUrl(order.id)}&deja=1`;
  }

  // Aucun e-mail à la création : le client et l'équipe ne sont écrits qu'à la
  // confirmation du paiement (notifyPaymentConfirmed) ; un client qui ne paie
  // pas reçoit une relance (lib/checkout/reminders.ts).
  return payment.checkoutUrl;
}

/** Commande par WhatsApp : enregistre la commande puis ouvre la conversation. */
async function startWhatsappOrder(context: OrderContext): Promise<string> {
  const { catalogProduct, shipping, profile } = context;

  const { order } = await getOrCreatePendingOrder(context, "WHATSAPP");

  if (order.status === "PAYE") {
    runAfterResponse(() => sendLinksForOrder(order.id));
    return `${followUpUrl(order.id)}&deja=1`;
  }

  const lines = [
    "Bonjour, je souhaite commander :",
    `${order.quantity > 1 ? `${order.quantity} × ` : ""}${catalogProduct.name} — ${formatPrice(order.amount)}`,
    `Mon nom : ${profile.name}`,
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
