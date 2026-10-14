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

describe("éditeur de produit : aller-retour formulaire", () => {
  it("enregistrer un produit sans rien changer ne modifie aucun de ses champs", async () => {
    const { productToForm, formToContent } =
      await import("../lib/catalog/form");
    for (const product of ALL_PRODUCTS) {
      const content = formToContent(productToForm(product), product.poster);
      const parsed = productContentSchema.safeParse(content);
      assert.ok(
        parsed.success,
        `${product.slug} : ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3))}`,
      );
      const expected = productContentSchema.parse(product);
      // Comparaison sémantique : une clé « undefined » équivaut à une clé absente.
      assert.deepEqual(
        JSON.parse(JSON.stringify(parsed.data)),
        JSON.parse(JSON.stringify(expected)),
        product.slug,
      );
    }
  });

  it("le contenu détaillé, les questions et la restriction pays survivent au formulaire", async () => {
    const { productToForm, formToContent } =
      await import("../lib/catalog/form");
    const key = ALL_PRODUCTS.find((p) => p.restrictedTo?.includes("BF"))!;
    const form = productToForm(key);
    assert.equal(form.restrictedToBF, true);
    form.restrictedToBF = false;
    assert.equal(formToContent(form, key.poster).restrictedTo, undefined);
    form.restrictedToBF = true;
    form.restrictedOther = "ci, sn";
    assert.deepEqual(formToContent(form, key.poster).restrictedTo, [
      "BF",
      "ci",
      "sn",
    ]);
  });
});

describe("envoi d'images", () => {
  it("reconnaît le vrai type d'une image, pas son extension", async () => {
    const { detectImageType } = await import("../lib/admin/uploads");
    const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]);
    const png = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0,
    ]);
    const webp = new TextEncoder().encode(
      "RIFF\u0000\u0000\u0000\u0000WEBPVP8 ",
    );
    const exe = new TextEncoder().encode(
      "MZ\u0090\u0000\u0003\u0000\u0000\u0000",
    );
    const html = new TextEncoder().encode("<html><script>alert(1)</script>");
    const svg = new TextEncoder().encode(
      "<svg xmlns='http://www.w3.org/2000/svg'></svg>",
    );
    assert.equal(detectImageType(jpeg), "jpeg");
    assert.equal(detectImageType(png), "png");
    assert.equal(detectImageType(webp), "webp");
    assert.equal(detectImageType(exe), null);
    assert.equal(detectImageType(html), null);
    assert.equal(detectImageType(svg), null);
    assert.equal(detectImageType(new Uint8Array()), null);
  });
});

describe("date de fin d'offre", () => {
  it("la saisie est interprétée en UTC, quel que soit le fuseau de la machine", () => {
    const parsed = productCommercialSchema.parse({
      price: 4000,
      compareAtPrice: 6000,
      promoEndsAt: "2026-10-31T23:59",
      badge: "",
      active: true,
      displayOrder: 0,
    });
    assert.equal(parsed.promoEndsAt?.toISOString(), "2026-10-31T23:59:00.000Z");
    const none = productCommercialSchema.parse({
      price: 4000,
      compareAtPrice: "",
      promoEndsAt: "",
      badge: "",
      active: true,
      displayOrder: 0,
    });
    assert.equal(none.promoEndsAt, null);
  });
});

describe("formulaire de service", () => {
  it("tous les services actuels du catalogue sont enregistrables tels quels", async () => {
    const { serviceFormSchema } = await import("../lib/catalog/service-schema");
    const { ALL_SERVICES } = await import("../lib/catalog");
    for (const service of ALL_SERVICES) {
      const result = serviceFormSchema.safeParse({
        slug: service.slug,
        name: service.name,
        summary: service.summary,
        tagline: service.tagline,
        priceType: service.priceType,
        priceFrom: service.priceFrom ?? "",
        priceNote: service.priceNote,
        timeline: service.timeline,
        active: true,
        displayOrder: service.order,
      });
      assert.ok(
        result.success,
        `${service.slug} : ${result.success ? "" : JSON.stringify(result.error.issues.slice(0, 2))}`,
      );
    }
  });
});
