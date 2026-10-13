import "server-only";
import crypto from "node:crypto";

/**
 * Intégration SasPay (https://docs.saspay.me) via appels REST directs.
 *
 * Flux retenu : checkout hébergé. On crée une « session de checkout », on
 * redirige le client vers `checkout_url`, il choisit son réseau (Orange
 * Money, Moov Money, carte…) sur la page SasPay. Aucune donnée de paiement
 * ne transite par notre serveur.
 *
 * Particularité à connaître : le webhook `transaction.success` ne contient
 * NI notre orderId NI l'id de la session. On ne peut donc pas retrouver la
 * commande depuis le webhook seul — on la retrouve via la session stockée
 * sur l'Order (`providerSessionId`) et on revérifie son statut auprès de
 * SasPay (lib/payments/saspay-sync.ts). Le webhook sert de déclencheur, la
 * vérité vient toujours de l'API.
 */

const BASE_URL = "https://api.saspay.me/api/v1";

function getSecretKey() {
  const key = process.env.SASPAY_SECRET_KEY;
  if (!key) {
    throw new Error("SASPAY_SECRET_KEY manquant — voir .env.example.");
  }
  return key;
}

/**
 * Les réponses sont enveloppées ({ success, data, code }) ; la doc
 * OpenAPI en montre aussi sans enveloppe. On accepte les deux plutôt que
 * de casser le paiement sur une différence de présentation.
 */
function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "success" in body && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function saspayFetch<T>(
  path: string,
  init: RequestInit & { action: string },
): Promise<T> {
  const { action, ...fetchInit } = init;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchInit,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...fetchInit.headers,
    },
    // Un statut de paiement ne doit jamais venir d'un cache.
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SasPay : ${action} a échoué (${response.status}) : ${body}`,
    );
  }

  return unwrap<T>(await response.json());
}

type CreateCheckoutSessionParams = {
  /** Montant en F CFA (entier). */
  amount: number;
  description: string;
  /** Réinjecté dans la session (`metadata`) pour retrouver la commande
   * côté tableau de bord SasPay — informatif, le rapprochement réel passe
   * par `providerSessionId`. */
  orderId: string;
  returnUrl: string;
  /** Pays présélectionné sur la page de paiement (ISO2). Absent : le client
   * le choisit lui-même. */
  country?: string;
  customer: { email: string; name: string; phone?: string };
};

export type SaspayCheckoutSession = { id: string; checkoutUrl: string };

export async function createSaspayCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<SaspayCheckoutSession> {
  const session = await saspayFetch<{ id: string; checkout_url: string }>(
    "/checkout-sessions/",
    {
      action: "la création de la session de paiement",
      method: "POST",
      body: JSON.stringify({
        // La doc exige une chaîne décimale ("5000.00").
        amount: `${params.amount}.00`,
        currency: "XOF",
        description: params.description,
        ...(params.country ? { country: params.country } : {}),
        customer_email: params.customer.email,
        customer_name: params.customer.name,
        ...(params.customer.phone
          ? { customer_phone: params.customer.phone }
          : {}),
        return_url: params.returnUrl,
        metadata: { orderId: params.orderId },
      }),
    },
  );

  return { id: session.id, checkoutUrl: session.checkout_url };
}

export type SaspaySessionStatus = {
  /** Statut de la session : PENDING, PAID… */
  status: string;
  transactionId: string | null;
  transactionStatus: string | null;
};

/**
 * Statut d'une session — SasPay revérifie l'état réel côté gateway avant de
 * répondre (jamais un statut mémorisé), c'est la source de vérité.
 */
export async function getSaspaySessionStatus(
  sessionId: string,
): Promise<SaspaySessionStatus> {
  const data = await saspayFetch<{
    status: string;
    transaction_id?: string | null;
    transaction_status?: string | null;
  }>(`/checkout-sessions/${encodeURIComponent(sessionId)}/status/`, {
    action: "la vérification du statut de paiement",
    method: "GET",
  });

  return {
    status: data.status,
    transactionId: data.transaction_id ?? null,
    transactionStatus: data.transaction_status ?? null,
  };
}

export function isSaspaySessionPaid(status: SaspaySessionStatus) {
  return status.status === "PAID" && status.transactionStatus !== "FAILED";
}

/**
 * Annule une session restée ouverte (le client relance un paiement : on ne
 * veut pas qu'une ancienne page de paiement reste utilisable). Best-effort :
 * un échec ici ne doit jamais bloquer le nouveau paiement.
 */
export async function cancelSaspaySession(sessionId: string) {
  try {
    await saspayFetch(
      `/checkout-sessions/${encodeURIComponent(sessionId)}/cancel/`,
      { action: "l'annulation de la session", method: "POST" },
    );
  } catch (error) {
    console.error("[saspay] annulation de session impossible :", error);
  }
}

const SIGNATURE_TOLERANCE_SECONDS = 300;

export class SaspayWebhookSignatureError extends Error {}

export type SaspayWebhookEvent = {
  event: string;
  data: { id?: string; reference?: string; status?: string } & Record<
    string,
    unknown
  >;
};

/**
 * Vérifie un webhook SasPay et renvoie l'événement décodé.
 *
 * Algorithme documenté : HMAC-SHA256, clé = signing secret du webhook,
 * message = "{X-Webhook-Timestamp}.{corps brut}", digest hexadécimal en
 * minuscules dans X-Webhook-Signature, comparaison en temps constant,
 * horodatage à ±5 minutes. `rawBody` DOIT être le corps brut tel que reçu.
 */
export function constructSaspayEvent(
  rawBody: string,
  signature: string,
  timestamp: string,
): SaspayWebhookEvent {
  const secret = process.env.SASPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("SASPAY_WEBHOOK_SECRET manquant — voir .env.example.");
  }

  const timestampSeconds = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(timestampSeconds)) {
    throw new SaspayWebhookSignatureError("Horodatage illisible ou absent.");
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds);
  if (age > SIGNATURE_TOLERANCE_SECONDS) {
    throw new SaspayWebhookSignatureError(
      "Horodatage hors tolérance — possible tentative de rejeu.",
    );
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  if (!timingSafeEqualStrings(signature.trim().toLowerCase(), expected)) {
    throw new SaspayWebhookSignatureError(
      "Signature invalide — requête rejetée.",
    );
  }

  return JSON.parse(rawBody);
}

function timingSafeEqualStrings(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
