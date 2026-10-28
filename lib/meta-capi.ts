import "server-only";
import { createHash } from "node:crypto";
import { META_PIXEL_ID, META_CURRENCY } from "@/lib/meta-pixel";

const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaCapiParams {
  /** Identique à l'eventID envoyé côté navigateur (voir components/marketing/meta-event.tsx)
   * pour que Meta déduplique les deux envois d'un même événement plutôt que de les compter deux fois. */
  eventId: string;
  value: number;
  currency?: string;
  contentIds: string[];
  email?: string | null;
  phone?: string | null;
  eventSourceUrl?: string;
  /** Signaux captés côté serveur à la création/mise à jour de la commande (voir
   * lib/actions/order.ts, getOrCreatePendingOrder) — sans eux, l'événement est bien reçu
   * mais mal relié à un clic publicitaire précis, ce qui peut faire attribuer la vente à
   * une autre campagne que celle réellement cliquée. */
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

/**
 * Envoie un événement directement depuis le serveur (Conversions API), en plus du Pixel
 * navigateur (components/marketing/meta-pixel.tsx, meta-event.tsx) — indispensable car le
 * Pixel seul ne se déclenche jamais si le navigateur le bloque, ou si le client ferme l'onglet
 * après avoir payé sur Mobile Money avant d'atteindre /commande/retour. Best-effort : ne doit
 * jamais faire échouer l'appelant.
 */
async function sendMetaEvent(
  eventName: "Purchase" | "InitiateCheckout",
  params: MetaCapiParams,
): Promise<void> {
  if (!META_PIXEL_ID || !ACCESS_TOKEN) return;

  const userData: Record<string, unknown> = {};
  if (params.email) userData.em = [sha256(params.email)];
  if (params.phone) {
    const digits = params.phone.replace(/\D/g, "");
    if (digits) userData.ph = [sha256(digits)];
  }
  if (params.clientIp) userData.client_ip_address = params.clientIp;
  if (params.userAgent) userData.client_user_agent = params.userAgent;
  if (params.fbp) userData.fbp = params.fbp;
  if (params.fbc) userData.fbc = params.fbc;

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        action_source: "website",
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: {
          value: params.value,
          currency: params.currency ?? META_CURRENCY,
          content_ids: params.contentIds,
          content_type: "product",
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      console.error("[meta-capi]", eventName, res.status, await res.text());
    }
  } catch (err) {
    console.error("[meta-capi] requête échouée", eventName, err);
  }
}

export async function sendMetaPurchaseEvent(
  params: MetaCapiParams,
): Promise<void> {
  return sendMetaEvent("Purchase", params);
}

/**
 * Déclenché à la création/mise à jour d'une commande en attente (lib/actions/order.ts,
 * getOrCreatePendingOrder) — au moment exact où client_ip/user_agent/fbp/fbc sont captés pour
 * la commande, renforce le signal juste avant l'achat.
 */
export async function sendMetaInitiateCheckoutEvent(
  params: MetaCapiParams,
): Promise<void> {
  return sendMetaEvent("InitiateCheckout", params);
}
