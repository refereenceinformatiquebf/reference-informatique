import Link from "next/link";
import { IconWhatsapp, IconTelephone } from "@/components/icons";
import { ALL_SERVICE_FAMILIES } from "@/lib/catalog";
import { SITE, whatsappLink } from "@/lib/site";
import { Brand } from "./logo";

/**
 * Pied de page marine (charte Boulga AI). Statique : il ne lit ni cookies ni
 * en-têtes, donc il ne rend aucune page dynamique. Il ne cite aucune offre
 * réservée à un pays — les clés de formations n'y apparaissent pas.
 */
export function Footer() {
  return (
    <footer className="on-navy bg-brand-900 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Brand tone="light" size={44} />
          <p className="max-w-xs text-[0.9375rem] leading-relaxed text-white/70">
            Sites web, agents IA, automatisation et maintenance. Formations et
            ressources numériques. Au Burkina Faso, et à distance.
          </p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
          >
            <IconWhatsapp size={18} />
            Nous écrire sur WhatsApp
          </a>
        </div>

        <FooterColumn title="Services">
          {ALL_SERVICE_FAMILIES.map((family) => (
            <FooterLink key={family.slug} href={`/services/${family.slug}`}>
              {family.name}
            </FooterLink>
          ))}
          <FooterLink href="/services">Tous nos services</FooterLink>
        </FooterColumn>

        <FooterColumn title="Boutique">
          <FooterLink href="/boutique">Toute la boutique</FooterLink>
          <FooterLink href="/boutique?famille=formation">Formations</FooterLink>
          <FooterLink href="/boutique?famille=ebook">
            Livres numériques
          </FooterLink>
          <FooterLink href="/boutique?famille=modele">Modèles</FooterLink>
          <FooterLink href="/boutique?famille=pack">
            Packs d&rsquo;outils
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Entreprise">
          <FooterLink href="/a-propos">À propos</FooterLink>
          <FooterLink href="/faq">Questions fréquentes</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="/conditions-generales">
            Conditions générales
          </FooterLink>
          <FooterLink href="/politique-de-confidentialite">
            Confidentialité
          </FooterLink>
          <a
            href={`tel:${SITE.phoneInternational}`}
            className="mt-1 inline-flex items-center gap-2 text-[0.9375rem] text-white/70 transition-colors hover:text-white"
          >
            <IconTelephone size={16} />
            {SITE.phoneDisplay}
          </a>
        </FooterColumn>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <p className="mx-auto max-w-6xl text-center text-xs text-white/55">
          © {new Date().getFullYear()} {SITE.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title} className="flex flex-col gap-2.5">
      <span className="text-[0.6875rem] font-medium tracking-[0.12em] text-white/50 uppercase">
        {title}
      </span>
      {children}
    </nav>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[0.9375rem] text-white/70 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}
