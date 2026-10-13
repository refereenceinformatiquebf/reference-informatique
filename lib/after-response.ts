import "server-only";
import { after } from "next/server";

/**
 * Exécute une tâche APRÈS l'envoi de la réponse (emails, journalisation), pour
 * que le client ou l'administrateur n'attende pas des appels externes lents.
 * Sur Vercel, la fonction reste active jusqu'à la fin de la tâche.
 *
 * Hors d'une requête (script, test), `after` n'existe pas : la tâche est alors
 * lancée tout de suite. Une erreur est toujours journalisée, jamais remontée.
 */
export function runAfterResponse(task: () => Promise<unknown>) {
  const safe = () =>
    task().catch((error) => console.error("[après réponse]", error));
  try {
    after(safe);
  } catch {
    void safe();
  }
}
