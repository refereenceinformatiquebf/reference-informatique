import { fr } from "@/lib/typography";

/** « Comment ça se passe » : étapes numérotées 01, 02… sur deux colonnes. */
export function StepsGrid({
  steps,
}: {
  steps: { title: string; text: string }[];
}) {
  return (
    <ol className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
      {steps.map((step, index) => (
        <li key={step.title} className="flex min-w-0 flex-col gap-2">
          <span className="font-display text-brand-text tabular text-[2rem] leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-ink text-[1.1875rem] leading-tight">
            {fr(step.title)}
          </h3>
          <p className="text-ink-soft text-base leading-[1.7]">
            {fr(step.text)}
          </p>
        </li>
      ))}
    </ol>
  );
}
