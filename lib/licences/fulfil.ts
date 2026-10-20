import "server-only";
import { prisma } from "@/lib/prisma/client";
import { getAllProducts, getProduct } from "@/lib/catalog/live";
import { getClientEmail } from "@/lib/orders";
import { trackingUrlFor } from "@/lib/checkout/access";
import { sendLicenceReady } from "@/lib/email/send";
import type { Prisma } from "@/lib/generated/prisma/client";
import { chooseFulfilmentOrder } from "./plan";
import { claimFromLocalStock, claimLiveFallback } from "./stock";

/**
 * Livraison d'une licence à un client qui a PAYÉ mais dont l'accès n'en a pas
 * (stock vide et EDN injoignable au moment du paiement : voir
 * ensureLicenceFulfilled dans lib/orders.ts, qui n'essaie qu'une fois).
 * Ce module rattrape ces clients : à l'ouverture de leur page, ou d'un clic dans
 * l'administration.
 */

export type DeliveredLicence = {
  licenseKey: string;
  installerUrl: string | null;
};

/** Un autre appel a livré la licence entre-temps : on annule le prélèvement, la licence n'est pas perdue. */
class LicenceRace extends Error {}

/**
 * Cœur de la livraison, À APPELER DANS UNE TRANSACTION : le prélèvement dans le
 * stock et l'écriture de la licence sur l'accès réussissent ensemble, ou pas du
 * tout. Deux appels simultanés ne peuvent donc jamais consommer deux licences
 * pour le même client.
 */
export async function fulfilPendingLicenceInTx(
  tx: Prisma.TransactionClient,
  accessId: string,
): Promise<DeliveredLicence | null> {
  const access = await tx.access.findUnique({
    where: { id: accessId },
    select: {
      id: true,
      profileId: true,
      productId: true,
      licenseKey: true,
      installerUrl: true,
    },
  });
  if (!access) return null;
  if (access.licenseKey) {
    return { licenseKey: access.licenseKey, installerUrl: access.installerUrl };
  }

  const orders = await tx.order.findMany({
    where: {
      profileId: access.profileId,
      productId: access.productId,
      status: "PAYE",
    },
    orderBy: { paidAt: "asc" },
    select: {
      id: true,
      licenseStock: { select: { licenseKey: true, installerUrl: true } },
    },
  });
  const plan = chooseFulfilmentOrder(
    orders.map((order) => ({ id: order.id, stock: order.licenseStock })),
  );
  if (plan.kind === "none") return null;

  const licence =
    plan.kind === "reuse"
      ? plan.licence
      : await claimFromLocalStock(plan.orderId, tx);
  if (!licence) return null; // stock vide : rien n'est modifié

  const written = await tx.access.updateMany({
    where: { id: access.id, licenseKey: null },
    data: {
      licenseKey: licence.licenseKey,
      installerUrl: licence.installerUrl,
    },
  });
  if (written.count === 0) throw new LicenceRace();
  return licence;
}

async function fulfilInTransaction(
  accessId: string,
): Promise<DeliveredLicence | null> {
  try {
    return await prisma.$transaction((tx) =>
      fulfilPendingLicenceInTx(tx, accessId),
    );
  } catch (error) {
    if (!(error instanceof LicenceRace)) throw error;
    const access = await prisma.access.findUnique({
      where: { id: accessId },
      select: { licenseKey: true, installerUrl: true },
    });
    return access?.licenseKey
      ? { licenseKey: access.licenseKey, installerUrl: access.installerUrl }
      : null;
  }
}

/**
 * Pour la page « Ma licence » : donne la licence du client, en lui en attribuant
 * une du STOCK LOCAL si besoin (instantané, aucun appel réseau). Ne fait rien
 * pour un produit qui n'est pas livré par licence.
 */
export async function fulfilPendingLicence(
  accessId: string,
): Promise<DeliveredLicence | null> {
  const access = await prisma.access.findUnique({
    where: { id: accessId },
    select: {
      licenseKey: true,
      installerUrl: true,
      product: { select: { slug: true } },
    },
  });
  if (!access) return null;
  if (access.licenseKey) {
    return { licenseKey: access.licenseKey, installerUrl: access.installerUrl };
  }
  const catalogProduct = await getProduct(access.product.slug);
  if (catalogProduct?.delivery !== "licence-edn") return null;
  return fulfilInTransaction(accessId);
}

/* ------------------------------ Administration ------------------------------ */

export type PendingLicence = {
  accessId: string;
  orderId: string;
  productName: string;
  clientName: string;
  clientEmail: string | null;
  paidAt: Date | null;
};

/** Clients qui ont payé un produit livré par licence et n'ont pas encore leur clé. */
export async function listPendingLicences(): Promise<PendingLicence[]> {
  const licenceSlugs = (await getAllProducts())
    .filter((product) => product.delivery === "licence-edn")
    .map((product) => product.slug);
  if (licenceSlugs.length === 0) return [];

  const accesses = await prisma.access.findMany({
    where: { licenseKey: null, product: { slug: { in: licenceSlugs } } },
    include: { profile: true, product: true },
    orderBy: { grantedAt: "asc" },
  });

  const pending: PendingLicence[] = [];
  for (const access of accesses) {
    const paidOrder = await prisma.order.findFirst({
      where: {
        profileId: access.profileId,
        productId: access.productId,
        status: "PAYE",
      },
      orderBy: { paidAt: "asc" },
      select: { id: true, paidAt: true },
    });
    if (!paidOrder) continue; // accès accordé à la main : rien à livrer automatiquement
    pending.push({
      accessId: access.id,
      orderId: paidOrder.id,
      productName: access.product.name,
      clientName: access.profile.name,
      clientEmail: await getClientEmail(access.profile),
      paidAt: paidOrder.paidAt,
    });
  }
  return pending;
}

export type DeliverySummary = {
  delivered: number;
  stillWaiting: number;
  failed: number;
};

/**
 * Livre leur licence à tous les clients en attente : d'abord depuis le stock
 * local ; s'il est vide, par un appel direct à EDN (un client à la fois). Chaque
 * client livré reçoit un e-mail « Votre licence est prête ».
 */
export async function deliverPendingLicences(): Promise<DeliverySummary> {
  const summary: DeliverySummary = { delivered: 0, stillWaiting: 0, failed: 0 };

  for (const pending of await listPendingLicences()) {
    try {
      let licence = await fulfilInTransaction(pending.accessId);

      if (!licence && pending.clientEmail) {
        const live = await claimLiveFallback(
          pending.clientName,
          pending.clientEmail,
          pending.orderId,
        );
        if (!("error" in live)) {
          const written = await prisma.access.updateMany({
            where: { id: pending.accessId, licenseKey: null },
            data: {
              licenseKey: live.licenseKey,
              installerUrl: live.installerUrl,
            },
          });
          if (written.count === 0) {
            console.error(
              "[licences] licence EDN obtenue mais l'accès était déjà livré :",
              pending.orderId,
            );
          }
          licence = live;
        }
      }

      if (!licence) {
        summary.stillWaiting += 1;
        continue;
      }
      summary.delivered += 1;

      if (pending.clientEmail) {
        await sendLicenceReady({
          to: pending.clientEmail,
          clientName: pending.clientName,
          productName: pending.productName,
          orderId: pending.orderId,
          ctaUrl: await trackingUrlFor(pending.orderId),
        }).catch((error) =>
          console.error(
            "[licences] e-mail « licence prête » non envoyé :",
            error,
          ),
        );
      }
    } catch (error) {
      summary.failed += 1;
      console.error(
        `[licences] livraison impossible (accès ${pending.accessId}) :`,
        error,
      );
    }
  }
  return summary;
}
