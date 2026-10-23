import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconFleche } from "@/components/icons";
import { fr } from "@/lib/typography";

/**
 * Appel à l'action en fin de chaque onglet. L'id est surveillé par la barre
 * d'achat mobile, qui s'efface tant que ce bouton est à l'écran.
 */
export function PackInlineCta({
  id,
  title,
  label,
  href,
  note,
}: {
  id: string;
  title: string;
  label: string;
  href: string;
  /** Petite ligne de réassurance sous le titre. */
  note?: string;
}) {
  return (
    <div className="border-line bg-paper shadow-card mt-10 flex flex-col items-start gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="font-display text-ink text-[1.25rem] leading-snug sm:text-[1.375rem]">
          {fr(title)}
        </p>
        {note ? (
          <p className="text-ink-faint mt-1.5 text-sm">{fr(note)}</p>
        ) : null}
      </div>
      <Button
        asChild
        size="lg"
        className="font-display w-full shrink-0 text-base sm:w-auto"
        id={id}
      >
        <Link href={href}>
          {fr(label)}
          <IconFleche size={18} />
        </Link>
      </Button>
    </div>
  );
}
