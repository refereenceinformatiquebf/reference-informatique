"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { getCurrentProfile } from "@/lib/auth/dal";
import { generateAuthLink, displayNameFor } from "@/lib/auth/email-links";
import { getProduct } from "@/lib/catalog/live";
import { getVisitorCountry } from "@/lib/geo";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { isHoneypotFilled } from "@/lib/honeypot";
import { sendAuthLink } from "@/lib/email/send";
import { loginLinkSchema } from "@/lib/validations/auth";
import { addOrderEvent } from "@/lib/orders";
import { findOrderByToken, openSessionForProfile } from "@/lib/checkout/access";
import { CheckoutError, openOnlinePayment } from "@/lib/checkout/pay";
import { sendLinksForEmail, sendLinksForOrder } from "@/lib/checkout/links";
import {
  accessDestination,
  accessLinkExpired,
  isAccessTokenShape,
  isOrderIdShape,
  maskEmail,
} from "@/lib/checkout/rules";

/** État renvoyé aux formulaires de suivi : un message d'erreur ou de réussite. */
export type CheckoutActionState =
  { error?: string; success?: string } | undefined;

const TEN_MINUTES = 10 * 60;
const ONE_HOUR = 60 * 60;

const LINK_PROBLEM =
  "Ce lien n'est pas valable. Utilisez le lien le plus récent reçu par email, ou retrouvez votre commande avec votre adresse email.";
const SEND_FAILED =
  "Nous n'avons pas pu envoyer l'email. Réessayez dans un instant, ou écrivez-nous sur WhatsApp : nous vous aidons tout de suite.";

function rateLimited(error: unknown): CheckoutActionState | null {
  return error instanceof RateLimitError ? { error: error.message } : null;
}

/* --------------------------- Ouvrir mon achat --------------------------- */

/**
 * « Accéder à mon achat » : le jeton du lien (reçu par email) prouve que le
 * visiteur lit la boîte de l'acheteur ; on ouvre alors sa session, sans mot de
 * passe, et on l'emmène directement sur son achat.
 */
export async function openPurchase(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  try {
    await enforceRateLimit("order-access", 20, TEN_MINUTES);
  } catch (error) {
    const limited = rateLimited(error);
    if (limited) return limited;
    throw error;
  }

  const token = formData.get("token");
  const order = await findOrderByToken(token);
  if (!order || !isAccessTokenShape(token)) return { error: LINK_PROBLEM };
  if (order.status !== "PAYE") {
    return {
      error:
        "Cette commande n'est pas payée : l'accès n'est pas encore ouvert.",
    };
  }
  if (accessLinkExpired(order)) {
    return {
      error:
        "Ce lien n'est plus valable. Demandez un nouveau lien : il part vers l'adresse de votre commande.",
    };
  }

  const delivery = order.product
    ? (await getProduct(order.product.slug))?.delivery
    : undefined;
  const destination = accessDestination(delivery, order.product?.slug);

  // Déjà connecté à ce compte : rien à ouvrir.
  const current = await getCurrentProfile();
  if (current?.id !== order.profileId) {
    const opened = await openSessionForProfile(order.profile);
    if (!opened) {
      return {
        error:
          "Nous n'avons pas pu ouvrir votre achat. Réessayez, ou connectez-vous avec votre adresse email depuis la page de connexion.",
      };
    }
    await addOrderEvent(
      order.id,
      "ACCESS_OPENED",
      "Achat ouvert depuis le lien personnel envoyé par email.",
      order.profile.email ?? order.profile.name,
    );
  }

  redirect(destination);
}

/**
 * Lien expiré : on envoie un lien de connexion tout neuf, TOUJOURS à l'adresse
 * du compte (jamais à une adresse saisie), puis le client entre comme
 * d'habitude.
 */
export async function sendFreshAccessLink(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const token = formData.get("token");
  const order = await findOrderByToken(token);
  if (!order || !order.profile.email) return { error: LINK_PROBLEM };

  try {
    await enforceRateLimit("order-fresh-link", 5, ONE_HOUR, order.profileId);
  } catch (error) {
    const limited = rateLimited(error);
    if (limited) return limited;
    throw error;
  }

  const delivery = order.product
    ? (await getProduct(order.product.slug))?.delivery
    : undefined;
  const link = await generateAuthLink({
    kind: "magiclink",
    email: order.profile.email,
    next: accessDestination(delivery, order.product?.slug),
  });
  if (!link) return { error: SEND_FAILED };
  try {
    await sendAuthLink({
      kind: "magiclink",
      to: {
        email: order.profile.email,
        name: await displayNameFor(order.profileId),
      },
      url: link.url,
    });
  } catch (error) {
    console.error("[sendFreshAccessLink] envoi impossible :", error);
    return { error: SEND_FAILED };
  }
  return {
    success: `Un nouveau lien vient d'être envoyé à ${maskEmail(order.profile.email)}. Pensez à regarder dans vos courriers indésirables.`,
  };
}

/* ---------------------------- Reprendre le paiement ---------------------------- */

/**
 * « Reprendre mon paiement » : rouvre la page de paiement d'une commande jamais
 * payée. Appelée depuis le lien personnel (jeton) ou depuis la page de retour
 * (identifiant de commande, tout aussi impossible à deviner).
 */
export async function resumePayment(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  try {
    await enforceRateLimit("order-resume", 15, TEN_MINUTES);
  } catch (error) {
    const limited = rateLimited(error);
    if (limited) return limited;
    throw error;
  }

  const token = formData.get("token");
  const orderId = formData.get("order");
  const found = isAccessTokenShape(token)
    ? await findOrderByToken(token)
    : isOrderIdShape(orderId)
      ? await prisma.order.findUnique({
          where: { id: orderId },
          include: { product: true, profile: true, events: true },
        })
      : null;
  if (!found) return { error: LINK_PROBLEM };

  const backTo =
    isAccessTokenShape(token) && found.accessToken
      ? `/commande/suivi/${found.accessToken}`
      : `/commande/retour?order=${found.id}`;

  if (found.status === "PAYE") redirect(backTo);
  if (found.status !== "EN_ATTENTE" || found.paymentProvider !== "SASPAY") {
    return {
      error:
        "Cette commande ne peut plus être payée en ligne. Écrivez-nous sur WhatsApp : nous vous aidons tout de suite.",
    };
  }

  let target: string;
  try {
    const payment = await openOnlinePayment({
      order: found,
      profile: found.profile,
      productName: found.product?.name ?? "Votre commande",
      visitorCountry: await getVisitorCountry(),
    });
    target = payment.paid ? backTo : payment.checkoutUrl;
  } catch (error) {
    if (error instanceof CheckoutError) return { error: error.message };
    console.error("[resumePayment]", error);
    return {
      error:
        "Nous n'avons pas pu rouvrir le paiement. Réessayez dans un instant, ou écrivez-nous sur WhatsApp.",
    };
  }
  // Hors du try/catch : une redirection Next.js est une exception à ne pas avaler.
  redirect(target);
}

/* ------------------------- Retrouver / renvoyer le lien ------------------------- */

const LINKS_SENT =
  "Si cette adresse a passé commande récemment, un email avec le lien de chaque commande vient de partir. Pensez à regarder dans vos courriers indésirables.";

/** « Retrouver ma commande » : l'adresse email suffit, la réponse est toujours la même. */
export async function requestOrderLinks(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  if (isHoneypotFilled(formData)) return { success: LINKS_SENT };

  const parsed = loginLinkSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: "Cette adresse email semble incorrecte." };
  }
  const email = parsed.data.email.trim().toLowerCase();

  try {
    await enforceRateLimit("order-links", 5, TEN_MINUTES, email);
  } catch (error) {
    const limited = rateLimited(error);
    if (limited) return limited;
    throw error;
  }

  try {
    await sendLinksForEmail(email);
  } catch (error) {
    console.error("[requestOrderLinks] envoi impossible :", error);
    return { error: SEND_FAILED };
  }
  return { success: LINKS_SENT };
}

/** « Renvoyer le lien » depuis la page de retour : part vers l'email de la commande. */
export async function resendOrderLink(
  _state: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const orderId = formData.get("order");
  if (!isOrderIdShape(orderId)) return { error: LINK_PROBLEM };

  try {
    await enforceRateLimit("order-resend", 4, ONE_HOUR, orderId);
  } catch (error) {
    const limited = rateLimited(error);
    if (limited) return limited;
    throw error;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { profile: true },
  });
  if (!order?.profile.email) return { error: LINK_PROBLEM };

  try {
    await sendLinksForOrder(order.id);
  } catch (error) {
    console.error("[resendOrderLink] envoi impossible :", error);
    return { error: SEND_FAILED };
  }
  return {
    success: `Le lien vient d'être renvoyé à ${maskEmail(order.profile.email)}. Pensez à regarder dans vos courriers indésirables.`,
  };
}
