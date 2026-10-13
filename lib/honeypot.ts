/** Vrai si le champ piège (voir components/ui/honeypot.tsx) a été rempli :
 * c'est un robot. */
export function isHoneypotFilled(formData: FormData) {
  return String(formData.get("website") ?? "").trim() !== "";
}
