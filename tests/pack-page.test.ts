/**
 * Page de vente du pack Activation : ce qu'elle ne doit jamais dire, et les
 * éléments de structure dont dépendent la publicité et la barre d'achat mobile.
 * Lancer : npm test
 */
import "./setup";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { findProduct } from "../lib/catalog";

const SLUG = "pack-activation-windows11et10-et-office365-a-vie";
const ROOT = path.join(__dirname, "..");

const FILES = [
  "app/pack-activation-windows11et10-et-office365-a-vie/page.tsx",
  "components/shop/pack-purchase-card.tsx",
  "components/shop/pack-inline-cta.tsx",
  "components/shop/steps-grid.tsx",
];

/** Code de la page sans les commentaires : seuls les textes affichés comptent. */
function visibleSource(): string {
  return FILES.map((file) =>
    fs
      .readFileSync(path.join(ROOT, file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, ""),
  ).join("\n");
}

describe("page de vente du pack : mentions interdites", () => {
  const source = visibleSource();

  it("aucun numéro de l'entreprise, aucun numéro d'assistance, aucun lien WhatsApp", () => {
    assert.ok(!/75\s?78\s?97\s?37/.test(source));
    assert.ok(!/\+?226\s?66/.test(source));
    assert.ok(!/wa\.me|whatsapp\.com/i.test(source));
  });

  it("aucune limite d'appareils ni promesse de remboursement ou de garantie", () => {
    assert.ok(!/appareil/i.test(source));
    assert.ok(!/deux ordinateurs|2 ordinateurs/i.test(source));
    assert.ok(!/rembours/i.test(source));
    assert.ok(!/garanti/i.test(source));
  });

  it("aucun nom d'antivirus", () => {
    assert.ok(
      !/avast|360 total|kaspersky|norton|bitdefender|mcafee/i.test(source),
    );
  });

  it("jamais « Windows 11 » comme seule version prise en charge", () => {
    assert.ok(/Windows 10 et 11/.test(source));
    assert.ok(!/Windows 11 activé/i.test(source));
  });
});

describe("page de vente du pack : structure", () => {
  const source = visibleSource();

  it("les boutons surveillés par la barre d'achat existent", () => {
    for (const id of ["hero-cta", "description-cta", "delivery-cta"]) {
      assert.ok(
        source.includes(`"${id}"`) || source.includes(`id="${id}"`),
        `identifiant ${id} absent`,
      );
    }
  });

  it("les deux onglets restent dans la page (forceMount)", () => {
    assert.equal((source.match(/forceMount/g) ?? []).length, 2);
  });

  it("l'onglet « Avis » est absent tant qu'il n'y a pas de vrais avis", () => {
    assert.ok(!/value="avis"/.test(source));
  });

  it("la FAQ garde 3 questions", () => {
    const faq = source.match(/const FAQ[\s\S]*?\n\];/);
    assert.ok(faq);
    assert.equal((faq[0].match(/question:\s*"/g) ?? []).length, 3);
  });
});

describe("fiche catalogue du pack : référencement", () => {
  const product = findProduct(SLUG);

  it("titre et description tiennent dans les limites des moteurs de recherche", () => {
    assert.ok(product);
    assert.ok(product.seo.title.length <= 60, product.seo.title);
    assert.ok(product.seo.description.length <= 155, product.seo.description);
  });

  it("le prix de la page est celui du catalogue", () => {
    assert.ok(product);
    assert.equal(product.price, 4000);
  });
});
