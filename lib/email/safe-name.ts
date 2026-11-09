/**
 * Nom de produit tel qu'affiché DANS UN E-MAIL client uniquement — jamais sur
 * le site. Les fournisseurs d'e-mail passent les envois en revue manuelle ;
 * des formulations comme « à vie » ou « Activé » accolées à Windows/Office
 * ressemblent à de la revente de licences non autorisée et peuvent faire
 * suspendre le compte d'envoi (vécu avec Brevo sur ce site, voir mémoire
 * projet). Le nom affiché sur le site n'est jamais modifié par cette
 * fonction — seul le texte envoyé par e-mail (objet et corps) passe par ici.
 */
export function emailSafeProductName(name: string): string {
  return name
    .replace(/[-–—]?\s*(installation\s+facile\s+)?[àa]\s+vie\b/gi, "")
    .replace(/\bactiv[ée]e?s?\b/gi, "")
    .replace(/\s*[-–—]\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
