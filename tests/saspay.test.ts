/**
 * Tests de la sécurité des paiements SasPay : vérification de la signature
 * des webhooks (un faux webhook ne doit JAMAIS pouvoir marquer une commande
 * payée) et lecture du statut d'une session.
 * Lancer : npm test
 */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { before, describe, it } from "node:test";
import {
  constructSaspayEvent,
  isSaspaySessionPaid,
  SaspayWebhookSignatureError,
} from "../lib/payments/saspay";

const SECRET = "whsec_test_secret";
const body = JSON.stringify({
  event: "transaction.success",
  data: { id: "tx-1", status: "SUCCESS", amount: "5000.00" },
});

const sign = (timestamp: string, payload: string, secret = SECRET) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");
const now = () => String(Math.floor(Date.now() / 1000));
const offset = (seconds: number) =>
  String(Math.floor(Date.now() / 1000) + seconds);

before(() => {
  process.env.SASPAY_WEBHOOK_SECRET = SECRET;
});

describe("signature des webhooks SasPay", () => {
  it("accepte une signature valide et décode l'événement", () => {
    const ts = now();
    const event = constructSaspayEvent(body, sign(ts, body), ts);
    assert.equal(event.event, "transaction.success");
    assert.equal(event.data.id, "tx-1");
  });

  it("accepte la signature en majuscules (casse indifférente)", () => {
    const ts = now();
    assert.equal(
      constructSaspayEvent(body, sign(ts, body).toUpperCase(), ts).event,
      "transaction.success",
    );
  });

  const rejected: [string, () => unknown][] = [
    [
      "mauvais secret",
      () => constructSaspayEvent(body, sign(now(), body, "autre"), now()),
    ],
    [
      "corps modifié (montant falsifié)",
      () => {
        const ts = now();
        return constructSaspayEvent(
          body.replace("5000", "1"),
          sign(ts, body),
          ts,
        );
      },
    ],
    [
      "horodatage modifié",
      () => {
        const ts = now();
        return constructSaspayEvent(
          body,
          sign(ts, body),
          String(Number(ts) + 1),
        );
      },
    ],
    [
      "rejeu d'un webhook vieux de 10 minutes",
      () => {
        const ts = offset(-600);
        return constructSaspayEvent(body, sign(ts, body), ts);
      },
    ],
    [
      "horodatage dans le futur",
      () => {
        const ts = offset(600);
        return constructSaspayEvent(body, sign(ts, body), ts);
      },
    ],
    [
      "horodatage illisible",
      () => constructSaspayEvent(body, sign(now(), body), "abc"),
    ],
    [
      "signature de longueur différente",
      () => constructSaspayEvent(body, "abc", now()),
    ],
    ["signature vide", () => constructSaspayEvent(body, "", now())],
  ];

  for (const [name, attempt] of rejected) {
    it(`rejette : ${name}`, () => {
      assert.throws(attempt, SaspayWebhookSignatureError);
    });
  }
});

describe("statut d'une session SasPay", () => {
  it("payée = session PAID sans échec de transaction", () => {
    assert.equal(
      isSaspaySessionPaid({
        status: "PAID",
        transactionId: "t",
        transactionStatus: "SUCCESS",
      }),
      true,
    );
  });

  it("jamais payée tant que la session est en attente ou échouée", () => {
    assert.equal(
      isSaspaySessionPaid({
        status: "PENDING",
        transactionId: null,
        transactionStatus: null,
      }),
      false,
    );
    assert.equal(
      isSaspaySessionPaid({
        status: "PAID",
        transactionId: "t",
        transactionStatus: "FAILED",
      }),
      false,
    );
    assert.equal(
      isSaspaySessionPaid({
        status: "CANCELLED",
        transactionId: null,
        transactionStatus: null,
      }),
      false,
    );
  });
});
