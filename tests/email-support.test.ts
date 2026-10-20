/**
 * Le client du pack ne voit que le numéro d'assistance dédié dans ses e-mails ;
 * les autres clients gardent le numéro général du site.
 * Lancer : npm test
 */
import "./setup";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { SUPPORT_WHATSAPP } from "../lib/support";
import { SITE } from "../lib/site";

const HELPER = path.join(__dirname, "helpers", "render-email.ts");

/** HTML de l'e-mail, espaces insécables ramenés à des espaces simples. */
function html(template: string, props: Record<string, unknown>): string {
  return execFileSync(
    process.execPath,
    ["--import", "tsx", HELPER, template, JSON.stringify(props)],
    { encoding: "utf8", env: { ...process.env, NODE_OPTIONS: "" } },
  ).replace(/ |&nbsp;/g, " ");
}

const COMPANY_DIGITS = SITE.whatsapp;
const COMPANY_SPACED = SITE.phoneDisplay.replace(/ /g, " ");

function assertPackSupport(page: string) {
  assert.ok(
    page.includes(`wa.me/${SUPPORT_WHATSAPP}`),
    "lien d'assistance absent",
  );
  assert.ok(page.includes("+226 66 23 37 33"), "numéro d'assistance absent");
  assert.ok(
    !page.includes(COMPANY_DIGITS),
    "le numéro général apparaît dans le lien",
  );
  assert.ok(
    !page.includes(COMPANY_SPACED),
    "le numéro général apparaît dans le texte",
  );
}

function assertCompanyContact(page: string) {
  assert.ok(page.includes(`wa.me/${COMPANY_DIGITS}`));
  assert.ok(!page.includes(SUPPORT_WHATSAPP));
}

const base = {
  clientName: "Awa Traoré",
  productName: "Pack Activation Windows 10/11 + Office 365 à vie",
  amount: 4000,
};

describe("e-mails du pack : uniquement l'assistance dédiée", () => {
  it("confirmation de paiement d'un produit livré par licence", () => {
    assertPackSupport(
      html("PaymentConfirmationEmail", {
        ...base,
        delivery: "licence-edn",
        ctaUrl: "https://exemple.test/lien",
        licenceKey: "KEY",
      }),
    );
  });

  it("relance de paiement, remboursement et « licence prête »", () => {
    assertPackSupport(
      html("PaymentReminderEmail", {
        ...base,
        trackUrl: "https://exemple.test",
        licence: true,
      }),
    );
    assertPackSupport(html("RefundNoticeEmail", { ...base, licence: true }));
    assertPackSupport(
      html("LicenceReadyEmail", { ...base, ctaUrl: "https://exemple.test" }),
    );
  });

  it("« retrouver ma commande » dès qu'une commande est un pack", () => {
    const item = {
      productName: "Pack",
      amount: 4000,
      paid: true,
      url: "https://exemple.test",
    };
    assertPackSupport(
      html("OrderLinksEmail", { items: [{ ...item, licence: true }] }),
    );
    assertCompanyContact(html("OrderLinksEmail", { items: [item] }));
  });
});

describe("e-mails des autres produits : numéro général inchangé", () => {
  it("formation en ligne, relance et remboursement ordinaires", () => {
    assertCompanyContact(
      html("PaymentConfirmationEmail", {
        ...base,
        delivery: "numerique",
        ctaUrl: "https://exemple.test/lien",
      }),
    );
    assertCompanyContact(
      html("PaymentReminderEmail", {
        ...base,
        trackUrl: "https://exemple.test",
      }),
    );
    assertCompanyContact(html("RefundNoticeEmail", base));
  });
});
