import Link from "next/link";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Container, IconChip, SectionHeading } from "@/components/ui/section";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import {
  PRODUCT_KINDS,
  PRODUCT_KIND_ORDER,
  type ProductKind,
} from "@/lib/catalog";
import { getVisibleProducts } from "@/lib/catalog/live";
import { getVisitorCountry, isHomeCountry } from "@/lib/geo";
import { fr } from "@/lib/typography";
import { whatsappLink } from "@/lib/site";
import { IconWhatsapp } from "@/components/icons";

export const metadata: Metadata = {
  title: "Boutique : formations, livres numériques, modèles et outils",
  description:
    "Formations complètes, livres numériques, modèles PowerPoint et Excel, outils de dépannage. Paiement par carte ou Mobile Money, accès immédiat après paiement.",
  alternates: { canonical: "/boutique" },
};

export default async function BoutiquePage({
  searchParams,
}: PageProps<"/boutique">) {
  const country = await getVisitorCountry();
  const products = await getVisibleProducts(country);
  const { famille } = await searchParams;

  // Seules les familles qui ont au moins un produit VISIBLE pour ce visiteur
  // sont proposées : un visiteur étranger ne voit donc jamais « Clés de
  // formations » dans les filtres.
  const kinds = PRODUCT_KIND_ORDER.filter((kind) =>
    products.some((product) => product.kind === kind),
  );
  const selected: ProductKind | undefined =
    typeof famille === "string" && (kinds as string[]).includes(famille)
      ? (famille as ProductKind)
      : undefined;
  const list = selected
    ? products.filter((product) => product.kind === selected)
    : products;

  return (
    <div className="flex flex-col">
      <section className="bg-paper border-line border-b">
        <Container className="py-14 sm:py-16">
          <SectionHeading
            as="h1"
            eyebrow="La boutique"
            title={fr("Apprenez, équipez-vous, avancez")}
            lead={fr(
              selected
                ? PRODUCT_KINDS[selected].description
                : "Des formations complètes, des livres, des modèles et des outils prêts à l'emploi. Vous payez en ligne, votre accès s'active dès que le paiement est confirmé.",
            )}
          />

          <nav aria-label="Familles de produits" className="mt-8">
            <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
              <FilterChip
                href="/boutique"
                active={!selected}
                count={products.length}
              >
                Tout
              </FilterChip>
              {kinds.map((kind) => (
                <FilterChip
                  key={kind}
                  href={`/boutique?famille=${kind}`}
                  active={selected === kind}
                  count={products.filter((p) => p.kind === kind).length}
                >
                  {PRODUCT_KINDS[kind].plural}
                </FilterChip>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <section className="pt-10 pb-10 sm:pt-12 sm:pb-12">
        <Container>
          {selected === "cle" ? <CleExplainer /> : null}

          <h2 className="sr-only">
            {selected ? PRODUCT_KINDS[selected].plural : "Tous les produits"}
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((product, index) => (
              <li key={product.slug}>
                <ProductCard
                  product={product}
                  index={index}
                  priority={index < 4}
                />
              </li>
            ))}
          </ul>

          <div className="border-line bg-paper mt-14 flex flex-col items-start gap-5 rounded-lg border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <IconChip name="support" size={48} />
              <div>
                <h2 className="font-display text-ink text-[1.375rem] leading-tight">
                  Vous ne savez pas lequel choisir ?
                </h2>
                <p className="text-ink-soft mt-1.5 text-[0.9375rem] leading-relaxed">
                  {fr(
                    "Dites-nous ce que vous voulez apprendre ou accomplir : nous vous orientons vers le bon produit, sans vous pousser à acheter plus.",
                  )}
                </p>
              </div>
            </div>
            <Button asChild variant="whatsapp" className="shrink-0">
              <a
                href={whatsappLink(
                  "Bonjour, j'aimerais être conseillé pour choisir un produit de la boutique.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                Demander conseil
              </a>
            </Button>
          </div>

          {isHomeCountry(country) ? null : (
            <p className="text-ink-faint mt-5 text-center text-sm leading-relaxed">
              Vous êtes au Burkina Faso et vous ne voyez pas toutes nos offres ?
              Votre connexion est peut-être localisée à l&rsquo;étranger.{" "}
              <a
                href={whatsappLink(
                  "Bonjour, je suis au Burkina Faso mais je ne vois pas toutes les offres de la boutique.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text font-medium underline underline-offset-4"
              >
                Écrivez-nous sur WhatsApp
              </a>
              , nous vous aidons.
            </p>
          )}
        </Container>
      </section>
    </div>
  );
}

function FilterChip({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <li className="shrink-0">
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200",
          active
            ? "border-brand bg-brand text-brand-contrast"
            : "border-line-strong bg-paper text-ink-soft hover:border-brand hover:text-brand-text",
        )}
      >
        {children}
        <span
          className={cn(
            "tabular rounded-full px-1.5 text-xs",
            active ? "bg-brand-900/40" : "bg-paper-raised text-ink-faint",
          )}
        >
          {count}
        </span>
      </Link>
    </li>
  );
}

/** Bandeau d'explication de la famille « Clés de formations » — affiché
 * seulement quand cette famille est sélectionnée, donc seulement aux
 * visiteurs du Burkina Faso (les autres n'ont pas ce filtre). */
function CleExplainer() {
  const points = [
    {
      icon: "cle-usb" as const,
      title: "Une clé USB livrée chez vous",
      text: "Gratuitement, partout au Burkina Faso, sous 24 à 48 h après la confirmation du paiement.",
    },
    {
      icon: "hors-ligne" as const,
      title: "Elle fonctionne sans internet",
      text: "Vous branchez la clé et vous apprenez, même sans connexion.",
    },
    {
      icon: "plateforme" as const,
      title: "L'accès en ligne est inclus",
      text: "Vous retrouvez aussi vos formations depuis votre téléphone, à vie.",
    },
  ];
  return (
    <div className="bg-paper border-line mb-10 grid grid-cols-1 gap-6 rounded-lg border p-6 sm:grid-cols-3 sm:p-8">
      {points.map((point) => (
        <div key={point.title} className="flex flex-col gap-3">
          <IconChip name={point.icon} size={48} />
          <h2 className="font-display text-ink text-[1.25rem] leading-tight">
            {point.title}
          </h2>
          <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
            {fr(point.text)}
          </p>
        </div>
      ))}
    </div>
  );
}
