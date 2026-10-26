/**
 * Indicatifs téléphoniques d'Afrique de l'Ouest — source unique pour
 * PhoneInput (saisie) et countryFromPhone (déduction du pays côté serveur).
 * Burkina Faso en tête : marché principal de Référence Informatique.
 */
export const AFRICAN_COUNTRIES = [
  "Burkina Faso",
  "Côte d'Ivoire",
  "Sénégal",
  "Mali",
  "Niger",
  "Togo",
  "Bénin",
  "Cameroun",
  "Guinée",
  "Mauritanie",
  "Autre",
] as const;

export type AfricanCountry = (typeof AFRICAN_COUNTRIES)[number];

export const PHONE_DIAL_CODES: Partial<Record<AfricanCountry, string>> = {
  "Burkina Faso": "+226",
  "Côte d'Ivoire": "+225",
  Sénégal: "+221",
  Mali: "+223",
  Niger: "+227",
  Togo: "+228",
  Bénin: "+229",
  Cameroun: "+237",
  Guinée: "+224",
  Mauritanie: "+222",
};

/** Déduit le pays depuis un numéro au format « +226 70000000 » (voir PhoneInput) — null si vide. */
export function countryFromPhone(phone: string): AfricanCountry | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  for (const country of AFRICAN_COUNTRIES) {
    const code = PHONE_DIAL_CODES[country];
    if (code && trimmed.startsWith(code)) return country;
  }
  return "Autre";
}
