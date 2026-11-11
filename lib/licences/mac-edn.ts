import "server-only";

/**
 * Jumelle de lib/licences/edn.ts pour le Pack Mac Office — meme fournisseur (EDN), meme
 * authentification (EDN_PARTNER_API_SECRET, secret partage avec le Windows : c'est le MEME
 * partenaire chez EDN, juste une plateforme differente), mais appels et stock separes (voir
 * mac-stock.ts). Chaque appel passe `platform: 'mac'` pour que l'API EDN sache quel type de
 * licence generer.
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

export class EdnMacLicenceError extends Error {
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
    throw new EdnMacLicenceError(
      `EDN (Mac) : ${action} a échoué (${response.status}) : ${json?.message ?? "réponse invalide"}`,
      json?.reason === "quota_reached",
    );
  }
  return json;
}

export type EdnMacLicence = {
  licenseKey: string;
  installerUrl: string;
  serializerUrl: string;
  guideUrl: string;
};

/** Récupère une licence Mac pour ce client — un appel = une licence. */
export async function claimEdnMacLicence(
  clientName: string,
  clientEmail: string,
  orderRef?: string,
): Promise<EdnMacLicence> {
  const json = await ednFetch<
    EdnResponse & {
      licenseKey: string;
      accessCode: string;
      installerUrl: string;
      serializerUrl: string;
      guideUrl: string;
    }
  >("/auto-claim", {
    action: "la récupération d'une licence Mac",
    method: "POST",
    body: JSON.stringify({
      clientName,
      clientEmail,
      partnerOrderRef: orderRef,
      platform: "mac",
    }),
  });
  return {
    licenseKey: json.licenseKey,
    installerUrl: json.installerUrl,
    serializerUrl: json.serializerUrl,
    guideUrl: json.guideUrl,
  };
}

/** Récupère un LOT de `count` licences Mac d'un coup, pour alimenter le stock local Mac. */
export async function pullEdnMacLicenceLot(
  count: number,
): Promise<EdnMacLicence[]> {
  const json = await ednFetch<EdnResponse & { licenses: EdnMacLicence[] }>(
    "/lot",
    {
      action: "la récupération d'un lot de licences Mac",
      method: "POST",
      body: JSON.stringify({ count, platform: "mac" }),
    },
  );
  return json.licenses;
}
