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

describe("coordonnées de l'entreprise dans le pied de page", () => {
  it("masquées sur la page de réception d'un pack, visibles ailleurs", () => {
    assert.equal(
      hidesCompanyContact(
        "/espace-client/licences/pack-activation-windows11et10-et-office365-a-vie",
      ),
      true,
    );
    for (const path of [
      "/",
      "/contact",
      "/espace-client",
      "/espace-client/formations/x",
      "/boutique",
    ]) {
      assert.equal(hidesCompanyContact(path), false, path);
    }
  });
});
