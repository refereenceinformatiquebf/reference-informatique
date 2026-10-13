import type { LegacyPurchase } from "./parse-dump";

/** Libellés courts des produits, pour tenir dans un tableau. */
const SHORT_LABELS: Record<string, string> = {
  "cle-formations-completes": "Formations Complètes",
  "cle-formations-smart": "SMART",
  "cle-enfants": "Enfants",
  "cle-tout-en-un": "Tout-en-Un",
};

export function shortProductLabel(purchase: LegacyPurchase) {
  return (
    (purchase.productSlug ? SHORT_LABELS[purchase.productSlug] : undefined) ??
    purchase.product
  );
}

/** Lit la colonne JSON `purchases` sans jamais faire confiance à sa forme. */
export function readPurchases(value: unknown): LegacyPurchase[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const raw = item as Record<string, unknown>;
    if (typeof raw.product !== "string") return [];
    return [
      {
        product: raw.product,
        productSlug:
          typeof raw.productSlug === "string" ? raw.productSlug : null,
        amount: typeof raw.amount === "number" ? raw.amount : 0,
        status:
          raw.status === "PAIEMENT_RECU" ? "PAIEMENT_RECU" : "ACCES_ACTIVE",
        date: typeof raw.date === "string" ? raw.date : "",
      } satisfies LegacyPurchase,
    ];
  });
}

/** +22670123456 -> « +226 70 12 34 56 » (espaces insécables). */
export function formatPhone(phone: string | null) {
  if (!phone) return "";
  const match = /^\+226(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(phone);
  const nbsp = String.fromCharCode(160);
  return match
    ? `+226${nbsp}${match[1]}${nbsp}${match[2]}${nbsp}${match[3]}${nbsp}${match[4]}`
    : phone;
}

/** Lien WhatsApp vers le numéro d'un client (chiffres uniquement). */
export function whatsappLinkTo(phone: string, message?: string) {
  const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
