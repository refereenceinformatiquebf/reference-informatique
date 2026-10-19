/**
 * Commande sans compte : règles pures (jetons, durée de validité, aides à la
 * saisie, coordonnées de l'acheteur). Les parcours complets (paiement, lien
 * reçu par email, accès à l'achat) sont vérifiés par les scripts de bout en
 * bout, car ils demandent la base et le navigateur.
 */
import "./setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACCESS_LINK_TTL_DAYS,
  accessDestination,
  accessLinkExpired,
  isAccessTokenShape,
  isOrderIdShape,
  maskEmail,
  phoneRequired,
  suggestEmail,
} from "../lib/checkout/rules";
import { newAccessToken } from "../lib/checkout/access";
import { buyerSchema } from "../lib/validations/order";
import { ALL_PRODUCTS, isProductAvailable } from "../lib/catalog";
import { rankRecommendations } from "../lib/catalog/recommendations";

const DAY = 24 * 60 * 60 * 1000;

describe("jeton d'accès", () => {
  it("est long, aléatoire et unique", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => newAccessToken()));
    assert.equal(tokens.size, 200);
    for (const token of tokens) assert.ok(isAccessTokenShape(token), token);
  });

  it("refuse toute valeur qui n'a pas la bonne forme", () => {
    for (const bad of [
      "",
      "abc",
      "a".repeat(42),
      "a".repeat(44),
      `${"a".repeat(42)}!`,
      `${"a".repeat(42)} `,
      "../../etc/passwd",
      undefined,
      null,
      42,
    ]) {
      assert.equal(isAccessTokenShape(bad), false, String(bad));
    }
  });
});

describe("identifiant de commande", () => {
  it("accepte un UUID et refuse le reste (évite une erreur SQL)", () => {
    assert.ok(isOrderIdShape("0b1f3a00-1565-4c00-8b00-0123456789ab"));
    for (const bad of ["", "abc", "0b1f3a00", "' OR 1=1 --", undefined, 7]) {
      assert.equal(isOrderIdShape(bad), false, String(bad));
    }
  });
});

describe("validité du lien personnel", () => {
  const created = new Date("2026-01-01T00:00:00Z");
  const now = (days: number) => new Date(created.getTime() + days * DAY);

  it("dure 90 jours à partir du paiement", () => {
    assert.equal(ACCESS_LINK_TTL_DAYS, 90);
    const order = { createdAt: created, paidAt: created };
    assert.equal(accessLinkExpired(order, now(89)), false);
    assert.equal(accessLinkExpired(order, now(91)), true);
  });

  it("se compte depuis le paiement, pas depuis la création", () => {
    const order = {
      createdAt: created,
      paidAt: new Date(created.getTime() + 60 * DAY),
    };
    assert.equal(accessLinkExpired(order, now(120)), false);
    assert.equal(accessLinkExpired(order, now(151)), true);
  });

  it("se compte depuis la création tant que la commande n'est pas payée", () => {
    const order = { createdAt: created, paidAt: null };
    assert.equal(accessLinkExpired(order, now(10)), false);
    assert.equal(accessLinkExpired(order, now(100)), true);
  });
});

describe("destination après « Accéder à mon achat »", () => {
  it("emmène sur la bonne rubrique", () => {
    assert.equal(
      accessDestination("numerique", "le-chercheur-augmente"),
      "/espace-client/formations/le-chercheur-augmente",
    );
    assert.equal(
      accessDestination("licence-edn", "licence-expert"),
      "/espace-client/licences/licence-expert",
    );
    assert.equal(
      accessDestination("cle-physique", "cle-x"),
      "/espace-client?onglet=commandes",
    );
    assert.equal(
      accessDestination("manuel", "performance-pc"),
      "/espace-client",
    );
    assert.equal(accessDestination(undefined, undefined), "/espace-client");
  });

  it("ne renvoie jamais une adresse externe", () => {
    for (const delivery of ["numerique", "licence-edn", "manuel"] as const) {
      assert.ok(accessDestination(delivery, "x").startsWith("/espace-client"));
    }
  });
});

describe("téléphone", () => {
  it("est obligatoire quand l'équipe doit joindre ou assister le client", () => {
    assert.equal(phoneRequired("cle-physique"), true);
    assert.equal(phoneRequired("manuel"), true);
    assert.equal(phoneRequired("licence-edn"), true);
  });

  it("reste facultatif pour une formation en ligne", () => {
    assert.equal(phoneRequired("numerique"), false);
  });
});

describe("aides à la saisie de l'email", () => {
  it("repère les fautes de frappe courantes", () => {
    assert.equal(suggestEmail("moussa@gmial.com"), "moussa@gmail.com");
    assert.equal(suggestEmail("Awa.Traore@Gmai.com"), "awa.traore@gmail.com");
    assert.equal(suggestEmail("a@hotmial.com"), "a@hotmail.com");
    assert.equal(suggestEmail("a@yaho.com"), "a@yahoo.com");
    assert.equal(suggestEmail("a@gmail.con"), "a@gmail.com");
  });

  it("ne propose rien pour une adresse correcte ou inconnue", () => {
    for (const ok of [
      "moussa@gmail.com",
      "x@entreprise.bf",
      "x@yahoo.fr",
      "pas-un-email",
      "",
      "@gmial.com",
    ]) {
      assert.equal(suggestEmail(ok), null, ok);
    }
  });

  it("masque l'adresse sans la révéler en entier", () => {
    assert.equal(maskEmail("jean.dupont@gmail.com"), "j***@gmail.com");
    assert.equal(maskEmail("a@b.com"), "a***@b.com");
    assert.equal(maskEmail("pas-un-email"), "votre adresse email");
    assert.ok(!maskEmail("jean.dupont@gmail.com").includes("dupont"));
  });
});

describe("coordonnées de l'acheteur", () => {
  const valid = { name: "Awa Traoré", email: "awa@gmail.com", phone: "" };

  it("accepte nom + email, le téléphone restant facultatif", () => {
    assert.ok(buyerSchema.safeParse(valid).success);
    assert.ok(
      buyerSchema.safeParse({ ...valid, phone: "+226 70 12 34 56" }).success,
    );
  });

  it("nettoie les espaces autour du nom et de l'email", () => {
    const parsed = buyerSchema.parse({
      name: "  Awa Traoré ",
      email: "  awa@gmail.com ",
      phone: " 70123456 ",
    });
    assert.equal(parsed.name, "Awa Traoré");
    assert.equal(parsed.email, "awa@gmail.com");
    assert.equal(parsed.phone, "70123456");
  });

  it("refuse un nom vide, un email faux et un numéro trop court", () => {
    assert.equal(buyerSchema.safeParse({ ...valid, name: " " }).success, false);
    assert.equal(
      buyerSchema.safeParse({ ...valid, email: "awa@gmail" }).success,
      false,
    );
    assert.equal(
      buyerSchema.safeParse({ ...valid, email: "pas un email" }).success,
      false,
    );
    assert.equal(
      buyerSchema.safeParse({ ...valid, phone: "123" }).success,
      false,
    );
  });

  it("refuse les valeurs démesurées", () => {
    assert.equal(
      buyerSchema.safeParse({ ...valid, name: "x".repeat(101) }).success,
      false,
    );
    assert.equal(
      buyerSchema.safeParse({ ...valid, email: `${"a".repeat(200)}@b.co` })
        .success,
      false,
    );
  });
});

describe("recommandations", () => {
  const bySlug = (slug: string) => ALL_PRODUCTS.find((p) => p.slug === slug)!;
  const visibleBF = ALL_PRODUCTS.filter((p) => isProductAvailable(p, "BF"));

  it("ne propose jamais un produit déjà acheté", () => {
    const owned = [bySlug("le-chercheur-augmente"), bySlug("cle-enfants")];
    const picks = rankRecommendations(owned, visibleBF, 6);
    for (const product of owned) {
      assert.ok(!picks.some((p) => p.slug === product.slug), product.slug);
    }
  });

  it("respecte la limite demandée et ne répète rien", () => {
    const picks = rankRecommendations([], visibleBF, 3);
    assert.equal(picks.length, 3);
    assert.equal(new Set(picks.map((p) => p.slug)).size, 3);
  });

  it("propose autre chose qu'une seconde clé à l'acheteur d'une clé", () => {
    const picks = rankRecommendations([bySlug("cle-enfants")], visibleBF, 3);
    assert.ok(picks.length > 0);
    assert.ok(picks.every((p) => p.kind !== "cle"));
  });

  it("ne propose jamais une offre réservée à un autre pays", () => {
    const visibleFR = ALL_PRODUCTS.filter((p) => isProductAvailable(p, "FR"));
    const picks = rankRecommendations([], visibleFR, 20);
    assert.ok(picks.every((p) => !p.restrictedTo));
  });

  it("privilégie la famille déjà achetée", () => {
    const owned = [bySlug("le-chercheur-augmente")];
    const picks = rankRecommendations(owned, visibleBF, 1);
    assert.equal(picks[0]?.kind, "ebook");
  });
});
