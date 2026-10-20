/**
 * Tests de la décision « à quelle commande rattacher la licence d'un client en attente ».
 * Lancer : npm test
 */
import "./setup";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chooseFulfilmentOrder } from "../lib/licences/plan";

const stocked = {
  licenseKey: "KEY-A",
  installerUrl: "https://exemple.test/app.exe",
};

describe("livraison d'une licence en attente", () => {
  it("ne livre rien sans commande payée (accès accordé à la main)", () => {
    assert.deepEqual(chooseFulfilmentOrder([]), { kind: "none" });
  });

  it("prélève une licence pour la plus ancienne commande payée", () => {
    assert.deepEqual(
      chooseFulfilmentOrder([
        { id: "commande-1", stock: null },
        { id: "commande-2", stock: null },
      ]),
      { kind: "claim", orderId: "commande-1" },
    );
  });

  it("remet la licence déjà prélevée plutôt que d'en consommer une autre", () => {
    assert.deepEqual(
      chooseFulfilmentOrder([
        { id: "commande-1", stock: null },
        { id: "commande-2", stock: stocked },
      ]),
      { kind: "reuse", licence: stocked },
    );
  });
});
