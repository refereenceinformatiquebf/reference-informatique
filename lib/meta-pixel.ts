/**
 * Pixel Meta (Facebook / Instagram) de Référence Informatique.
 *
 * Tant qu'aucun identifiant de pixel n'est renseigné, RIEN n'est chargé ni
 * envoyé : le site se comporte comme s'il n'y avait pas de pixel.
 *
 * L'identifiant n'est pas un secret (il est visible dans le code de toute page
 * qui l'utilise). Il vient de la variable NEXT_PUBLIC_META_PIXEL_ID si elle est
 * définie, sinon de la valeur ci-dessous.
 */
const DEFAULT_META_PIXEL_ID = "1578070934336417";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || DEFAULT_META_PIXEL_ID;

/**
 * Pages où le pixel ne se charge JAMAIS : zones privées, et pages dont
 * l'adresse contient un jeton ou un code (le pixel envoie l'adresse complète
 * de la page à Meta : un lien d'accès à un achat ne doit pas lui être transmis).
 */
const UNTRACKED_PREFIXES = [
  "/admin",
  "/espace-client",
  "/auth",
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/commande/suivi",
  "/dev",
  "/api",
];

export function isTrackablePath(pathname: string): boolean {
  return !UNTRACKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type MetaEventName =
  "ViewContent" | "InitiateCheckout" | "AddPaymentInfo" | "Purchase";

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    /** Événements demandés avant que le pixel ne soit prêt : envoyés dès qu'il l'est. */
    __metaPending?: (() => void)[];
  }
}

/** Montants du catalogue : en F CFA, entiers. */
export const META_CURRENCY = "XOF";

/**
 * Envoie un événement au pixel. `eventId` sert à Meta à ne compter qu'une fois
 * un même événement reçu par deux chemins (navigateur et serveur).
 */
export function trackMeta(
  event: MetaEventName,
  params: Record<string, unknown> = {},
  eventId?: string,
): void {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  const send = () =>
    window.fbq?.(
      "track",
      event,
      params,
      eventId ? { eventID: eventId } : undefined,
    );
  if (window.fbq) {
    send();
  } else {
    (window.__metaPending ??= []).push(send);
  }
}

/** Paramètres communs aux événements qui concernent un produit. */
export function productParams(product: {
  slug: string;
  name: string;
  price: number;
}) {
  return {
    content_ids: [product.slug],
    content_name: product.name,
    content_type: "product",
    value: product.price,
    currency: META_CURRENCY,
  };
}
