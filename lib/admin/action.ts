/** Résultat d'une action d'administration, affiché sous le bouton cliqué. */
export type ActionResult = { ok: boolean; message: string } | undefined;

export const done = (message: string): ActionResult => ({ ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message });
