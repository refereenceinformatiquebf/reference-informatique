import "server-only";
import crypto from "node:crypto";

/**
 * Intégration FedaPay via appels REST directs (fetch natif), sans le SDK
 * officiel « fedapay » — ce paquet épingle une version d'axios avec
 * plusieurs failles connues (SSRF, DoS) qu'`npm audit` signale en sévérité
 * haute. Les trois opérations dont on a besoin sont simples et documentées
 * (voir https://docs.fedapay.com/api-reference/) ; les reproduire ici évite
 * la dépendance vulnérable sans rien perdre en fiabilité.
 *
 * La vérification de signature de webhook, elle, n'est PAS documentée
 * publiquement en dehors du SDK — l'implémentation ci-dessous est un port
 * fidèle de l'algorithme réel du SDK officiel (node_modules/fedapay/src/
 * Webhook.ts au moment de l'écriture), pas une supposition : HMAC-SHA256 de
 * "{timestamp}.{payload_brut}" avec le secret d'endpoint, comparaison en
 * temps constant, tolérance de rejeu de 5 minutes.
 */

const BASE_URL =
  process.env.FEDAPAY_ENV === "live"
    ? "https://api.fedapay.com/v1"
    : "https://sandbox-api.fedapay.com/v1";

type CreateTransactionParams = {
  description: string;
  amount: number;
  callbackUrl: string;
  /** Réinjecté tel quel dans le webhook (event.entity.custom_metadata) —
   * c'est ce qui permet de relier une transaction FedaPay à notre Order. */
  orderId: string;
  customer: {
    email: string;
    firstname: string;
    lastname: string;
    phoneNumber?: { number: string; country: string };
  };
};

type FedaPayTransaction = { id: number; reference: string; status: string };

export async function createFedapayTransaction(
  params: CreateTransactionParams,
): Promise<FedaPayTransaction> {
  const secretKey = process.env.FEDAPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "FEDAPAY_SECRET_KEY manquant — voir .env.example (Étape 10).",
    );
  }

  const response = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: params.description,
      amount: params.amount,
      currency: { iso: "XOF" },
      callback_url: params.callbackUrl,
      custom_metadata: { orderId: params.orderId },
      customer: {
        email: params.customer.email,
        firstname: params.customer.firstname,
        lastname: params.customer.lastname,
        ...(params.customer.phoneNumber
          ? {
              phone_number: {
                number: params.customer.phoneNumber.number,
                country: params.customer.phoneNumber.country,
              },
            }
          : {}),
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Échec de création de la transaction FedaPay (${response.status}) : ${body}`,
    );
  }

  return response.json();
}

export async function generateFedapayPaymentUrl(
  transactionId: number,
): Promise<string> {
  const secretKey = process.env.FEDAPAY_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "FEDAPAY_SECRET_KEY manquant — voir .env.example (Étape 10).",
    );
  }

  const response = await fetch(
    `${BASE_URL}/transactions/${transactionId}/token`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}` },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Échec de génération du lien de paiement FedaPay (${response.status}) : ${body}`,
    );
  }

  const data: { token: string; url: string } = await response.json();
  return data.url;
}

const SIGNATURE_SCHEME = "s";
const SIGNATURE_TOLERANCE_SECONDS = 300;

export class FedapayWebhookSignatureError extends Error {}

/**
 * Vérifie l'en-tête X-FEDAPAY-SIGNATURE et renvoie l'événement décodé.
 * `rawBody` DOIT être le corps brut de la requête (jamais re-sérialisé
 * depuis un objet déjà parsé), sous peine de signature toujours invalide.
 */
export function constructFedapayEvent(
  rawBody: string,
  signatureHeader: string,
) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "FEDAPAY_WEBHOOK_SECRET manquant — voir .env.example (Étape 10).",
    );
  }

  const parts = signatureHeader.split(",").reduce<{
    timestamp: number;
    signatures: string[];
  }>(
    (accum, item) => {
      const [key, value] = item.split("=");
      if (key === "t") accum.timestamp = Number.parseInt(value, 10);
      if (key === SIGNATURE_SCHEME) accum.signatures.push(value);
      return accum;
    },
    { timestamp: -1, signatures: [] },
  );

  if (parts.timestamp === -1 || parts.signatures.length === 0) {
    throw new FedapayWebhookSignatureError(
      "En-tête de signature illisible ou absent.",
    );
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${parts.timestamp}.${rawBody}`, "utf8")
    .digest("hex");

  const isValid = parts.signatures.some((signature) =>
    timingSafeEqualStrings(signature, expectedSignature),
  );

  if (!isValid) {
    throw new FedapayWebhookSignatureError(
      "La signature ne correspond à aucun secret connu — requête rejetée.",
    );
  }

  const age = Math.floor(Date.now() / 1000) - parts.timestamp;
  if (age > SIGNATURE_TOLERANCE_SECONDS) {
    throw new FedapayWebhookSignatureError(
      "Horodatage hors tolérance — possible tentative de rejeu.",
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
