/**
 * Rend un modèle d'e-mail en HTML. Lancé dans un processus à part (sans la
 * condition « react-server » du lanceur de tests, qui interdit react-dom/server).
 * Usage : node --import tsx tests/helpers/render-email.ts <Modèle> '<propriétés en JSON>'
 */
import { createElement } from "react";
import { render } from "@react-email/render";
import { PaymentConfirmationEmail } from "../../lib/email/templates/payment-confirmation";
import { PaymentReminderEmail } from "../../lib/email/templates/payment-reminder";
import { LicenceReadyEmail } from "../../lib/email/templates/licence-ready";
import { RefundNoticeEmail } from "../../lib/email/templates/refund-notice";
import { OrderLinksEmail } from "../../lib/email/templates/order-links";

const TEMPLATES = {
  PaymentConfirmationEmail,
  PaymentReminderEmail,
  LicenceReadyEmail,
  RefundNoticeEmail,
  OrderLinksEmail,
} as const;

async function main() {
  const [name, json] = process.argv.slice(2);
  const template = TEMPLATES[name as keyof typeof TEMPLATES];
  if (!template) throw new Error(`Modèle inconnu : ${name}`);
  const html = await render(createElement(template as never, JSON.parse(json)));
  process.stdout.write(html);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
