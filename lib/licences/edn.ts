import "server-only";

/**
 * Intégration machine-à-machine avec L'Expert du Numérique (expertdunumerique.com) : fournisseur
 * de la licence d'activation Windows + Office revendue dans le pack « Licence Expert + Office 365
 * + Windows 11 ». Même enveloppe d'appel que lib/payments/saspay.ts (fonction `*Fetch` unique,
 * erreurs enrichies d'une action en français).
 *
 * Authentification : secret PROPRE à Référence Informatique (EDN_PARTNER_API_SECRET), jamais
 * partagé avec un autre partenaire d'EDN.
 */

const BASE_URL = "https://expertdunumerique.com/api/partenaires";
const PARTNER_SLUG = "reference-informatique";

function getSecret() {
  const key = process.env.EDN_PARTNER_API_SECRET;
  if (!key) {
    throw new Error("EDN_PARTNER_API_SECRET manquant — voir .env.example.");
  }
  return key;
}

export class EdnLicenceError extends Error {
  /** true quand EDN a refusé l'appel parce que son stock pour Référence Informatique est épuisé
   *  (distinct d'une panne — voir lib/licences/stock.ts, qui journalise différemment). */
  readonly quotaReached: boolean;
  constructor(message: string, quotaReached = false) {
    super(message);
    this.quotaReached = quotaReached;
  }
}

type EdnResponse = { ok: boolean; reason?: string; message?: string } & Record<
  string,
  unknown
>;

async function ednFetch<T extends EdnResponse>(
  path: string,
  init: RequestInit & { action: string },
): Promise<T> {
  const { action, ...fetchInit } = init;
  const response = await fetch(`${BASE_URL}/${PARTNER_SLUG}${path}`, {
    ...fetchInit,
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      "Content-Type": "application/json",
      ...fetchInit.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  const json = (await response.json().catch(() => null)) as T | null;
  if (!response.ok || !json?.ok) {
    throw new EdnLicenceError(
      `EDN : ${action} a échoué (${response.status}) : ${json?.message ?? "réponse invalide"}`,
      json?.reason === "quota_reached",
    );
  }
  return json;
}

export type EdnLicence = { licenseKey: string; installerUrl: string };

/** Récupère une licence pour ce client — un appel = une licence (jamais rejoué côté partenaire). */
export async function claimEdnLicence(
  clientName: string,
  clientEmail: string,
  orderRef?: string,
): Promise<EdnLicence> {
  const json = await ednFetch<
    EdnResponse & {
      licenseKey: string;
      accessCode: string;
      installerUrl: string;
    }
  >("/auto-claim", {
    action: "la récupération d'une licence",
    method: "POST",
    body: JSON.stringify({
      clientName,
      clientEmail,
      partnerOrderRef: orderRef,
    }),
  });
  return { licenseKey: json.licenseKey, installerUrl: json.installerUrl };
}

export type EdnPartnerStatus = {
  quota: number | null;
  used: number;
  remaining: number | null;
};

/** Quota/consommation chez EDN — lecture seule, pour notre propre tableau de bord. */
export async function getEdnPartnerStatus(): Promise<EdnPartnerStatus> {
  const json = await ednFetch<
    EdnResponse & {
      quota: number | null;
      used: number;
      remaining: number | null;
    }
  >("/statut", { action: "la lecture du quota", method: "GET" });
  return { quota: json.quota, used: json.used, remaining: json.remaining };
}

/** Récupère un LOT de `count` licences d'un coup, pour alimenter notre stock local. */
export async function pullEdnLicenceLot(count: number): Promise<EdnLicence[]> {
  const json = await ednFetch<EdnResponse & { licenses: EdnLicence[] }>(
    "/lot",
    {
      action: "la récupération d'un lot de licences",
      method: "POST",
      body: JSON.stringify({ count }),
    },
  );
  return json.licenses;
}

/** Comme getEdnPartnerStatus, mais ne lève jamais — pour ne pas faire planter la page admin si EDN est indisponible. */
export async function safeGetEdnPartnerStatus(): Promise<EdnPartnerStatus | null> {
  try {
    return await getEdnPartnerStatus();
  } catch (err) {
    console.error(
      "[licences] lecture du statut EDN échouée :",
      err instanceof EdnLicenceError ? err.message : err,
    );
    return null;
  }
}
