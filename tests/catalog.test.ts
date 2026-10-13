/**
 * Tests du catalogue et de l'accès par pays.
 * Lancer : npm test   (runner natif de Node, aucune dépendance en plus)
 *
 * Ils protègent les règles qu'on ne doit JAMAIS casser sans s'en apercevoir :
 *  - les clés de formations ne sont visibles / achetables qu'au Burkina Faso ;
 *  - un pays inconnu est traité comme étranger (échec fermé) ;
 *  - le plan du site ne révèle pas les offres réservées ;
 *  - le catalogue est cohérent (slugs uniques, prix, remises, textes).
 */
import "./setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALL_PRODUCTS,
  ALL_SERVICES,
  ALL_SERVICE_FAMILIES,
  discountPercent,
  findProduct,
  findVisibleProduct,
  isProductAvailable,
  relatedProducts,
  visibleProducts,
} from "../lib/catalog";
import sitemap from "../app/sitemap";
import { fr } from "../lib/typography";

const KEYS = ALL_PRODUCTS.filter((p) => p.kind === "cle");
const NBSP = " ";

describe("accès par pays", () => {
  it("les 4 clés de formations existent et sont réservées au Burkina Faso", () => {
    assert.equal(KEYS.length, 4);
    for (const key of KEYS) {
      assert.deepEqual(key.restrictedTo, ["BF"], key.slug);
    }
  });

  it("un visiteur du Burkina Faso voit tout le catalogue", () => {
    assert.equal(visibleProducts("BF").length, ALL_PRODUCTS.length);
  });

  it("un visiteur étranger ne voit aucune clé", () => {
    for (const country of ["FR", "CI", "SN", "US", "BJ"]) {
      const visible = visibleProducts(country);
      assert.equal(visible.filter((p) => p.kind === "cle").length, 0, country);
      assert.equal(visible.length, ALL_PRODUCTS.length - KEYS.length, country);
    }
  });

  it("pays inconnu (null) = traité comme étranger : échec fermé", () => {
    for (const key of KEYS) assert.equal(isProductAvailable(key, null), false);
    assert.equal(
      visibleProducts(null).filter((p) => p.kind === "cle").length,
      0,
    );
  });

  it("une fiche de clé est introuvable hors du Burkina Faso", () => {
    for (const key of KEYS) {
      assert.ok(findVisibleProduct(key.slug, "BF"), key.slug);
      assert.equal(findVisibleProduct(key.slug, "FR"), undefined, key.slug);
      assert.equal(findVisibleProduct(key.slug, null), undefined, key.slug);
    }
  });

  it("les produits sans restriction restent accessibles partout", () => {
    const open = ALL_PRODUCTS.filter((p) => !p.restrictedTo);
    assert.ok(open.length >= 10);
    for (const product of open) {
      assert.equal(isProductAvailable(product, "FR"), true, product.slug);
      assert.equal(isProductAvailable(product, null), true, product.slug);
    }
  });

  it("les suggestions n'exposent jamais une clé à un visiteur étranger", () => {
    for (const product of ALL_PRODUCTS) {
      if (!isProductAvailable(product, "FR")) continue;
      const related = relatedProducts(product, "FR", 6);
      assert.equal(
        related.filter((p) => p.kind === "cle").length,
        0,
        product.slug,
      );
    }
  });

  it("le plan du site ne mentionne aucune clé", async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    for (const key of KEYS) {
      assert.equal(
        urls.some((url) => url.includes(key.slug)),
        false,
        key.slug,
      );
    }
    assert.ok(urls.some((url) => url.endsWith("/boutique")));
  });
});

describe("intégrité du catalogue", () => {
  it("les slugs de produits sont uniques", () => {
    const slugs = ALL_PRODUCTS.map((p) => p.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("les slugs de services sont uniques et rattachés à une famille existante", () => {
    const slugs = ALL_SERVICES.map((s) => s.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    const families = new Set(ALL_SERVICE_FAMILIES.map((f) => f.slug));
    for (const service of ALL_SERVICES) {
      assert.ok(families.has(service.family), service.slug);
    }
  });

  it("chaque produit a un prix entier positif et une remise cohérente", () => {
    for (const product of ALL_PRODUCTS) {
      assert.ok(
        Number.isInteger(product.price) && product.price > 0,
        product.slug,
      );
      if (product.compareAtPrice !== undefined) {
        assert.ok(product.compareAtPrice > product.price, product.slug);
        const percent = discountPercent(product);
        assert.ok(
          percent !== null && percent > 0 && percent < 100,
          product.slug,
        );
      }
    }
  });

  it("le prix de référence de la clé Tout-en-Un est la somme des deux clés", () => {
    const sum =
      (findProduct("cle-formations-completes")?.price ?? 0) +
      (findProduct("cle-formations-smart")?.price ?? 0);
    assert.equal(findProduct("cle-tout-en-un")?.compareAtPrice, sum);
  });

  it("chaque produit est complet (récit, points forts, FAQ, SEO)", () => {
    for (const product of ALL_PRODUCTS) {
      assert.ok(product.story.length >= 2, `${product.slug} : récit`);
      assert.ok(
        product.highlights.length >= 4,
        `${product.slug} : points forts`,
      );
      assert.ok(product.faq.length >= 3, `${product.slug} : FAQ`);
      assert.ok(product.forWho.length >= 2, `${product.slug} : public`);
      assert.ok(product.seo.title.length > 10, `${product.slug} : titre SEO`);
      assert.ok(
        product.seo.description.length >= 60 &&
          product.seo.description.length <= 200,
        `${product.slug} : description SEO (${product.seo.description.length} car.)`,
      );
    }
  });

  it("les clés ont une affiche réelle, les autres produits une couverture générée", () => {
    for (const product of ALL_PRODUCTS) {
      if (product.kind === "cle") assert.ok(product.poster, product.slug);
      else assert.equal(product.poster, undefined, product.slug);
    }
  });

  it("chaque prestation répond à « Vous vous reconnaissez ? » et détaille ses livrables", () => {
    for (const service of ALL_SERVICES) {
      assert.equal(
        service.problem.points.length,
        3,
        `${service.slug} : situation`,
      );
      assert.ok(
        service.deliverables.length >= 3,
        `${service.slug} : livrables`,
      );
      assert.equal(service.process.length, 4, `${service.slug} : étapes`);
      assert.ok(service.faq.length >= 3, `${service.slug} : FAQ`);
      if (service.priceType !== "QUOTE") {
        assert.ok(
          service.priceFrom && service.priceFrom > 0,
          `${service.slug} : prix`,
        );
      }
    }
  });

  it("aucun produit ne reprend les offres écartées (activation de licence, Sage i7)", () => {
    const text = JSON.stringify([
      ...ALL_PRODUCTS,
      ...ALL_SERVICES,
    ]).toLowerCase();
    assert.equal(text.includes("activation à vie"), false);
    assert.equal(text.includes("sage 100"), false);
    assert.equal(text.includes("fedapay"), false);
  });

  it("aucun emoji dans les contenus", () => {
    const text = JSON.stringify([
      ...ALL_PRODUCTS,
      ...ALL_SERVICES,
      ...ALL_SERVICE_FAMILIES,
    ]);
    assert.equal(/\p{Extended_Pictographic}/u.test(text), false);
  });
});

describe("typographie française", () => {
  it("place une espace insécable avant « : ; ! ? » et dans les nombres", () => {
    assert.equal(fr("Vraiment ?"), `Vraiment${NBSP}?`);
    assert.equal(fr("Attention : prix"), `Attention${NBSP}: prix`);
    assert.equal(fr("12 000 F CFA"), `12${NBSP}000${NBSP}F${NBSP}CFA`);
    assert.equal(fr("-52 %"), `-52${NBSP}%`);
  });

  it("utilise l'apostrophe typographique", () => {
    assert.equal(fr("l'offre"), "l’offre");
  });

  it("le catalogue est passé dans la typographie (pas d'espace avant « ? » ordinaire)", () => {
    const text = JSON.stringify(ALL_PRODUCTS);
    assert.equal(/ \?/.test(text), false);
  });
});
