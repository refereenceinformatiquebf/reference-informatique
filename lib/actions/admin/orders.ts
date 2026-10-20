"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { actorLabel, audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import {
  addOrderEvent,
  cancelUnpaidOrder,
  getClientEmail,
  markOrderPaid,
  refundPaidOrder,
  updateDeliveryStatus,
} from "@/lib/orders";
import { getProduct } from "@/lib/catalog/live";
import { ensureProductRow } from "@/lib/catalog/db-sync";
import { shippingSchema, MAX_KEY_QUANTITY } from "@/lib/validations/order";
import {
  getSaspaySessionStatus,
  isSaspaySessionPaid,
} from "@/lib/payments/saspay";
import { syncSaspayOrder } from "@/lib/payments/saspay-sync";
import { sendPaymentConfirmation } from "@/lib/email/send";
import { newAccessToken, trackingUrlFor } from "@/lib/checkout/access";
import { remindOrder } from "@/lib/checkout/reminders";
import { sendLinksForOrder } from "@/lib/checkout/links";
import { findAuthUser, normalizeEmail } from "@/lib/auth/email-links";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureAccount } from "@/lib/checkout/buyer";
import { loginLinkSchema } from "@/lib/validations/auth";

function refresh(orderId?: string) {
  revalidatePath("/admin/commandes");
  if (orderId) revalidatePath(`/admin/commandes/${orderId}`);
  revalidatePath("/admin");
}

function orderIdFrom(formData: FormData) {
  return String(formData.get("orderId") ?? "");
}

function reasonFrom(formData: FormData) {
  return String(formData.get("reason") ?? "").trim();
}

/** Revérifie auprès de SasPay une commande payée en ligne et encore « en attente ». */
export async function verifySaspayOrderAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return fail("Commande introuvable.");
  if (order.status === "PAYE") return done("Cette commande est déjà payée.");
  if (order.paymentProvider !== "SASPAY" || !order.providerSessionId) {
    return fail("Cette commande n'a pas de paiement SasPay à vérifier.");
  }

  try {
    const status = await getSaspaySessionStatus(order.providerSessionId);
    if (!isSaspaySessionPaid(status)) {
      return done(
        `Toujours non payée chez SasPay (statut : ${status.status}). Rien à faire pour l'instant.`,
      );
    }
    await syncSaspayOrder(order);
    await audit(
      admin,
      "order.verify",
      "order",
      order.id,
      "Paiement SasPay vérifié : payé",
    );
    refresh(order.id);
    return done("SasPay confirme le paiement : commande passée à « payé ».");
  } catch (error) {
    console.error("[admin] vérification SasPay :", error);
    return fail(
      "SasPay ne répond pas pour le moment. Réessayez dans un instant.",
    );
  }
}

/** Paiement reçu hors du site (Mobile Money direct, espèces, WhatsApp…). */
export async function validateOrderManuallyAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const reason = reasonFrom(formData);
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return fail("Commande introuvable.");
  if (order.status === "PAYE") return done("Cette commande est déjà payée.");
  if (order.status === "REMBOURSE" || order.status === "ANNULE") {
    return fail("Cette commande est clôturée : créez-en une nouvelle.");
  }

  // Une session de paiement encore ouverte ne doit plus pouvoir être payée.
  if (order.providerSessionId) {
    const { cancelSaspaySession } = await import("@/lib/payments/saspay");
    await cancelSaspaySession(order.providerSessionId);
  }

  const result = await markOrderPaid({
    orderId: order.id,
    provider: "WHATSAPP_MANUAL",
    providerRef: `manual:${order.id}`,
    amount: order.amount,
    rawStatus: "validated_by_admin",
    actorLabel: actorLabel(admin),
    eventMessage: `Paiement validé manuellement : ${reason}`,
  });
  if (!result.ok) return fail("Validation impossible : commande introuvable.");

  await audit(
    admin,
    "order.validate_manual",
    "order",
    order.id,
    `Validation manuelle : ${reason}`,
  );
  refresh(order.id);
  return done("Paiement validé : accès activé, client prévenu.");
}

export async function cancelOrderAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const reason = reasonFrom(formData);
  const result = await cancelUnpaidOrder({
    orderId,
    actorLabel: actorLabel(admin),
    reason: reason || undefined,
  });
  if (!result.ok) return fail(result.error);
  await audit(admin, "order.cancel", "order", orderId, reason || "Annulation");
  refresh(orderId);
  return done(result.message);
}

export async function refundOrderAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const reason = reasonFrom(formData);
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");
  const result = await refundPaidOrder({
    orderId,
    actorLabel: actorLabel(admin),
    reason,
    notifyClient: formData.get("notify") === "on",
  });
  if (!result.ok) return fail(result.error);
  await audit(
    admin,
    "order.refund",
    "order",
    orderId,
    `Remboursement : ${reason}`,
  );
  refresh(orderId);
  revalidatePath("/admin/acces");
  return done(result.message);
}

const deliverySchema = z.enum(["A_PREPARER", "EN_LIVRAISON", "LIVREE"]);

export async function setDeliveryStatusAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const status = deliverySchema.safeParse(formData.get("status"));
  if (!status.success) return fail("Statut de livraison inconnu.");
  const result = await updateDeliveryStatus({
    orderId,
    status: status.data,
    actorLabel: actorLabel(admin),
    notifyClient: formData.get("notify") === "on",
  });
  if (!result.ok) return fail(result.error);
  await audit(admin, "order.delivery", "order", orderId, result.message);
  refresh(orderId);
  return done(result.message);
}

export async function saveOrderNoteAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 2000);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return fail("Commande introuvable.");
  await prisma.order.update({
    where: { id: orderId },
    data: { internalNote: note || null },
  });
  await addOrderEvent(
    orderId,
    "NOTE",
    note ? "Note interne mise à jour." : "Note interne effacée.",
    actorLabel(admin),
  );
  await audit(admin, "order.note", "order", orderId, "Note interne");
  refresh(orderId);
  return done("Note enregistrée.");
}

/** Renvoie au client l'email de confirmation de paiement (message perdu, boîte pleine…). */
export async function resendPaymentEmailAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, profile: true },
  });
  if (!order || !order.product) return fail("Commande introuvable.");
  if (order.status !== "PAYE")
    return fail("Seule une commande payée a un email de confirmation.");
  const email = await getClientEmail(order.profile);
  if (!email) return fail("Ce client n'a pas d'adresse email connue.");
  const catalogProduct = await getProduct(order.product.slug);
  const delivery = catalogProduct?.delivery ?? "numerique";
  try {
    await sendPaymentConfirmation({
      to: email,
      clientName: order.profile.name,
      productName: order.product.name,
      amount: order.amount,
      quantity: order.quantity,
      delivery,
      orderId: order.id,
      // Lien personnel de la commande : ouvre l'achat sans mot de passe.
      ctaUrl: await trackingUrlFor(order.id),
      paidAt: order.paidAt,
    });
  } catch {
    return fail(
      "L'envoi a échoué. Consultez « Emails envoyés » pour le détail.",
    );
  }
  await addOrderEvent(
    order.id,
    "EMAIL",
    "Email de confirmation et lien d'accès renvoyés au client.",
    actorLabel(admin),
  );
  await audit(
    admin,
    "order.resend_email",
    "order",
    order.id,
    "Email de confirmation renvoyé",
  );
  refresh(order.id);
  return done("Email renvoyé au client.");
}

/** Relance (une fois) un client qui n'a pas terminé son paiement en ligne. */
export async function remindPaymentAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return fail("Commande introuvable.");
  if (order.status !== "EN_ATTENTE")
    return fail("Seule une commande en attente de paiement se relance.");
  if (order.paymentProvider !== "SASPAY")
    return fail(
      "Cette commande se règle par WhatsApp : relancez le client directement sur WhatsApp.",
    );

  try {
    const outcome = await remindOrder(order.id, {
      actorLabel: actorLabel(admin),
      force: true,
    });
    if (outcome === "paid") {
      refresh(order.id);
      return done(
        "Bonne nouvelle : le paiement avait abouti, la commande est maintenant payée.",
      );
    }
    if (outcome === "skipped_no_email")
      return fail("Ce client n'a pas d'adresse email connue.");
    if (outcome === "skipped_other_order_paid")
      return fail("Ce client a déjà payé ce produit par une autre commande.");
    if (outcome !== "sent") return fail("Aucune relance n'a été envoyée.");
  } catch {
    return fail(
      "L'envoi a échoué. Consultez « Emails envoyés » pour le détail.",
    );
  }
  await audit(
    admin,
    "order.remind",
    "order",
    order.id,
    "Relance de paiement envoyée",
  );
  refresh(order.id);
  return done(
    "Relance envoyée : le client peut reprendre son paiement en un clic.",
  );
}

/**
 * Corrige l'adresse email d'un client qui s'est trompé en la saisissant (le
 * lien d'accès est parti vers une adresse fausse). L'ancien lien est
 * invalidé, puis le nouveau part vers la bonne adresse.
 */
export async function correctClientEmailAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const orderId = orderIdFrom(formData);
  const parsed = loginLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("Cette adresse email semble incorrecte.");
  const email = normalizeEmail(parsed.data.email);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { profile: true },
  });
  if (!order) return fail("Commande introuvable.");
  if (order.profile.role === "ADMIN")
    return fail("Le compte d'un administrateur ne se modifie pas ici.");
  if (order.profile.email === email)
    return fail("Le client a déjà cette adresse.");
  if (await findAuthUser(email))
    return fail(
      "Cette adresse est déjà utilisée par un autre compte. Écrivez au client pour trouver la bonne solution.",
    );

  const { error } = await createAdminClient().auth.admin.updateUserById(
    order.profileId,
    { email, email_confirm: true },
  );
  if (error) {
    console.error("[correctClientEmail]", error.message);
    return fail("Le changement d'adresse a échoué. Réessayez dans un instant.");
  }
  // Le déclencheur copie déjà l'adresse dans le profil ; on s'en assure.
  await prisma.profile.update({
    where: { id: order.profileId },
    data: { email },
  });
  // Les anciens liens sont partis vers la mauvaise boîte : on les invalide
  // pour TOUTES les commandes de ce client (de nouveaux sont créés à la demande).
  await prisma.order.updateMany({
    where: { profileId: order.profileId },
    data: { accessToken: null },
  });
  await addOrderEvent(
    order.id,
    "EMAIL_CORRECTED",
    `Adresse email du client corrigée (${order.profile.email ?? "inconnue"} → ${email}).`,
    actorLabel(admin),
  );
  await audit(
    admin,
    "client.correct_email",
    "order",
    order.id,
    `Email corrigé : ${order.profile.email ?? "inconnue"} → ${email}`,
  );

  let sent = false;
  try {
    sent = await sendLinksForOrder(order.id);
  } catch {
    // L'adresse est corrigée même si l'envoi échoue : on le dit ci-dessous.
  }
  refresh(order.id);
  revalidatePath(`/admin/clients/${order.profileId}`);
  return done(
    sent
      ? "Adresse corrigée. Le nouveau lien d'accès vient d'être envoyé au client."
      : "Adresse corrigée, mais l'email n'est pas parti : utilisez « Renvoyer l'email de confirmation ».",
  );
}

/* ----------------------------- Commande manuelle ----------------------------- */

export type ManualOrderState =
  | {
      ok: boolean;
      message: string;
      orderId?: string;
      errors?: Record<string, string[]>;
    }
  | undefined;

const manualOrderSchema = z.object({
  clientEmail: z.email({ error: "Adresse email invalide." }),
  productSlug: z.string().min(1, { error: "Choisissez un produit." }),
  quantity: z.coerce.number().int().min(1).max(MAX_KEY_QUANTITY),
  markPaid: z.boolean(),
  reason: z.string().trim().max(300),
});

/**
 * Crée une commande pour un client qui a déjà un compte : client mal localisé
 * (ne voit pas les clés), paiement reçu en direct, geste commercial. Le prix
 * vient du catalogue ; la règle d'accès par pays ne s'applique PAS ici : c'est
 * l'équipe qui décide, pour un client réel, avec une adresse de livraison.
 */
export async function createManualOrderAction(
  _state: ManualOrderState,
  formData: FormData,
): Promise<ManualOrderState> {
  const admin = await requireAdmin();
  const parsed = manualOrderSchema.safeParse({
    clientEmail: formData.get("clientEmail"),
    productSlug: formData.get("productSlug"),
    quantity: formData.get("quantity") ?? 1,
    markPaid: formData.get("markPaid") === "on",
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez le formulaire.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  if (data.markPaid && data.reason.length < 5) {
    return {
      ok: false,
      message:
        "Pour une commande déjà payée, indiquez comment elle a été réglée (5 caractères minimum).",
      errors: { reason: ["Motif obligatoire."] },
    };
  }

  // Aucun compte à créer d'avance : un client qui n'a jamais commandé reçoit
  // un compte sans mot de passe (il se connecte ensuite avec son seul email).
  const { profile, createdAccount } = await ensureAccount({
    email: data.clientEmail,
  });

  const product = await getProduct(data.productSlug);
  if (!product)
    return {
      ok: false,
      message: "Ce produit n'est pas (ou plus) au catalogue.",
      errors: { productSlug: ["Produit introuvable."] },
    };

  const physical = product.delivery === "cle-physique";
  let shipping: { city: string; address: string; phone: string } | null = null;
  if (physical) {
    const parsedShipping = shippingSchema.safeParse({
      city: formData.get("city"),
      address: formData.get("address"),
      phone: formData.get("phone"),
    });
    if (!parsedShipping.success) {
      return {
        ok: false,
        message: "L'adresse de livraison est obligatoire pour une clé USB.",
        errors: parsedShipping.error.flatten().fieldErrors,
      };
    }
    shipping = parsedShipping.data;
  }

  const productRow = await ensureProductRow(product.slug);
  if (!productRow) return { ok: false, message: "Produit indisponible." };

  const quantity = physical ? data.quantity : 1;
  const order = await prisma.order.create({
    data: {
      profileId: profile.id,
      productId: productRow.id,
      amount: product.price * quantity,
      unitPrice: product.price,
      quantity,
      channel: "WHATSAPP",
      paymentProvider: "WHATSAPP_MANUAL",
      status: "EN_ATTENTE",
      manual: true,
      accessToken: newAccessToken(),
      shippingCity: shipping?.city,
      shippingAddress: shipping?.address,
      shippingPhone: shipping?.phone,
    },
  });
  await addOrderEvent(
    order.id,
    "CREATED",
    `Commande créée par l'équipe${data.reason ? ` : ${data.reason}` : "."}${createdAccount ? " Compte client créé (sans mot de passe)." : ""}`,
    actorLabel(admin),
  );

  if (data.markPaid) {
    await markOrderPaid({
      orderId: order.id,
      provider: "WHATSAPP_MANUAL",
      providerRef: `manual:${order.id}`,
      amount: order.amount,
      rawStatus: "validated_by_admin",
      actorLabel: actorLabel(admin),
      eventMessage: `Paiement validé à la création : ${data.reason}`,
    });
  }

  await audit(
    admin,
    "order.create_manual",
    "order",
    order.id,
    `Commande manuelle ${product.name} × ${quantity}${data.markPaid ? " (payée)" : ""}`,
  );
  refresh(order.id);
  return { ok: true, message: "Commande créée.", orderId: order.id };
}
