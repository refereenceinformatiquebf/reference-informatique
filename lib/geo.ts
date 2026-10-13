import "server-only";
import { headers } from "next/headers";
import { SITE } from "@/lib/site";
import type { CountryCode } from "@/lib/catalog/types";

/**
 * Pays du visiteur, déterminé côté serveur à partir de l'adresse IP.
 *
 * Sur Vercel, l'en-tête `x-vercel-ip-country` est posé par la plateforme
 * elle-même (un client ne peut pas le falsifier). Hors Vercel, on accepte
 * l'en-tête de Cloudflare. C'est la seule source de vérité : jamais un
 * paramètre d'URL ni un cookie, trivialement modifiables.
 *
 * Règle de sécurité (« échec fermé ») : si le pays est inconnu en production,
 * on renvoie `null` et le visiteur est traité comme étranger — il ne voit
 * pas les offres réservées au Burkina Faso.
 *
 * En développement, il n'y a pas d'en-tête : on simule le Burkina Faso, ou
 * le pays donné par DEV_VISITOR_COUNTRY (ex. « FR » pour tester la vue d'un
 * visiteur étranger). Un en-tête `x-vercel-ip-country` explicite reste
 * prioritaire, ce qui permet de tester avec curl.
 */
export async function getVisitorCountry(): Promise<CountryCode | null> {
  const h = await headers();
  const raw = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry");

  if (raw && /^[A-Za-z]{2}$/.test(raw)) {
    const code = raw.toUpperCase();
    // XX = inconnu, T1 = réseau Tor (Cloudflare) : on ne peut rien en conclure.
    if (code !== "XX" && code !== "T1") return code;
  }

  if (process.env.NODE_ENV !== "production") {
    return (process.env.DEV_VISITOR_COUNTRY ?? SITE.homeCountry).toUpperCase();
  }

  return null;
}

/** Vrai pour un visiteur du Burkina Faso. */
export function isHomeCountry(country: CountryCode | null) {
  return country === SITE.homeCountry;
}
