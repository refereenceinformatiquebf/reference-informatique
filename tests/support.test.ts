/**
 * Tests de l'assistance WhatsApp de la page de réception du pack.
 * Lancer : npm test
 */
import "./setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_WHATSAPP,
  supportMessage,
  supportOrderMessage,
  supportPaidFromSalesPageMessage,
  supportPayOnWhatsappMessage,
  supportWhatsappLink,
} from "../lib/support";
import { hidesCompanyContact } from "../lib/focus";
import { SITE } from "../lib/site";

describe("assistance WhatsApp du pack", () => {
  it("écrit au numéro d'assistance dédié, pas au numéro général du site", () => {
    assert.equal(SUPPORT_WHATSAPP, "22666233733");
    assert.notEqual(SUPPORT_WHATSAPP, SITE.whatsapp);
    assert.equal(SUPPORT_PHONE_DISPLAY.replace(/ /g, " "), "+226 66 23 37 33");
    assert.ok(
      supportWhatsappLink("x").startsWith("https://wa.me/22666233733?text="),
    );
  });

  it("préremplit le message avec le nom et la date d'achat", () => {
    assert.equal(
      supportMessage("Awa Traoré", "19 octobre 2026"),
      "Bonjour, je suis Awa Traoré, j'ai payé mon pack avec Référence Informatique le 19 octobre 2026, j'ai besoin de votre assistance.",
    );
  });

  it("reste lisible sans nom", () => {
    assert.equal(
      supportMessage("  ", "19 octobre 2026"),
      "Bonjour, j'ai payé mon pack avec Référence Informatique le 19 octobre 2026, j'ai besoin de votre assistance.",
    );
  });

  it("encode le message pour l'adresse WhatsApp (accents, apostrophes, virgules)", () => {
    const href = supportWhatsappLink(
      supportMessage("Awa Traoré", "19 octobre 2026"),
    );
    const text = new URL(href).searchParams.get("text");
    assert.equal(text, supportMessage("Awa Traoré", "19 octobre 2026"));
    assert.ok(!href.includes(" "));
  });
});

describe("messages d'assistance de la commande et de la page de vente", () => {
  const order = {
    name: "Awa Traoré",
    phone: "+226 70 12 34 56",
    email: "awa@exemple.com",
    productName: "Pack Activation Windows 10/11 + Office 365 à vie",
    priceLabel: "4 000 F CFA",
    orderId: "cm123",
  };

  it("reprend le message des relances et ajoute les coordonnées saisies", () => {
    assert.equal(
      supportOrderMessage(order),
      [
        "Bonjour, j'ai commencé la commande de mon pack avec Référence Informatique, j'ai besoin de votre assistance pour finaliser mon paiement.",
        "Nom : Awa Traoré",
        "WhatsApp : +226 70 12 34 56",
        "Email : awa@exemple.com",
        "Pack : Pack Activation Windows 10/11 + Office 365 à vie (4 000 F CFA)",
        "Référence de commande : cm123",
      ].join("\n"),
    );
  });

  it("omet les champs vides et remplace les espaces insécables du prix", () => {
    const message = supportOrderMessage({
      ...order,
      name: " ",
      phone: null,
      email: undefined,
      priceLabel: "4 000 F CFA",
    });
    assert.ok(!message.includes("Nom :"));
    assert.ok(!message.includes("WhatsApp :"));
    assert.ok(!message.includes("Email :"));
    assert.ok(message.includes("(4 000 F CFA)"));
    assert.ok(!/[  ]/.test(message));
    assert.ok(message.includes("Référence de commande : cm123"));
  });

  it("laisse à compléter le nom et l'email d'un visiteur non identifié", () => {
    assert.equal(
      supportPaidFromSalesPageMessage(null),
      "Bonjour, j'ai payé mon pack avec Référence Informatique, j'ai besoin de votre assistance.\nMon nom : \nEmail utilisé pour la commande : ",
    );
    assert.equal(
      supportPayOnWhatsappMessage(order.productName, "4 000 F CFA", "Awa"),
      "Bonjour, je souhaite payer mon Pack Activation Windows 10/11 + Office 365 à vie (4 000 F CFA) sur WhatsApp.\nMon nom : Awa\nMon email (pour recevoir le pack) : ",
    );
  });

  it("garde les retours à la ligne dans l'adresse WhatsApp", () => {
    const text = new URL(
      supportWhatsappLink(supportOrderMessage(order)),
    ).searchParams.get("text");
    assert.equal(text, supportOrderMessage(order));
    assert.ok(text?.includes("\n"));
  });
});

describe("coordonnées de l'entreprise dans le pied de page", () => {
  it("masquées sur tout le parcours client après achat", () => {
    for (const path of [
      "/espace-client",
      "/espace-client/licences/pack-activation-windows11et10-et-office365-a-vie",
      "/espace-client/formations/x",
      "/commande/retour",
      "/commande/suivi",
      "/commande/suivi/un-jeton",
      "/guide-activation",
    ]) {
      assert.equal(hidesCompanyContact(path), true, path);
    }
  });

  it("visibles sur les pages publiques du site", () => {
    for (const path of [
      "/",
      "/contact",
      "/boutique",
      "/faq",
      "/a-propos",
      "/services",
    ]) {
      assert.equal(hidesCompanyContact(path), false, path);
    }
  });
});
