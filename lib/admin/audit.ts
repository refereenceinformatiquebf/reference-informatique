import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

/** Qui agit : le profil administrateur (ou null pour une action système). */
export type AuditActor = {
  id: string;
  email?: string | null;
  name?: string | null;
} | null;

/** Libellé affiché dans le journal et l'historique des commandes. */
export function actorLabel(actor: AuditActor): string {
  return actor?.email ?? actor?.name ?? "Système";
}

/**
 * Journal d'audit : qui a fait quoi, sur quelle entité. Ne lève JAMAIS
 * d'exception : un échec de journalisation ne doit pas empêcher l'action
 * légitime d'un administrateur (il est tracé en console).
 * Aucune donnée sensible dans `details` : jamais de mot de passe, de jeton ni
 * de lien de contenu complet.
 */
export async function audit(
  actor: AuditActor,
  action: string,
  entity: string | null,
  entityId: string | null,
  summary?: string,
  details?: unknown,
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: actor?.id ?? null,
        adminLabel: actor ? actorLabel(actor) : null,
        action,
        entity,
        entityId,
        summary: summary?.slice(0, 300),
        details:
          details === undefined
            ? undefined
            : (details as Prisma.InputJsonValue),
      },
    });
  } catch (error) {
    console.error(
      "[audit] échec de journalisation",
      action,
      error instanceof Error ? error.message : error,
    );
  }
}

/** Résumé des champs modifiés : { champ: [avant, après] }, pour le journal. */
export function diff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {};
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      out[key] = [truncate(before[key]), truncate(after[key])];
    }
  }
  return out;
}

function truncate(value: unknown): unknown {
  if (typeof value === "string" && value.length > 200) {
    return `${value.slice(0, 200)}…`;
  }
  return value;
}
