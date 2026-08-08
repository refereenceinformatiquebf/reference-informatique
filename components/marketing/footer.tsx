import Link from "next/link";
import { IconWhatsapp } from "@/components/icons";
import { NAV_LINKS } from "./nav-links";
import { Logo } from "./logo";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22675789737";

export function Footer() {
  return (
    <footer className="border-line bg-paper-raised border-t">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-ink text-sm font-semibold">
              Référence Informatique
            </span>
          </div>
          <p className="text-ink-soft text-sm leading-relaxed">
            Formations, conception de sites web, agents IA et maintenance
            informatique — Burkina Faso.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-ink-faint text-xs font-bold tracking-wide uppercase">
            Navigation
          </span>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-soft hover:text-ink text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-ink-faint text-xs font-bold tracking-wide uppercase">
            Compte
          </span>
          <Link
            href="/connexion"
            className="text-ink-soft hover:text-ink text-sm"
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="text-ink-soft hover:text-ink text-sm"
          >
            Créer un compte
          </Link>
          <Link
            href="/politique-de-confidentialite"
            className="text-ink-soft hover:text-ink text-sm"
          >
            Confidentialité
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-ink-faint text-xs font-bold tracking-wide uppercase">
            Contact
          </span>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-success flex items-center gap-2 text-sm font-semibold"
          >
            <IconWhatsapp size={18} />
            WhatsApp — réponse rapide
          </a>
          <a
            href={`tel:+${WHATSAPP_NUMBER}`}
            className="text-ink-soft hover:text-ink text-sm"
          >
            +
            {WHATSAPP_NUMBER.replace(
              /(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/,
              "$1 $2 $3 $4 $5",
            )}
          </a>
        </div>
      </div>

      <div className="border-line border-t px-4 py-5">
        <p className="text-ink-faint mx-auto max-w-6xl text-center text-xs">
          © {new Date().getFullYear()} Référence Informatique. Tous droits
          réservés.
        </p>
      </div>
    </footer>
  );
}
