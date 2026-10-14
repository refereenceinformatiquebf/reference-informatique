import Link from "next/link";
import { getAnnouncement } from "@/lib/settings";
import { fr } from "@/lib/typography";

/**
 * Bandeau d'annonce (activé depuis l'administration, Paramètres). Rien n'est
 * affiché tant qu'il est désactivé. Le texte est celui de l'équipe, jamais un
 * HTML : aucun risque d'injection.
 */
export async function AnnouncementBar() {
  const announcement = await getAnnouncement();
  if (!announcement) return null;
  const { message, linkHref, linkLabel } = announcement;
  const external = linkHref.startsWith("https://");
  return (
    <div className="on-navy bg-brand-900 px-4 py-2 text-center text-[0.8125rem] leading-snug text-white">
      <span>{fr(message)}</span>
      {linkHref && linkLabel ? (
        external ? (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 font-medium underline underline-offset-4"
          >
            {linkLabel}
          </a>
        ) : (
          <Link
            href={linkHref}
            className="ml-2 font-medium underline underline-offset-4"
          >
            {linkLabel}
          </Link>
        )
      ) : null}
    </div>
  );
}
