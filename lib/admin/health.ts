import "server-only";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";

export type CheckLevel = "ok" | "warning" | "error";
export type HealthCheck = {
  id: string;
  label: string;
  level: CheckLevel;
  detail: string;
  ms?: number;
};

const TIMEOUT_MS = 6000;

/** Exécute un contrôle avec délai maximal : un service lent ne bloque jamais la page. */
async function run(
  id: string,
  label: string,
  fn: () => Promise<{ level: CheckLevel; detail: string }>,
): Promise<HealthCheck> {
  const started = Date.now();
  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Pas de réponse après 6 s.")),
          TIMEOUT_MS,
        ),
      ),
    ]);
    return { id, label, ...result, ms: Date.now() - started };
  } catch (error) {
    return {
      id,
      label,
      level: "error",
      detail:
        error instanceof Error
          ? error.message.slice(0, 160)
          : "Erreur inconnue.",
      ms: Date.now() - started,
    };
  }
}

/**
 * Contrôles de bon fonctionnement. N'affiche JAMAIS une valeur secrète : seulement
 * si une variable est présente, son type (clé de test ou réelle) et le résultat
 * d'un appel de lecture.
 */
export async function runHealthChecks(): Promise<HealthCheck[]> {
  const checks = await Promise.all([
    run("db", "Base de données", async () => {
      await prisma.$queryRaw`SELECT 1`;
      return { level: "ok", detail: "Répond normalement." };
    }),

    run("auth", "Authentification (Supabase)", async () => {
      const { error } = await createAdminClient().auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      return error
        ? { level: "error", detail: `Erreur : ${error.message}` }
        : { level: "ok", detail: "Répond normalement." };
    }),

    run("storage", "Stockage des fichiers", async () => {
      const { data, error } = await createAdminClient().storage.listBuckets();
      if (error) return { level: "error", detail: `Erreur : ${error.message}` };
      const names = new Set((data ?? []).map((bucket) => bucket.name));
      const missing = ["formations", "medias"].filter(
        (name) => !names.has(name),
      );
      return missing.length > 0
        ? {
            level: "error",
            detail: `Espace(s) de stockage manquant(s) : ${missing.join(", ")}.`,
          }
        : {
            level: "ok",
            detail:
              "Les espaces « formations » (privé) et « medias » (public) existent.",
          };
    }),

    run("brevo", "Emails (Brevo)", async () => {
      const key = process.env.BREVO_API_KEY;
      if (!key)
        return {
          level: "error",
          detail: "Clé BREVO_API_KEY absente : aucun email ne part.",
        };
      const response = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": key, accept: "application/json" },
        cache: "no-store",
      });
      if (response.status === 401) {
        return {
          level: "error",
          detail: "Brevo refuse la clé (invalide ou révoquée).",
        };
      }
      if (!response.ok)
        return {
          level: "warning",
          detail: `Brevo répond avec le code ${response.status}.`,
        };
      const account = (await response.json()) as {
        plan?: { type?: string; credits?: number }[];
      };
      const credits = account.plan?.find(
        (plan) => typeof plan.credits === "number",
      )?.credits;
      const sender =
        process.env.BREVO_SENDER_EMAIL ?? "hello@reference-informatique.com";
      return {
        level: credits !== undefined && credits < 20 ? "warning" : "ok",
        detail: `Compte joignable. Expéditeur : ${sender}.${credits !== undefined ? ` Crédits restants : ${credits}.` : ""}`,
      };
    }),

    run("saspay", "Paiement (SasPay)", async () => {
      const key = process.env.SASPAY_SECRET_KEY;
      if (!key)
        return {
          level: "error",
          detail:
            "Clé SASPAY_SECRET_KEY absente : le paiement en ligne est impossible.",
        };
      const mode = key.startsWith("sk_live_")
        ? "clé réelle (production)"
        : key.startsWith("sk_test_")
          ? "clé de TEST"
          : "clé de type inconnu";
      // Lecture d'une session qui n'existe pas : 404 = clé acceptée, 401 = clé refusée.
      const response = await fetch(
        "https://api.saspay.me/api/v1/checkout-sessions/00000000-0000-0000-0000-000000000000/status/",
        { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" },
      );
      if (response.status === 401 || response.status === 403) {
        return { level: "error", detail: `SasPay refuse la clé (${mode}).` };
      }
      if (response.status >= 500)
        return {
          level: "warning",
          detail: `SasPay ne répond pas correctement (${response.status}).`,
        };
      return {
        level: key.startsWith("sk_test_") ? "warning" : "ok",
        detail: `Clé acceptée : ${mode}.${key.startsWith("sk_test_") ? " Les paiements ne sont pas réels." : ""}`,
      };
    }),

    run("webhook", "Notifications de paiement (webhook SasPay)", async () => {
      if (!process.env.SASPAY_WEBHOOK_SECRET) {
        return {
          level: "error",
          detail:
            "Secret SASPAY_WEBHOOK_SECRET absent : les notifications seront refusées.",
        };
      }
      const since = new Date(Date.now() - 86_400_000);
      const [last, rejected] = await Promise.all([
        prisma.webhookEvent.findFirst({
          where: { provider: "SASPAY", status: "VERIFIED" },
          orderBy: { receivedAt: "desc" },
        }),
        prisma.webhookEvent.count({
          where: {
            provider: "SASPAY",
            status: { in: ["REJECTED", "ERROR"] },
            receivedAt: { gte: since },
          },
        }),
      ]);
      if (rejected > 0) {
        return {
          level: "error",
          detail: `${rejected} notification(s) refusée(s) ou en erreur ces 24 dernières heures : vérifiez que le secret est identique chez SasPay et dans Vercel.`,
        };
      }
      return {
        level: "ok",
        detail: last
          ? `Secret présent. Dernière notification valide : ${last.receivedAt.toLocaleString("fr-FR", { timeZone: "Africa/Ouagadougou" })}.`
          : "Secret présent. Aucune notification reçue pour l'instant (normal tant qu'aucun paiement n'a eu lieu).",
      };
    }),

    run(
      "meta-capi",
      "Attribution publicitaire (API Conversions Meta)",
      async () => {
        const token = process.env.META_CAPI_ACCESS_TOKEN;
        // Pas d'appel de lecture possible avec ce jeton (droit d'écriture seul, voir
        // lib/meta-capi.ts) : présence uniquement, pas une vérification en direct.
        if (!token) {
          return {
            level: "warning",
            detail:
              "META_CAPI_ACCESS_TOKEN absent : les événements InitiateCheckout/Purchase ne partent que depuis le navigateur du client (jamais si bloqué ou sans consentement cookie).",
          };
        }
        return {
          level: "ok",
          detail:
            "Jeton présent (non vérifié en direct — consultez le Gestionnaire d'événements Meta pour confirmer la réception).",
        };
      },
    ),

    run("env", "Adresse et réglages du site", async () => {
      const problems: string[] = [];
      if (
        process.env.NODE_ENV === "production" &&
        !SITE.url.startsWith("https://www.reference-informatique.com")
      ) {
        problems.push(
          `NEXT_PUBLIC_SITE_URL vaut « ${SITE.url} » (attendu : https://www.reference-informatique.com).`,
        );
      }
      if (!process.env.ADMIN_NOTIFICATION_EMAIL) {
        problems.push(
          "ADMIN_NOTIFICATION_EMAIL absent : les alertes partent vers l'adresse par défaut.",
        );
      }
      return problems.length > 0
        ? { level: "warning", detail: problems.join(" ") }
        : { level: "ok", detail: `Adresse du site : ${SITE.url}.` };
    }),
  ]);
  return checks;
}
