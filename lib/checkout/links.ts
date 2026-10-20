import "server-only";
import { prisma } from "@/lib/prisma/client";
import { displayNameFor } from "@/lib/auth/email-links";
import { sendOrderLinks } from "@/lib/email/send";
import { getProduct } from "@/lib/catalog/live";
import { formatDate } from "@/lib/format";
import { ensureAccessToken, orderTrackingUrl } from "./access";
import { ACCESS_LINK_TTL_DAYS } from "./rules";

const DAY_MS = 24 * 60 * 60 * 1000;

type LinkableOrder = {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  product: { name: string; slug: string } | null;
};

async function toItems(orders: LinkableOrder[]) {
  return Promise.all(
    orders.map(async (order) => ({
      productName: order.product?.name ?? "Votre commande",
      amount: order.amount,
      paid: order.status === "PAYE",
      url: orderTrackingUrl(await ensureAccessToken(order.id)),
      date: formatDate(
        order.status === "PAYE" && order.paidAt
          ? order.paidAt
          : order.createdAt,
      ),
      licence: order.product
        ? (await getProduct(order.product.slug))?.delivery === "licence-edn"
        : false,
    })),
  );
}

/**
 * Renvoie à l'adresse du compte le lien personnel d'UNE commande (achat déjà
 * payé recommandé une seconde fois, « Renvoyer le lien »…). Le lien ne part
 * jamais ailleurs que vers l'email du compte.
 */
export async function sendLinksForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, profile: true },
  });
  if (!order?.profile.email) return false;

  await sendOrderLinks({
    to: {
      email: order.profile.email,
      name: await displayNameFor(order.profile.id),
    },
    items: await toItems([order]),
  });
  return true;
}

/**
 * « Retrouver ma commande » : envoie à CETTE adresse les liens de ses
 * commandes récentes. Renvoie le nombre de commandes trouvées ; l'appelant
 * répond de la même façon qu'il y en ait ou non, pour ne révéler à personne
 * quelles adresses ont déjà commandé.
 */
export async function sendLinksForEmail(email: string) {
  const profile = await prisma.profile.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
  });
  if (!profile?.email) return 0;

  const now = Date.now();
  const orders = await prisma.order.findMany({
    where: {
      profileId: profile.id,
      OR: [
        {
          status: "PAYE",
          paidAt: { gte: new Date(now - ACCESS_LINK_TTL_DAYS * DAY_MS) },
        },
        {
          status: "EN_ATTENTE",
          createdAt: { gte: new Date(now - 14 * DAY_MS) },
        },
      ],
    },
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  if (orders.length === 0) return 0;

  await sendOrderLinks({
    to: { email: profile.email, name: await displayNameFor(profile.id) },
    items: await toItems(orders),
  });
  return orders.length;
}
