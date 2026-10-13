/**
 * Champ piège anti-robots : invisible pour une vraie personne (hors écran,
 * ignoré par le clavier et les lecteurs d'écran), mais un robot qui remplit
 * tous les champs le renseigne. Les actions serveur font semblant d'accepter
 * le formulaire sans rien enregistrer (voir isHoneypotFilled).
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
    >
      <label>
        Ne pas remplir ce champ
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
