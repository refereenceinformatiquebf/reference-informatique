import "server-only";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { getBrevoClient } from "./client";
import { OrderConfirmationEmail } from "./templates/order-confirmation";
import { PaymentConfirmationEmail } from "./templates/payment-confirmation";
import { AccessGrantedEmail } from "./templates/access-granted";
import { NewOrderAdminEmail } from "./templates/new-order-admin";
import {
  DevisReceivedClientEmail,
  DevisReceivedAdminEmail,
} from "./templates/devis-received";

const SENDER = {
  name: "Référence Informatique",
  email: process.env.BREVO_SENDER_EMAIL ?? "hello@reference-informatique.com",
};

const ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? "nosservicesinformatiques@gmail.com";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Point d'envoi unique. En développement (pas de clé Brevo), affiche
 * l'email dans la console plutôt que d'échouer bruyamment — voir aussi
 * /dev/emails pour un aperçu visuel complet de chaque gabarit.
 */
async function sendEmail(params: {
  to: { email: string; name?: string };
  subject: string;
  react: ReactElement;
}) {
  const html = await render(params.react);

  if (!process.env.BREVO_API_KEY) {
    console.info(
      `[email:dev] À ${params.to.email} — "${params.subject}" (BREVO_API_KEY absent, non envoyé réellement)`,
    );
    return;
  }

  await getBrevoClient().transactionalEmails.sendTransacEmail({
    sender: SENDER,
    to: [params.to],
    subject: params.subject,
    htmlContent: html,
  });
}

export async function sendOrderConfirmation(params: {
  to: string;
  clientName: string;
  productName: string;
  amount: number;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Commande reçue — ${params.productName}`,
    react: OrderConfirmationEmail(params),
  });
}

export async function sendPaymentConfirmation(params: {
  to: string;
  clientName: string;
  productName: string;
  amount: number;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Paiement confirmé — ${params.productName}`,
    react: PaymentConfirmationEmail(params),
  });
}

export async function sendAccessGranted(params: {
  to: string;
  clientName: string;
  productName: string;
}) {
  await sendEmail({
    to: { email: params.to, name: params.clientName },
    subject: `Votre formation est prête — ${params.productName}`,
    react: AccessGrantedEmail({ ...params, siteUrl: SITE_URL }),
  });
}

export async function sendNewOrderAdminNotification(params: {
  clientName: string;
  clientPhone: string;
  productName: string;
  amount: number;
  channel: "BOUTIQUE" | "WHATSAPP";
}) {
  await sendEmail({
    to: { email: ADMIN_EMAIL },
    subject: `Nouvelle commande — ${params.productName}`,
    react: NewOrderAdminEmail(params),
  });
}

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
    }),
    sendEmail({
      to: { email: ADMIN_EMAIL },
      subject: `Nouveau devis — ${params.serviceName}`,
      react: DevisReceivedAdminEmail({
        ...params,
        clientEmail: params.clientEmail,
      }),
    }),
  ]);
}
