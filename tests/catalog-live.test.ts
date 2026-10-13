/**
 * Tests du catalogue vivant : prix et fin de promotion, priorité entre le code
 * et ce que l'équipe enregistre, et validation du contenu des produits.
 */
import "./setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_PRODUCTS } from "../lib/catalog";
import {
  mergeProduct,
  resolvePricing,
  type ProductRowRaw,
} from "../lib/catalog/live";
import {
  productCommercialSchema,
  productContentSchema,
  productSlugSchema,
} from "../lib/catalog/schema";

const NOW = new Date("2026-10-14T12:00:00Z");

function row(overrides: Partial<ProductRowRaw> = {}): ProductRowRaw {
  const base = ALL_PRODUCTS.find((p) => p.slug === "le-chercheur-augmente")!;
  return {
    slug: base.slug,
    name: base.name,
    source: "CODE",
    price: base.price,
    compareAtPrice: null,
    active: true,
    badge: null,
    promoEndsAt: null,
    content: null,
    posterUrl: null,
    displayOrder: base.order,
    adminEditedAt: "2026-10-14T10:00:00Z",
    ...overrides,
  };
}

describe("tarification et fin de promotion", () => {
  it("un prix simple reste simple", () => {
    const p = resolvePricing(6000, null, null, NOW);
    assert.equal(p.price, 6000);
    assert.equal(p.compareAtPrice, undefined);
    assert.equal(p.promoActive, false);
  });

  it("un prix barré avec une fin d'offre à venir est affiché", () => {
    const p = resolvePricing(4000, 6000, "2026-10-31T00:00:00Z", NOW);
    assert.equal(p.price, 4000);
    assert.equal(p.compareAtPrice, 6000);
    assert.equal(p.promoActive, true);
  });

  it("l'offre terminée : le prix revient au prix normal, sans remise affichée", () => {
    const p = resolvePricing(4000, 6000, "2026-10-01T00:00:00Z", NOW);
    assert.equal(p.price, 6000);
    assert.equal(p.compareAtPrice, undefined);
    assert.equal(p.promoActive, false);
  });

  it("un prix barré sans fin d'offre est une remise permanente", () => {
    const p = resolvePricing(4000, 6000, null, NOW);
    assert.equal(p.price, 4000);
    assert.equal(p.compareAtPrice, 6000);
  });

  it("un prix barré inférieur ou égal au prix est ignoré", () => {
    assert.equal(
      resolvePricing(4000, 4000, null, NOW).compareAtPrice,
      undefined,
    );
    assert.equal(
      resolvePricing(4000, 3000, null, NOW).compareAtPrice,
      undefined,
    );
  });
});

describe("priorité entre le code et l'administration", () => {
  const base = ALL_PRODUCTS.find((p) => p.slug === "le-chercheur-augmente")!;

  it("tant que l'équipe n'a rien enregistré, le code fait foi", () => {
    const merged = mergeProduct(
      base,
      row({ adminEditedAt: null, price: 1, badge: "ignoré" }),
    );
    assert.equal(merged, base);
  });

  it("après un enregistrement, le prix de la base s'applique", () => {
    const merged = mergeProduct(
      base,
      row({ price: 5000, compareAtPrice: 6500 }),
    );
    assert.equal(merged.price, 5000);
    assert.equal(merged.compareAtPrice, 6500);
    assert.equal(merged.name, base.name);
    assert.deepEqual(merged.story, base.story);
  });

  it("le badge enregistré remplace celui du code, et vide le retire", () => {
    assert.equal(
      mergeProduct(base, row({ badge: "Nouveau" })).badge,
      "Nouveau",
    );
    assert.equal(mergeProduct(base, row({ badge: null })).badge, undefined);
  });

  it("un contenu édité valide remplace le contenu du code, y compris pour effacer", () => {
    const content = {
      ...productContentSchema.parse(base),
      name: "Nouveau titre",
    };
    delete (content as { notForWho?: unknown }).notForWho;
    const merged = mergeProduct(base, row({ content }));
    assert.equal(merged.name, "Nouveau titre");
    assert.equal(merged.notForWho, undefined);
    assert.equal(merged.slug, base.slug);
  });

  it("un contenu invalide en base est ignoré : le code reprend la main", () => {
    const merged = mergeProduct(
      base,
      row({ content: { name: 12 }, price: 5200 }),
    );
    assert.equal(merged.name, base.name);
    assert.equal(merged.price, 5200);
  });
});

describe("validation de l'éditeur de produit", () => {
  it("les produits actuels du code sont tous enregistrables tels quels", () => {
    for (const product of ALL_PRODUCTS) {
      const result = productContentSchema.safeParse(product);
      assert.ok(
        result.success,
        `${product.slug} : ${result.success ? "" : JSON.stringify(result.error.issues.slice(0, 3))}`,
      );
    }
  });

  it("le prix barré doit dépasser le prix de vente", () => {
    const ok = productCommercialSchema.safeParse({
      price: 4000,
      compareAtPrice: 6000,
      promoEndsAt: "",
      badge: "",
      active: true,
      displayOrder: 3,
    });
    assert.ok(ok.success);
    const ko = productCommercialSchema.safeParse({
      price: 4000,
      compareAtPrice: 3000,
      promoEndsAt: "",
      badge: "",
      active: true,
      displayOrder: 3,
    });
    assert.equal(ko.success, false);
  });

  it("un prix n'est jamais décimal ni inférieur à 100 F", () => {
    const base = {
      compareAtPrice: "",
      promoEndsAt: "",
      badge: "",
      active: true,
      displayOrder: 0,
    };
    assert.equal(
      productCommercialSchema.safeParse({ ...base, price: 99 }).success,
      false,
    );
    assert.equal(
      productCommercialSchema.safeParse({ ...base, price: 1500.5 }).success,
      false,
    );
    assert.equal(
      productCommercialSchema.safeParse({ ...base, price: 1500 }).success,
      true,
    );
  });

  it("les adresses de produit réservées ou mal formées sont refusées", () => {
    assert.equal(productSlugSchema.safeParse("admin").success, false);
    assert.equal(productSlugSchema.safeParse("Mon Produit!").success, false);
    assert.equal(
      productSlugSchema.safeParse("mon-nouveau-guide").success,
      true,
    );
  });
});
