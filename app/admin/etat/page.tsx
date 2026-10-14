import type { Metadata } from "next";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { runHealthChecks, type CheckLevel } from "@/lib/admin/health";

export const metadata: Metadata = { title: "État du système" };
export const dynamic = "force-dynamic";

const LEVELS: Record<CheckLevel, { label: string; dot: string; text: string }> =
  {
    ok: { label: "OK", dot: "bg-success", text: "text-success-text" },
    warning: {
      label: "À surveiller",
      dot: "bg-warning",
      text: "text-warning-text",
    },
    error: { label: "Problème", dot: "bg-danger", text: "text-danger-text" },
  };

export default async function AdminSystemStatusPage() {
  const checks = await runHealthChecks();
  const problems = checks.filter((check) => check.level === "error").length;
  const warnings = checks.filter((check) => check.level === "warning").length;
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return (
    <>
      <AdminHeader
        title="État du système"
        subtitle={
          problems > 0
            ? `${problems} problème(s) à corriger.`
            : warnings > 0
              ? `Tout fonctionne, ${warnings} point(s) à surveiller.`
              : "Tout fonctionne normalement."
        }
      />
      <Panel>
        <ul className="divide-line divide-y">
          {checks.map((check) => {
            const level = LEVELS[check.level];
            return (
              <li
                key={check.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${level.dot}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-ink text-sm font-medium">
                    {check.label}{" "}
                    <span className={`text-xs font-semibold ${level.text}`}>
                      {level.label}
                    </span>
                  </p>
                  <p className="text-ink-soft mt-0.5 text-sm leading-relaxed break-words">
                    {check.detail}
                  </p>
                </div>
                {check.ms !== undefined ? (
                  <span className="text-ink-faint tabular shrink-0 text-xs">
                    {check.ms} ms
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Panel>
      <p className="text-ink-faint mt-4 text-xs">
        Contrôle fait à l&apos;ouverture de la page. Aucune clé n&apos;est
        affichée.
        {commit ? ` Version en ligne : ${commit}.` : ""}
      </p>
    </>
  );
}
