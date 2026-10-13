import "server-only";
import { prisma } from "@/lib/prisma/client";

/** Compteurs affichés en pastilles dans le menu de l'administration. */
export async function adminBadgeCounts() {
  try {
    const [quotes, messages, deliveries, whatsapp] = await Promise.all([
      prisma.quoteRequest.count({ where: { status: "NOUVEAU" } }),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.order.count({
        where: {
          status: "PAYE",
          deliveryStatus: { in: ["A_PREPARER", "EN_LIVRAISON"] },
        },
      }),
      prisma.order.count({
        where: { status: "EN_ATTENTE", paymentProvider: "WHATSAPP_MANUAL" },
      }),
    ]);
    return { quotes, messages, deliveries, whatsapp };
  } catch (error) {
    console.error("[admin] compteurs indisponibles :", error);
    return { quotes: 0, messages: 0, deliveries: 0, whatsapp: 0 };
  }
}

export type AdminBadgeCounts = Awaited<ReturnType<typeof adminBadgeCounts>>;
