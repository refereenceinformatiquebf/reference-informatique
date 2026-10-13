"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { markOrderPaid } from "@/lib/orders";
import { prisma } from "@/lib/prisma/client";

/**
 * Confirme manuellement un paiement WhatsApp — déclenche EXACTEMENT les
 * mêmes effets qu'un paiement SasPay réussi (voir lib/orders.ts,
 * markOrderPaid), pour que l'expérience client soit identique quel que
 * soit le canal choisi (PLAYBOOK-CONSTRUCTION.md, Étape 11).
 */
export async function confirmWhatsappPayment(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await markOrderPaid({
    orderId: order.id,
    provider: "WHATSAPP_MANUAL",
    // L'id de l'Order sert de référence unique — un même Order ne peut être
    // confirmé qu'une fois, protégé par la contrainte (provider, providerRef).
    providerRef: order.id,
    amount: order.amount,
    rawStatus: "confirmed_by_admin",
  });

  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
}

export async function cancelOrder(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "ANNULE" },
  });

  revalidatePath("/admin/commandes");
}
