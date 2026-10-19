/**
 * Tests du pixel Meta : pages où il ne se charge jamais, et paramètres envoyés.
 * Lancer : npm test
 */
import "./setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isTrackablePath,
  productParams,
  trackMeta,
  META_PIXEL_ID,
} from "../lib/meta-pixel";

describe("pages où le pixel Meta se charge", () => {
  it("couvre les pages publiques, la vente, la commande et le retour de paiement", () => {
    for (const path of [
      "/",
      "/boutique",
      "/boutique/le-chercheur-augmente",
      "/pack-activation-windows11et10-et-office365-a-vie",
      "/commande/pack-activation-windows11et10-et-office365-a-vie",
      "/commande/retour",
      "/services/conception-web",
      "/politique-de-confidentialite",
    ]) {
      assert.equal(isTrackablePath(path), true, path);
    }
  });

  it("ne se charge jamais sur les zones privées ni sur les adresses à jeton", () => {
    for (const path of [
      "/admin",
      "/admin/commandes/abc",
      "/espace-client",
      "/espace-client/licences/pack-activation-windows11et10-et-office365-a-vie",
      "/auth/confirm",
      "/connexion",
      "/inscription",
      "/mot-de-passe-oublie",
      "/reinitialiser-mot-de-passe",
      "/commande/suivi",
      "/commande/suivi/un-jeton-d-acces-prive",
      "/dev/emails",
      "/api/webhooks/saspay",
    ]) {
      assert.equal(isTrackablePath(path), false, path);
    }
  });

  it("ne confond pas une page publique avec un préfixe exclu", () => {
    assert.equal(isTrackablePath("/administration-systemes"), true);
    assert.equal(isTrackablePath("/connexions-internet"), true);
  });
});

describe("événements du pixel Meta", () => {
  it("décrit un produit avec son identifiant, son prix et la devise du site", () => {
    assert.deepEqual(
      productParams({ slug: "mon-produit", name: "Mon produit", price: 4000 }),
      {
        content_ids: ["mon-produit"],
        content_name: "Mon produit",
        content_type: "product",
        value: 4000,
        currency: "XOF",
      },
    );
  });

  it("n'envoie rien (et ne plante pas) sans navigateur ni identifiant de pixel", () => {
    assert.doesNotThrow(() => trackMeta("ViewContent", {}));
    assert.doesNotThrow(() => trackMeta("Purchase", {}, "id-de-commande"));
    // Tant qu'aucun identifiant n'est renseigné, le pixel est inerte.
    if (!META_PIXEL_ID) assert.equal(typeof window, "undefined");
  });
});
