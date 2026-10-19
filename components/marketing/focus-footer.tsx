import Link from "next/link";
import { getLegalSettings, isLegalComplete } from "@/lib/settings";
import { SITE } from "@/lib/site";

/**
 * Pied de page des pages sans distraction (voir lib/focus.ts) : seulement les
 * mentions que la loi et la confiance exigent près d'un achat — jamais une
 * navigation vers le reste du site.
 */
export async function FocusFooter() {
  const showLegal = isLegalComplete(await getLegalSettings());
  const linkClass =
    "text-ink-faint hover:text-ink underline underline-offset-4 transition-colors";
  return (
    <footer className="border-line bg-paper-raised border-t px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center text-xs">
        <nav
          aria-label="Informations légales"
          className="flex flex-wrap justify-center gap-x-5 gap-y-1.5"
        >
          <Link href="/conditions-generales" className={linkClass}>
            Conditions générales
          </Link>
          <Link href="/politique-de-confidentialite" className={linkClass}>
            Confidentialité
          </Link>
          {showLegal ? (
            <Link href="/mentions-legales" className={linkClass}>
              Mentions légales
            </Link>
          ) : null}
        </nav>
        <p className="text-ink-faint">
          © {new Date().getFullYear()} {SITE.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
