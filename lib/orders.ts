import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import type { PaymentProvider } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/client";

type MarkOrderPaidParams = {
  orderId: string;
  provider: PaymentProvider;
  /** Identifiant unique de la transaction chez le fournisseur (id FedaPay),
   * ou l'id de l'Order lui-même pour une confirmation WhatsApp manuelle. */
  providerRef: string;
  amount: number;
  rawStatus: string;
  rawPayload?: unknown;
};

/**
 * Point d'entrée UNIQUE pour marquer une commande payée — appelé à la fois
 * par le webhook FedaPay (Étape 10) et par l'action de confirmation
 * WhatsApp de l'admin (Étape 11), pour que les deux chemins déclenchent
 * rigoureusement les mêmes effets (voir PLAYBOOK-CONSTRUCTION.md).
 *
 * Idempotent par construction : la contrainte unique (provider, providerRef)
 * en base empêche deux appels concurrents ou un webhook rejoué de créer
 * deux Payment ou d'activer l'accès en double.
 */
export async function markOrderPaid(params: MarkOrderPaidParams) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
  });

  if (!order) {
    return { ok: false as const, reason: "order_not_found" as const };
  }

  try {
    await prisma.payment.create({
      data: {
        orderId: order.id,
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
  } catch (error) {
    // Violation de la contrainte unique (provider, providerRef) : ce
    // paiement a déjà été traité. Ce n'est pas une erreur — c'est
    // exactement le comportement attendu pour un webhook rejoué.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: true as const, alreadyProcessed: true as const, order };
    }
    throw error;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAYE" },
  });

  if (order.productId) {
    await prisma.access.upsert({
      where: {
        profileId_productId: {
          profileId: order.profileId,
          productId: order.productId,
        },
      },
      update: {},
      create: { profileId: order.profileId, productId: order.productId },
    });
  }

  // L'email de confirmation (client) et l'activation de formation sont
  // déclenchés ici une fois l'Étape 12 (Brevo) branchée.

  return {
    ok: true as const,
    alreadyProcessed: false as const,
    order: updatedOrder,
  };
}
