import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { FaqList } from "@/components/ui/faq-list";
import { ProductCard } from "@/components/shop/product-card";
import { IconFleche, IconWhatsapp } from "@/components/icons";
import { ALL_SERVICE_FAMILIES, type Product } from "@/lib/catalog";
import { getHomeTestimonials } from "@/lib/testimonials";
import {
  getAllServices,
  getProduct,
  getVisibleProducts,
} from "@/lib/catalog/live";
import { getVisitorCountry, isHomeCountry } from "@/lib/geo";
import { formatServicePrice } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — Sites web, agents IA, maintenance et formations`,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
};

/** Les quatre garanties de méthode : seulement des engagements qu'on tient. */
const PROMESSES = [
  {
    icon: "devis",
    title: "Un devis clair avant de commencer",
    text: "Ce qui est livré, le prix, le délai : tout est écrit avant que le travail ne démarre. Vous savez où vous allez.",
  },
  {
    icon: "support",
    title: "Une équipe qui répond sur WhatsApp",
    text: "Avant, pendant et après le projet, vous écrivez, une vraie personne vous répond. Pas de boîte vocale, pas de ticket.",
  },
  {
    icon: "verifie",
    title: "Expliqué sans jargon",
    text: "Nous vous disons ce que nous faisons, pourquoi, et ce que ça change pour votre activité. Vous comprenez ce que vous achetez.",
  },
  {
    icon: "bouclier",
    title: "Vous gardez la main",
    text: "Vous validez chaque étape. Nos agents IA préparent, vous décidez. Ce que nous construisons est fait pour que vous puissiez le piloter.",
  },
] as const;

const ETAPES = [
  {
    title: "Vous nous écrivez",
    text: "Par WhatsApp, par téléphone ou avec le formulaire. Vous racontez votre besoin avec vos mots.",
  },
  {
    title: "Nous vous répondons avec un devis",
    text: "Gratuit, détaillé, sans engagement. Si nous pensons qu'une autre solution vous conviendra mieux, nous vous le disons.",
  },
  {
    title: "Nous réalisons, vous validez",
    text: "Le travail avance par étapes que vous approuvez. Pas de mauvaise surprise à la fin.",
  },
  {
    title: "Nous livrons et nous restons là",
    text: "Mise en service, prise en main et suivi. Un contrat de maintenance existe si vous le souhaitez.",
  },
] as const;

const FAQ = [
  {
    question: "Les devis sont-ils vraiment gratuits ?",
    answer:
      "Oui. Vous décrivez votre besoin, nous revenons vers vous avec une proposition détaillée, sans frais et sans engagement. Vous êtes libre de refuser.",
  },
  {
    question: "Comment puis-je payer ?",
    answer:
      "En ligne, par carte bancaire ou Mobile Money, sur une page de paiement sécurisée. Pour les services, les modalités (acompte, solde) sont écrites dans le devis.",
  },
  {
    question: "Travaillez-vous à distance ?",
    answer:
      "Oui pour la plupart de nos prestations : sites web, agents IA, automatisation et dépannage à distance. Pour les interventions sur place, précisez votre ville dans votre demande.",
  },
  {
    question:
      "Je ne suis pas à l'aise avec l'informatique. Est-ce un problème ?",
    answer:
      "Non, c'est même pour vous que nous expliquons sans jargon. Vous n'avez pas besoin de connaître les termes techniques : décrivez simplement ce que vous voulez obtenir.",
  },
  {
    question: "Puis-je acheter dans la boutique depuis l'étranger ?",
    answer:
      "Oui. Les formations, livres numériques, modèles et outils sont accessibles partout : vous recevez votre lien d'accès par email dès que le paiement est confirmé, sans compte à créer.",
  },
  {
    question: "Comment vous contacter le plus vite ?",
    answer: `Par WhatsApp au ${SITE.phoneDisplay}. C'est le canal le plus rapide.`,
  },
];

/** Produits mis en avant : choisis par slug, filtrés par pays. */
async function featuredFor(
  country: ReturnType<typeof isHomeCountry>,
): Promise<Product[]> {
  const slugs = country
    ? [
        "cle-tout-en-un",
        "cle-formations-completes",
        "pack-formations-completes-office-ia",
        "pack-120-logiciels-excel",
      ]
    : [
        "pack-formations-completes-office-ia",
        "pack-120-logiciels-excel",
        "le-chercheur-augmente",
        "pack-5500-diapositives-powerpoint",
      ];
  const products = await Promise.all(slugs.map((slug) => getProduct(slug)));
  return products.filter((p): p is Product => Boolean(p));
}

export default async function HomePage() {
  const country = await getVisitorCountry();
  const atHome = isHomeCountry(country);
  const visible = await getVisibleProducts(country);
  const allServices = await getAllServices();
  const featured = (await featuredFor(atHome)).filter((product) =>
    visible.some((p) => p.slug === product.slug),
  );

  // Témoignages réels des clients (clés de formations) : réservés aux
  // visiteurs du Burkina Faso, comme les offres dont ils parlent.
  const testimonials = await getHomeTestimonials(
    new Set(visible.map((product) => product.slug)),
  );

  return (
    <div className="flex flex-col">
      {/* ============================== Héros ============================== */}
      <section className="illus-zone">
        <Container className="grid grid-cols-1 gap-10 pt-8 pb-20 sm:pt-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pb-24">
          <div className="rise-in flex flex-col items-start gap-6">
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.02em] sm:text-[3.5rem]">
              {fr("Le numérique qui travaille pour vous.")}
            </h1>
            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-white/85 sm:text-lg">
              {fr(
                "Sites web, agents IA, automatisation, maintenance : des solutions concrètes, expliquées simplement. Et une boutique de formations pour apprendre à votre rythme.",
              )}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="inverse"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/services">
                  Voir nos services
                  <IconFleche size={18} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="w-full bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/16 sm:w-auto"
              >
                <a
                  href={whatsappLink(
                    "Bonjour, j'ai un projet et je voudrais en discuter.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconWhatsapp size={18} />
                  Parler à un conseiller
                </a>
              </Button>
            </div>
          </div>

          {/* Panneau : les deux portes d'entrée du site */}
          <div
            className="rise-in flex flex-col gap-3"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <Link
              href="/services"
              className="group flex items-center gap-4 rounded-xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/15"
            >
              <IconChip name="service" tone="solid" size={52} />
              <span className="flex-1">
                <span className="font-display block text-[1.375rem] leading-tight">
                  Services sur mesure
                </span>
                <span className="mt-1 block text-sm text-white/75">
                  Sites web, agents IA, automatisation, maintenance
                </span>
              </span>
              <IconFleche
                size={20}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/boutique"
              className="group flex items-center gap-4 rounded-xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/15"
            >
              <IconChip name="formation" tone="solid" size={52} />
              <span className="flex-1">
                <span className="font-display block text-[1.375rem] leading-tight">
                  Boutique de formations
                </span>
                <span className="mt-1 block text-sm text-white/75">
                  Formations, livres, modèles et outils
                </span>
              </span>
              <IconFleche
                size={20}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            {atHome ? (
              <Link
                href="/boutique?famille=cle"
                className="group text-brand-900 hover:shadow-lift flex items-center gap-4 rounded-xl bg-white p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5"
              >
                <IconChip name="cle-usb" size={52} />
                <span className="flex-1">
                  <span className="font-display block text-[1.375rem] leading-tight">
                    Clés de formations
                  </span>
                  <span className="text-ink-soft mt-1 block text-sm">
                    Livrées chez vous, partout au Burkina Faso
                  </span>
                </span>
                <IconFleche
                  size={20}
                  className="text-brand-text transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            ) : null}
          </div>
        </Container>
      </section>

      {/* ===================== Bandeau de confiance (chevauche le héros) ===================== */}
      <Container className="relative z-10 -mt-12">
        <ul className="bg-paper border-line shadow-lift grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
          {[
            { icon: "devis", label: "Devis gratuit et sans engagement" },
            { icon: "support", label: "Réponse sur WhatsApp" },
            { icon: "paiement", label: "Paiement Mobile Money et carte" },
            {
              icon: "verifie",
              label: "Plus de 160 clients nous font confiance",
            },
          ].map((item) => (
            <li
              key={item.label}
              className="bg-paper flex items-center gap-3 p-4 sm:p-5"
            >
              <IconChip name={item.icon as never} size={40} />
              <span className="text-ink text-[0.8125rem] leading-snug font-medium sm:text-sm">
                {fr(item.label)}
              </span>
            </li>
          ))}
        </ul>
      </Container>

      {/* ============================== Services ============================== */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Nos services"
            title={fr("Quatre façons de gagner du temps et de la clarté")}
            lead={fr(
              "Chaque service part de votre situation, pas d'un catalogue. Vous expliquez votre besoin, nous proposons la solution la plus simple qui le résout.",
            )}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {ALL_SERVICE_FAMILIES.map((family, index) => {
              const services = allServices.filter(
                (s) => s.family === family.slug,
              );
              const cheapest = services
                .filter((s) => s.priceFrom)
                .sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0))[0];
              return (
                <Link
                  key={family.slug}
                  href={`/services/${family.slug}`}
                  className="rise-in group"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <Card
                    interactive
                    className="flex h-full flex-col gap-4 p-6 sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <IconChip name={family.icon} size={52} />
                      <span className="text-ink-faint text-xs">
                        {services.length} prestation
                        {services.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display text-ink text-[1.5rem] leading-tight">
                        {family.name}
                      </h3>
                      <p className="text-ink-soft mt-2 text-[0.9375rem] leading-relaxed">
                        {fr(family.tagline)}
                      </p>
                    </div>
                    <ul className="text-ink-soft flex flex-col gap-1.5 text-sm">
                      {services.slice(0, 3).map((service) => (
                        <li
                          key={service.slug}
                          className="flex items-center gap-2.5"
                        >
                          <span
                            aria-hidden
                            className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full"
                          />
                          {service.name}
                        </li>
                      ))}
                    </ul>
                    <div className="border-line mt-auto flex items-center justify-between border-t pt-4">
                      <span className="text-ink-soft text-sm">
                        {cheapest ? formatServicePrice(cheapest) : "Sur devis"}
                      </span>
                      <span className="text-brand-text flex items-center gap-1.5 text-sm font-medium">
                        Découvrir
                        <IconFleche
                          size={16}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ============================== Pourquoi nous ============================== */}
      <section className="bg-paper border-line border-y py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Notre façon de travailler"
            title={fr("Ce que vous pouvez attendre de nous")}
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROMESSES.map((item, index) => (
              <div
                key={item.title}
                className="rise-in flex flex-col gap-4"
                style={{ "--i": index } as React.CSSProperties}
              >
                <IconChip name={item.icon} size={52} />
                <h3 className="font-display text-ink text-[1.25rem] leading-tight">
                  {fr(item.title)}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(item.text)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Boutique ============================== */}
      {featured.length > 0 ? (
        <section className="py-20 sm:py-24">
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="La boutique"
                title={fr("Apprenez, équipez-vous, avancez")}
                lead={fr(
                  "Des formations complètes, des livres, des modèles et des outils prêts à l'emploi. Vous payez en ligne, votre accès s'active tout de suite.",
                )}
              />
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/boutique">
                  Toute la boutique
                  <IconFleche size={16} />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ============================== Méthode ============================== */}
      <section className="bg-brand-900 on-navy text-white">
        <Container className="py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow className="text-brand-200">Comment ça se passe</Eyebrow>
            <h2 className="mt-3 text-[1.625rem] leading-[1.15] sm:text-[2.25rem]">
              {fr("De votre message à la mise en service, en quatre étapes")}
            </h2>
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <span className="font-display text-brand-200 tabular text-[2.5rem] leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-[1.25rem] leading-tight">
                  {fr(step.title)}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-white/75">
                  {fr(step.text)}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ============================== Témoignages (Burkina Faso) ============================== */}
      {testimonials.length > 0 ? (
        <section className="py-20 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="Ils nous ont fait confiance"
              title={fr("Ce que disent nos clients")}
              lead="Des messages reçus de clients, publiés tels quels."
            />
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {testimonials.map((t, index) => (
                <figure
                  key={t.id}
                  className="rise-in border-line bg-paper flex flex-col justify-between gap-5 rounded-lg border p-6"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <blockquote className="font-display text-ink text-[1.25rem] leading-snug">
                    «&nbsp;{fr(t.quote)}&nbsp;»
                  </blockquote>
                  <figcaption className="text-ink-soft text-sm">
                    <span className="text-ink font-medium">{t.author}</span>
                    {t.city ? `, ${t.city}` : ""}
                    {t.productName ? (
                      <span className="text-ink-faint"> · {t.productName}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ============================== FAQ ============================== */}
      <section className="bg-paper border-line border-y py-20 sm:py-24">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-5">
            <SectionHeading
              eyebrow="Questions fréquentes"
              title={fr("Vous hésitez encore ?")}
              lead="Voici ce que l'on nous demande le plus souvent."
            />
            <Button asChild variant="outline" className="w-fit">
              <Link href="/faq">Toutes les questions</Link>
            </Button>
          </div>
          <FaqList items={FAQ} />
        </Container>
      </section>

      {/* ============================== Appel final ============================== */}
      <section className="px-4 pt-4 pb-10 sm:pt-8 sm:pb-12">
        <div className="illus-zone mx-auto max-w-6xl rounded-xl px-6 py-14 text-center sm:px-12 sm:py-16">
          <h2 className="mx-auto max-w-2xl text-[1.75rem] leading-[1.15] sm:text-[2.5rem]">
            {fr("Parlons de votre projet.")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-white/85">
            {fr(
              "Dites-nous ce que vous voulez accomplir. Nous revenons vers vous avec une proposition claire, gratuite et sans engagement.",
            )}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              variant="inverse"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/contact">Demander un devis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/16 sm:w-auto"
            >
              <a
                href={whatsappLink(
                  "Bonjour, j'aimerais discuter de mon projet.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                Écrire sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
