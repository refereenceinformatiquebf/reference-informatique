import "server-only";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { prisma } from "@/lib/prisma/client";
import { SITE } from "@/lib/site";
import type { DeliveryMode } from "@/lib/catalog/types";
import { getBrevoClient } from "./client";
import { OrderConfirmationEmail } from "./templates/order-confirmation";
import { PaymentConfirmationEmail } from "./templates/payment-confirmation";
import { AccessGrantedEmail } from "./templates/access-granted";
import {
  NewOrderAdminEmail,
  type OrderAlertProps,
} from "./templates/new-order-admin";
import {
  DevisReceivedClientEmail,
  DevisReceivedAdminEmail,
} from "./templates/devis-received";
import {
  ContactMessageAdminEmail,
  ContactReceivedClientEmail,
} from "./templates/contact-message";
import { DeliveryUpdateEmail } from "./templates/delivery-update";
import { RefundNoticeEmail } from "./templates/refund-notice";
import { AdminReplyEmail } from "./templates/admin-reply";
import { AuthLinkEmail, type AuthLinkKind } from "./templates/auth-link";
import { LicenceStockAlertEmail } from "./templates/licence-stock-alert";
import { OrderLinksEmail, type OrderLinkItem } from "./templates/order-links";
import { PaymentReminderEmail } from "./templates/payment-reminder";

const SENDER = {
  name: SITE.name,
  email: process.env.BREVO_SENDER_EMAIL ?? "hello@reference-informatique.com",
};

type Recipient = { email: string; name?: string };

/** Destinataires des alertes internes : ADMIN_NOTIFICATION_EMAIL, une ou
 * plusieurs adresses séparées par des virgules. */
export function adminRecipients(): Recipient[] {
  const raw =
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    "nosservicesinformatiques@gmail.com";
  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
}

const ADMIN_REPLY_TO: Recipient = {
  email: adminRecipients()[0]?.email ?? SENDER.email,
  name: SITE.name,
};

export class EmailSendError extends Error {}

async function writeLog(entry: {
  to: Recipient[];
  subject: string;
  template: string;
  status: "SENT" | "FAILED" | "SKIPPED";
  error?: string;
  providerId?: string;
  relatedOrderId?: string;
}) {
  try {
    await prisma.emailLog.createMany({
      data: entry.to.map((recipient) => ({
        toEmail: recipient.email,
        subject: entry.subject,
        template: entry.template,
        status: entry.status,
        error: entry.error?.slice(0, 500),
        providerId: entry.providerId,
        relatedOrderId: entry.relatedOrderId,
      })),
    });
  } catch (error) {
    console.error("[email] journalisation impossible :", error);
  }
}

/**
 * Point d'envoi unique. Chaque envoi laisse une trace (table email_log), y
 * compris les échecs, pour que l'équipe voie ce qui n'est pas parti. En
 * développement (pas de clé Brevo), rien n'est envoyé et l'envoi est noté
 * « SKIPPED » — voir aussi /dev/emails pour un aperçu visuel des gabarits.
 */
async function sendEmail(params: {
  to: Recipient | Recipient[];
  subject: string;
  react: ReactElement;
  template: string;
  /** Adresse qui reçoit les réponses (par défaut : la boîte de l'équipe). */
  replyTo?: Recipient;
  relatedOrderId?: string;
}) {
  const recipients = Array.isArray(params.to) ? params.to : [params.to];
  const html = await render(params.react);

  if (!process.env.BREVO_API_KEY) {
    console.info(
      `[email:dev] À ${recipients.map((r) => r.email).join(", ")} — "${params.subject}" (BREVO_API_KEY absent, non envoyé réellement)`,
    );
    await writeLog({
      to: recipients,
      subject: params.subject,
      template: params.template,
      status: "SKIPPED",
      relatedOrderId: params.relatedOrderId,
    });
    return;
  }

  try {
    const response =
      await getBrevoClient().transactionalEmails.sendTransacEmail({
        sender: SENDER,
        // Les clients répondent à « cet email » : la réponse doit arriver
        // dans la boîte de l'équipe, même si l'adresse d'expédition n'a pas
        // de boîte de réception.
        replyTo: params.replyTo ?? ADMIN_REPLY_TO,
        to: recipients,
        subject: params.subject,
        htmlContent: html,
      });
    const providerId =
      response && typeof response === "object" && "messageId" in response
        ? String((response as { messageId?: unknown }).messageId ?? "")
        : undefined;
    await writeLog({
      to: recipients,
      subject: params.subject,
      template: params.template,
      status: "SENT",
      providerId: providerId || undefined,
      relatedOrderId: params.relatedOrderId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await writeLog({
      to: recipients,
      subject: params.subject,
      template: params.template,
      status: "FAILED",
      error: message,
      relatedOrderId: params.relatedOrderId,
    });
    throw new EmailSendError(message);
  }
}

/* ------------------------------ Commandes ------------------------------ */

export async function sendOrderConfirmation(params: {
  to: string;
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  delivery?: DeliveryMode;
  channel?: "BOUTIQUE" | "WHATSAPP";
  shipping?: { city: string; address: string } | null;
  orderId?: string;
  /** Lien personnel de la commande (suivi, reprise du paiement, accès). */
  trackUrl?: string;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Commande reçue — ${params.productName}`,
    react: OrderConfirmationEmail(params),
    template: "order-confirmation",
    relatedOrderId: params.orderId,
  });
}

export async function sendPaymentConfirmation(params: {
  to: string;
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  delivery?: DeliveryMode;
  orderId: string;
  /** Lien personnel de la commande : ouvre l'achat sans mot de passe. */
  ctaUrl?: string;
  /** Repli : chemin dans l'espace client (à n'utiliser que sans lien personnel). */
  ctaPath?: string;
  /** Renseignés uniquement pour une livraison "licence-edn". */
  licenceKey?: string | null;
  installerUrl?: string | null;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Paiement confirmé — ${params.productName}`,
    react: PaymentConfirmationEmail({
      ...params,
      orderRef: params.orderId.slice(0, 8).toUpperCase(),
      ctaUrl:
        params.ctaUrl ?? `${SITE.url}${params.ctaPath ?? "/espace-client"}`,
    }),
    template: "payment-confirmation",
    relatedOrderId: params.orderId,
  });
}

/** Relance unique d'une commande dont le paiement n'a pas été terminé. */
export async function sendPaymentReminder(params: {
  to: string;
  clientName: string;
  productName: string;
  amount: number;
  quantity?: number;
  orderId: string;
  trackUrl: string;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Votre commande vous attend — ${params.productName}`,
    react: PaymentReminderEmail(params),
    template: "payment-reminder",
    relatedOrderId: params.orderId,
    replyTo: ADMIN_REPLY_TO,
  });
}

/** « Retrouver ma commande » : les liens personnels des commandes récentes. */
export async function sendOrderLinks(params: {
  to: Recipient;
  items: OrderLinkItem[];
}) {
  await sendEmail({
    to: params.to,
    subject: "Vos commandes — Référence Informatique",
    react: OrderLinksEmail({ name: params.to.name, items: params.items }),
    template: "order-links",
    replyTo: ADMIN_REPLY_TO,
  });
}

/** Alerte interne : stock local de licences EDN bas ou épuisé (voir lib/licences/stock.ts). */
export async function sendLicenceStockAlert(params: {
  milestone: "low" | "empty";
  available: number;
}) {
  const subject =
    params.milestone === "empty"
      ? "Stock de licences épuisé"
      : "Stock de licences bas";
  await sendEmail({
    to: adminRecipients(),
    subject,
    react: LicenceStockAlertEmail({
      ...params,
      adminUrl: `${SITE.url}/admin/licences`,
    }),
    template: "licence-stock-alert",
  });
}

/** Accès accordé par l'équipe, sans paiement (geste commercial, support). */
export async function sendAccessGranted(params: {
  to: string;
  clientName: string;
  productName: string;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Votre accès est prêt — ${params.productName}`,
    react: AccessGrantedEmail({ ...params, siteUrl: SITE.url }),
    template: "access-granted",
  });
}

/** Alerte à l'équipe : commande enregistrée, ou paiement reçu. */
export async function sendOrderAlert(
  params: Omit<OrderAlertProps, "adminUrl"> & { orderId: string },
) {
  const subject =
    params.event === "paid"
      ? params.shipping
        ? `Paiement reçu, clé à livrer — ${params.productName}`
        : `Paiement reçu — ${params.productName}`
      : `Nouvelle commande — ${params.productName}`;
  await sendEmail({
    to: adminRecipients(),
    subject,
    react: NewOrderAdminEmail({
      ...params,
      adminUrl: `${SITE.url}/admin/commandes/${params.orderId}`,
    }),
    template: params.event === "paid" ? "order-paid-admin" : "order-new-admin",
    relatedOrderId: params.orderId,
    // « Répondre » écrit au client quand son adresse est connue.
    replyTo: params.clientEmail
      ? { email: params.clientEmail, name: params.clientName }
      : undefined,
  });
}

export async function sendDeliveryUpdate(params: {
  to: string;
  clientName: string;
  productName: string;
  status: "EN_LIVRAISON" | "LIVREE";
  orderId: string;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject:
      params.status === "EN_LIVRAISON"
        ? `Votre clé est en route — ${params.productName}`
        : `Votre clé vous a été remise — ${params.productName}`,
    react: DeliveryUpdateEmail(params),
    template: "delivery-update",
    relatedOrderId: params.orderId,
  });
}

export async function sendRefundNotice(params: {
  to: string;
  clientName: string;
  productName: string;
  amount: number;
  orderId: string;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Remboursement — ${params.productName}`,
    react: RefundNoticeEmail(params),
    template: "refund-notice",
    relatedOrderId: params.orderId,
  });
}

/* ----------------------------- Devis et contact ----------------------------- */

export async function sendDevisReceived(params: {
  clientEmail: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  message: string;
  budget?: string;
}) {
  await Promise.all([
    sendEmail({
      to: { email: params.clientEmail, name: params.clientName },
      subject: `Demande de devis reçue — ${params.serviceName}`,
      react: DevisReceivedClientEmail(params),
      template: "devis-received-client",
    }),
    sendEmail({
      to: adminRecipients(),
      subject: `Nouveau devis — ${params.serviceName}`,
      react: DevisReceivedAdminEmail({
        ...params,
        clientEmail: params.clientEmail,
      }),
      template: "devis-received-admin",
      replyTo: { email: params.clientEmail, name: params.clientName },
    }),
  ]);
}

export async function sendContactMessage(params: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  await Promise.all([
    sendEmail({
      to: { email: params.email, name: params.name },
      subject: "Nous avons bien reçu votre message",
      react: ContactReceivedClientEmail({ clientName: params.name }),
      template: "contact-received-client",
    }),
    sendEmail({
      to: adminRecipients(),
      subject: `Nouveau message de ${params.name}`,
      react: ContactMessageAdminEmail({
        ...params,
        adminUrl: `${SITE.url}/admin/messages`,
      }),
      template: "contact-message-admin",
      replyTo: { email: params.email, name: params.name },
    }),
  ]);
}

/** Réponse rédigée par l'équipe (devis, message de contact). */
export async function sendAdminReply(params: {
  to: Recipient;
  subject: string;
  body: string;
  template: string;
}) {
  await sendEmail({
    to: params.to,
    subject: params.subject,
    react: AdminReplyEmail({ heading: params.subject, body: params.body }),
    template: params.template,
  });
}

/* ------------------------------- Connexion ------------------------------- */

/** Lien de connexion, de confirmation ou de réinitialisation (Brevo). */
export async function sendAuthLink(params: {
  kind: AuthLinkKind;
  to: Recipient;
  url: string;
}) {
  const subject = {
    signup: "Confirmez votre adresse email — Référence Informatique",
    magiclink: "Votre lien de connexion — Référence Informatique",
    recovery: "Réinitialiser votre mot de passe — Référence Informatique",
  }[params.kind];
  await sendEmail({
    to: params.to,
    subject,
    react: AuthLinkEmail({
      kind: params.kind,
      url: params.url,
      name: params.to.name,
    }),
    template: `auth-${params.kind}`,
    // Une réponse à ce message arrive dans la boîte de l'équipe.
    replyTo: ADMIN_REPLY_TO,
  });
}
