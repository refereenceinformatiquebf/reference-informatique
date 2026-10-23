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
}: {
  id: string;
  title: string;
  label: string;
  href: string;
}) {
  return (
    <div className="border-line bg-paper shadow-card mt-10 flex flex-col items-start gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <p className="font-display text-ink min-w-0 text-[1.375rem] leading-snug">
        {fr(title)}
      </p>
      <Button asChild size="lg" className="w-full shrink-0 sm:w-auto" id={id}>
        <Link href={href}>
          {fr(label)}
          <IconFleche size={18} />
        </Link>
      </Button>
    </div>
  );
}
