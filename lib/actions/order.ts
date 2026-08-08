"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import {
  createFedapayTransaction,
  generateFedapayPaymentUrl,
} from "@/lib/payments/fedapay";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22675789737";

/**
 * Récupère (ou crée) la commande en attente pour ce produit. Empêche
 * explicitement la double commande sur le même produit — voir
 * PLAYBOOK-CONSTRUCTION.md, Étape 9, "cas limites".
 */
async function getOrCreatePendingOrder(productId: string) {
  const profile = await requireProfile();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    throw new Error("Ce produit n'est plus disponible.");
  }

  const existing = await prisma.order.findFirst({
    where: {
      profileId: profile.id,
      productId,
      status: { in: ["EN_ATTENTE", "PAYE"] },
    },
  });

  if (existing) {
    return { profile, product, order: existing };
  }

  const order = await prisma.order.create({
    data: {
      profileId: profile.id,
      productId,
      amount: product.price,
      channel: "BOUTIQUE",
      paymentProvider: "FEDAPAY",
      status: "EN_ATTENTE",
    },
  });

  return { profile, product, order };
}

export async function startFedapayCheckout(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const { profile, product, order } = await getOrCreatePendingOrder(productId);

  if (order.status === "PAYE") {
    redirect("/espace-client");
  }

  if (order.paymentProvider !== "FEDAPAY" || order.channel !== "BOUTIQUE") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProvider: "FEDAPAY", channel: "BOUTIQUE" },
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [firstname, ...rest] = profile.name.split(" ");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const transaction = await createFedapayTransaction({
    description: `${product.name} — Référence Informatique`,
    amount: order.amount,
    callbackUrl: `${siteUrl}/commande/retour?order=${order.id}`,
    orderId: order.id,
    customer: {
      email: user?.email ?? "",
      firstname: firstname || profile.name,
      lastname: rest.join(" ") || "-",
      phoneNumber: profile.phone
        ? { number: profile.phone, country: "bj" }
        : undefined,
    },
  });

  const paymentUrl = await generateFedapayPaymentUrl(transaction.id);
  redirect(paymentUrl);
}

export async function startWhatsappOrder(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const { product, order } = await getOrCreatePendingOrder(productId);

  if (order.status === "PAYE") {
    redirect("/espace-client");
  }

  if (
    order.paymentProvider !== "WHATSAPP_MANUAL" ||
    order.channel !== "WHATSAPP"
  ) {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProvider: "WHATSAPP_MANUAL", channel: "WHATSAPP" },
    });
  }

  const message = [
    "Bonjour, je souhaite commander :",
    `${product.name} — ${order.amount.toLocaleString("fr-FR")} F CFA`,
    `Référence de commande : ${order.id}`,
  ].join("\n");

  redirect(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
  );
}
