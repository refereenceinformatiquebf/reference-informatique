import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  DeliveryStatus,
  PaymentProvider,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/client";
import { getProduct } from "@/lib/catalog/live";
import { runAfterResponse } from "@/lib/after-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSaspaySession } from "@/lib/payments/saspay";
import {
  sendDeliveryUpdate,
  sendLicenceStockAlert,
  sendOrderAlert,
  sendPaymentConfirmation,
  sendRefundNotice,
} from "@/lib/email/send";
import {
  claimFromLocalStock,
  claimLiveFallback,
  checkLowStock,
} from "@/lib/licences/stock";
import { audit } from "@/lib/admin/audit";
import { trackingUrlFor } from "@/lib/checkout/access";

/* ----------------------------- Historique ----------------------------- */

type EventClient = Pick<typeof prisma, "orderEvent">;

/**
 * Ajoute une ligne à l'historique d'une commande.
 * Hors transaction, ne lève jamais : un historique manquant ne doit pas
 * empêcher l'action. Dans une transaction, l'erreur remonte : en avaler une
 * laisserait la transaction dans un état invalide.
 */
export async function addOrderEvent(
  orderId: string,
  type: string,
  message: string,
  actorLabel?: string | null,
  client: EventClient = prisma,
) {
  const data = { orderId, type, message, actorLabel: actorLabel ?? null };
  if (client !== prisma) {
    await client.orderEvent.create({ data });
    return;
  }
  try {
    await prisma.orderEvent.create({ data });
  } catch (error) {
    console.error("[orders] événement non enregistré :", error);
  }
}

/* ------------------------------ Courriel client ------------------------------ */

/** Email du client : copie dans le profil, sinon l'authentification. */
export async function getClientEmail(profile: {
  id: string;
  email: string | null;
}): Promise<string | null> {
  if (profile.email) return profile.email;
  try {
    const { data } = await createAdminClient().auth.admin.getUserById(
      profile.id,
    );
    return data.user?.email ?? null;
  } catch (error) {
    console.error("[orders] email du client introuvable :", error);
    return null;
  }
}

/* ----------------------------- Paiement confirmé ----------------------------- */

type MarkOrderPaidParams = {
  orderId: string;
  provider: PaymentProvider;
  /** Identifiant unique de la transaction chez le fournisseur (id SasPay),
   * ou une référence stable pour une confirmation manuelle. */
  providerRef: string;
  amount: number;
  rawStatus: string;
  rawPayload?: unknown;
  /** Qui a déclenché la confirmation (nom affiché dans l'historique). */
  actorLabel?: string | null;
  /** Texte de l'historique (par défaut : selon le fournisseur). */
  eventMessage?: string;
};

type PaidOutcome =
  | { kind: "not_found" }
  | { kind: "done"; justPaid: boolean; alreadyProcessed: boolean };

/**
 * Point d'entrée UNIQUE pour marquer une commande payée — appelé par la
 * synchronisation SasPay (webhook, page de retour) et par la validation
 * manuelle de l'administration, pour que tous les chemins déclenchent
 * rigoureusement les mêmes effets.
 *
 * Atomique : le paiement, le passage à « payé », l'accès et l'historique
 * s'enregistrent dans UNE transaction. Si le processus s'arrête en cours de
 * route, rien n'est à moitié fait ; et si un paiement existait déjà sans que
 * la commande soit passée à « payé » (ancien état incohérent), un rejeu
 * termine le travail au lieu de répondre « déjà traité ».
 *
 * Idempotent : la contrainte unique (provider, providerRef) empêche un
 * webhook rejoué ou deux appels simultanés de créer deux paiements, et les
 * emails ne partent qu'une fois (au passage effectif à « payé »).
 */
export async function markOrderPaid(params: MarkOrderPaidParams) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: { id: true, product: { select: { slug: true } } },
  });
  if (!order) {
    return { ok: false as const, reason: "order_not_found" as const };
  }

  // Livraison physique / licence EDN ? Décidé avant la transaction (lecture du catalogue).
  const catalogProduct = order.product
    ? await getProduct(order.product.slug)
    : undefined;
  const needsDelivery = catalogProduct?.delivery === "cle-physique";
  const isLicenceProduct = catalogProduct?.delivery === "licence-edn";

  const run = (): Promise<PaidOutcome> =>
    prisma.$transaction(async (tx): Promise<PaidOutcome> => {
      const current = await tx.order.findUnique({
        where: { id: params.orderId },
      });
      if (!current) return { kind: "not_found" };

      const existingPayment = await tx.payment.findUnique({
        where: {
          provider_providerRef: {
            provider: params.provider,
            providerRef: params.providerRef,
          },
        },
      });

      if (!existingPayment) {
        await tx.payment.create({
          data: {
            orderId: current.id,
            provider: params.provider,
            providerRef: params.providerRef,
            amount: params.amount,
            status: params.rawStatus,
            rawPayload:
              params.rawPayload === undefined
                ? undefined
                : (params.rawPayload as Prisma.InputJsonValue),
          },
        });
      }

      let justPaid = false;
      if (current.status !== "PAYE" && current.status !== "REMBOURSE") {
        await tx.order.update({
          where: { id: current.id },
          data: {
            status: "PAYE",
            paidAt: new Date(),
            ...(needsDelivery && !current.deliveryStatus
              ? { deliveryStatus: "A_PREPARER" }
              : {}),
          },
        });
        // Une clé USB se LIVRE : l'acheteur n'a rien à activer sur le site. Pas
        // d'accès créé ; s'il se connecte plus tard, il retrouve sa commande
        // (« Mes commandes ») et nos recommandations.
        if (current.productId && !needsDelivery) {
          // Stock local d'abord (même transaction, zéro appel réseau) : si vide, l'Access est
          // quand même créé SANS licence — ensureLicenceFulfilled() (appelée après la
          // transaction, voir notifyPaymentConfirmed) tente alors le repli direct auprès d'EDN.
          const stock = isLicenceProduct
            ? await claimFromLocalStock(current.id, tx)
            : null;
          await tx.access.upsert({
            where: {
              profileId_productId: {
                profileId: current.profileId,
                productId: current.productId,
              },
            },
            update: {},
            create: {
              profileId: current.profileId,
              productId: current.productId,
              ...(stock
                ? {
                    licenseKey: stock.licenseKey,
                    installerUrl: stock.installerUrl,
                  }
                : {}),
            },
          });
        }
        await addOrderEvent(
          current.id,
          "PAID",
          params.eventMessage ??
            (params.provider === "SASPAY"
              ? "Paiement confirmé par SasPay."
              : "Paiement confirmé."),
          params.actorLabel,
          tx,
        );
        justPaid = true;
      } else if (current.status === "REMBOURSE" && !existingPayment) {
        await addOrderEvent(
          current.id,
          "PAYMENT_AFTER_REFUND",
          "Un paiement est arrivé sur une commande déjà remboursée : à vérifier.",
          params.actorLabel,
          tx,
        );
      }

      return {
        kind: "done",
        justPaid,
        alreadyProcessed: Boolean(existingPayment),
      };
    });

  let outcome: PaidOutcome;
  try {
    outcome = await run();
  } catch (error) {
    // Deux appels simultanés : l'autre a créé le paiement juste avant nous.
    // Une seconde passe trouve le paiement et termine proprement.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      outcome = await run();
    } else {
      throw error;
    }
  }

  if (outcome.kind === "not_found") {
    return { ok: false as const, reason: "order_not_found" as const };
  }

  if (outcome.justPaid) {
    // Les emails sont HORS transaction et APRÈS la réponse : un échec d'envoi
    // n'annule rien et personne n'attend l'envoi.
    runAfterResponse(() => notifyPaymentConfirmed(params.orderId));
  }

  const updated = await prisma.order.findUnique({
    where: { id: params.orderId },
  });
  return {
    ok: true as const,
    alreadyProcessed: outcome.alreadyProcessed,
    justPaid: outcome.justPaid,
    order: updated!,
  };
}

/** Détails communs aux emails d'une commande. */
async function loadOrderForEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, profile: true },
  });
  if (!order || !order.product) return null;
  const catalogProduct = await getProduct(order.product.slug);
  const email = await getClientEmail(order.profile);
  const shipping =
    order.shippingCity && order.shippingAddress
      ? {
          city: order.shippingCity,
          address: order.shippingAddress,
          phone: order.shippingPhone ?? order.profile.phone ?? "",
        }
      : null;
  return { order, product: order.product, catalogProduct, email, shipping };
}

/**
 * Pour un produit "licence-edn" : si le stock local n'a rien pu fournir pendant la transaction
 * de paiement (Access créé sans licence), tente le repli direct auprès d'EDN — jamais pendant la
 * transaction (appel réseau). Si le stock A fourni la licence, vérifie seulement le seuil
 * d'alerte. Retourne la licence finale (pour l'inclure dans l'e-mail), ou null si ce n'est pas un
 * produit à licence.
 */
async function ensureLicenceFulfilled(
  order: { id: string; profileId: string; productId: string | null },
  catalogProduct: { delivery: string } | undefined,
  clientName: string,
  clientEmail: string | null,
): Promise<{ licenseKey: string; installerUrl: string } | null> {
  if (catalogProduct?.delivery !== "licence-edn" || !order.productId)
    return null;

  const access = await prisma.access.findUnique({
    where: {
      profileId_productId: {
        profileId: order.profileId,
        productId: order.productId,
      },
    },
  });
  if (!access) return null;

  if (access.licenseKey && access.installerUrl) {
    const milestone = await checkLowStock().catch(() => null);
    if (milestone) {
      const available = await prisma.licenseStock.count({
        where: { assignedOrderId: null },
      });
      await sendLicenceStockAlert({ milestone, available }).catch((err) =>
        console.error("[licences] alerte stock non envoyée :", err),
      );
    }
    return { licenseKey: access.licenseKey, installerUrl: access.installerUrl };
  }

  if (!clientEmail) return null; // pas de contact possible, reste en attente

  const result = await claimLiveFallback(clientName, clientEmail, order.id);
  if ("error" in result) {
    await audit(
      null,
      result.quotaReached ? "licence.quota_reached" : "licence.claim_failed",
      "order",
      order.id,
      result.error,
    );
    return null;
  }

  await prisma.access.update({
    where: { id: access.id },
    data: { licenseKey: result.licenseKey, installerUrl: result.installerUrl },
  });
  return result;
}

async function notifyPaymentConfirmed(orderId: string) {
  const data = await loadOrderForEmail(orderId);
  if (!data) return;
  const { order, product, catalogProduct, email, shipping } = data;
  const delivery = catalogProduct?.delivery ?? "numerique";

  const licence = await ensureLicenceFulfilled(
    order,
    catalogProduct,
    order.profile.name,
    email,
  );
  const trackUrl = await trackingUrlFor(order.id);

  const tasks: Promise<unknown>[] = [
    sendOrderAlert({
      event: "paid",
      orderId: order.id,
      clientName: order.profile.name,
      clientPhone: order.profile.phone ?? shipping?.phone ?? "",
      clientCountry: order.profile.country,
      clientEmail: email ?? undefined,
      productName: product.name,
      amount: order.amount,
      quantity: order.quantity,
      channel: order.channel,
      shipping,
    }),
  ];
  if (email) {
    tasks.push(
      sendPaymentConfirmation({
        to: email,
        clientName: order.profile.name,
        productName: product.name,
        amount: order.amount,
        quantity: order.quantity,
        delivery,
        orderId: order.id,
        // Lien personnel : ouvre l'achat sans mot de passe (et sans compte
        // préalable). La page de suivi redirige ensuite vers la bonne rubrique.
        ctaUrl: trackUrl,
        licenceKey: licence?.licenseKey,
        installerUrl: licence?.installerUrl,
        paidAt: order.paidAt,
      }),
    );
  }
  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[notifyPaymentConfirmed]", result.reason);
    }
  }
}

/* ------------------------- Actions de l'administration ------------------------- */

export type OrderActionResult =
  { ok: true; message: string } | { ok: false; error: string };

/** Annule une commande NON payée. Une commande payée se rembourse, elle ne
 * s'annule pas : sinon l'accès resterait actif sans trace. */
export async function cancelUnpaidOrder(params: {
  orderId: string;
  actorLabel: string;
  reason?: string;
}): Promise<OrderActionResult> {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
  });
  if (!order) return { ok: false, error: "Commande introuvable." };
  if (order.status === "PAYE") {
    return {
      ok: false,
      error:
        "Cette commande est déjà payée : utilisez « Rembourser » plutôt qu'« Annuler ».",
    };
  }
  if (order.status === "ANNULE" || order.status === "REMBOURSE") {
    return { ok: false, error: "Cette commande est déjà clôturée." };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "ANNULE" },
  });
  // La page de paiement ouverte ne doit plus rester utilisable.
  if (order.providerSessionId)
    await cancelSaspaySession(order.providerSessionId);
  await addOrderEvent(
    order.id,
    "CANCELLED",
    params.reason ? `Commande annulée : ${params.reason}` : "Commande annulée.",
    params.actorLabel,
  );
  return { ok: true, message: "Commande annulée." };
}

/** Rembourse une commande payée : coupe l'accès et prévient le client.
 * Le remboursement de l'argent lui-même se fait chez le fournisseur ou en
 * Mobile Money : ce site en garde la trace, il ne rend pas l'argent. */
export async function refundPaidOrder(params: {
  orderId: string;
  actorLabel: string;
  reason: string;
  notifyClient: boolean;
}): Promise<OrderActionResult> {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { product: true, profile: true },
  });
  if (!order) return { ok: false, error: "Commande introuvable." };
  if (order.status !== "PAYE") {
    return {
      ok: false,
      error: "Seule une commande payée peut être remboursée.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "REMBOURSE", refundedAt: new Date() },
    });
    if (order.productId) {
      // L'accès reste si le client a payé ce même produit par une autre commande.
      const another = await tx.order.count({
        where: {
          profileId: order.profileId,
          productId: order.productId,
          status: "PAYE",
          id: { not: order.id },
        },
      });
      if (another === 0) {
        await tx.access.deleteMany({
          where: { profileId: order.profileId, productId: order.productId },
        });
      }
    }
    await addOrderEvent(
      order.id,
      "REFUNDED",
      `Commande remboursée : ${params.reason}`,
      params.actorLabel,
      tx,
    );
  });

  if (params.notifyClient && order.product) {
    const product = order.product;
    runAfterResponse(async () => {
      const email = await getClientEmail(order.profile);
      if (!email) return;
      await sendRefundNotice({
        to: email,
        clientName: order.profile.name,
        productName: product.name,
        amount: order.amount,
        orderId: order.id,
        licence: (await getProduct(product.slug))?.delivery === "licence-edn",
        paidAt: order.paidAt,
      });
    });
  }
  return {
    ok: true,
    message: "Commande marquée comme remboursée, accès retiré.",
  };
}

/** Change l'avancement de la livraison d'une clé et prévient le client. */
export async function updateDeliveryStatus(params: {
  orderId: string;
  status: DeliveryStatus;
  actorLabel: string;
  notifyClient: boolean;
}): Promise<OrderActionResult> {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { product: true, profile: true },
  });
  if (!order) return { ok: false, error: "Commande introuvable." };
  if (order.status !== "PAYE") {
    return {
      ok: false,
      error: "La livraison ne se suit que pour une commande payée.",
    };
  }
  if (!order.deliveryStatus && !order.shippingAddress) {
    return {
      ok: false,
      error: "Cette commande n'a pas de livraison physique.",
    };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      deliveryStatus: params.status,
      deliveredAt: params.status === "LIVREE" ? new Date() : null,
    },
  });
  const label = {
    A_PREPARER: "à préparer",
    EN_LIVRAISON: "en livraison",
    LIVREE: "livrée",
  }[params.status];
  await addOrderEvent(
    order.id,
    "DELIVERY",
    `Livraison : ${label}.`,
    params.actorLabel,
  );

  if (params.notifyClient && params.status !== "A_PREPARER" && order.product) {
    const product = order.product;
    const status = params.status;
    runAfterResponse(async () => {
      const email = await getClientEmail(order.profile);
      if (!email) return;
      await sendDeliveryUpdate({
        to: email,
        clientName: order.profile.name,
        productName: product.name,
        status,
        orderId: order.id,
      });
    });
  }
  return { ok: true, message: `Livraison : ${label}.` };
}
