import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import {
  CheckList,
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { JsonLd } from "@/components/json-ld";
import { DevisForm } from "@/components/services/devis-form";
import { ServiceCard } from "@/components/services/service-card";
import { IconFleche, IconHorloge, IconWhatsapp } from "@/components/icons";
import {
  ALL_SERVICES,
  findFamily,
  findService,
  servicesOfFamily,
} from "@/lib/catalog";
import { formatServicePrice } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export function generateStaticParams() {
  return ALL_SERVICES.map((service) => ({
    categorie: service.family,
    service: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[categorie]/[service]">): Promise<Metadata> {
  const { categorie, service: slug } = await params;
  const service = findService(slug);
  if (!service || service.family !== categorie) {
    return { title: "Page introuvable", robots: { index: false } };
  }
  return {
    title: service.seo.title,
    description: service.seo.description,
    alternates: { canonical: `/services/${service.family}/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[categorie]/[service]">) {
  const { categorie, service: slug } = await params;
  const service = findService(slug);
  const family = findFamily(categorie);
  if (!service || !family || service.family !== family.slug) notFound();

  const siblings = servicesOfFamily(family.slug).filter(
    (item) => item.slug !== service.slug,
  );
  const quoteOptions = ALL_SERVICES.map(({ slug, name }) => ({ slug, name }));

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.seo.description,
    serviceType: family.name,
    provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
    areaServed: "BF",
    url: `${SITE.url}/services/${family.slug}/${service.slug}`,
    ...(service.priceFrom
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "XOF",
            price: service.priceFrom,
            priceSpecification:
              service.priceType === "FROM"
                ? {
                    "@type": "PriceSpecification",
                    priceCurrency: "XOF",
                    minPrice: service.priceFrom,
                  }
                : undefined,
          },
        }
      : {}),
  };

  return (
    <div className="flex flex-col">
      <JsonLd data={serviceJsonLd} />

      {/* ============================== Entrée ============================== */}
      <section className="bg-paper border-line border-b">
        <Container className="py-10 sm:py-14">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
              { label: family.name, href: `/services/${family.slug}` },
              { label: service.name },
            ]}
          />
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div className="flex flex-col items-start gap-5">
              <Badge variant="neutral">{family.name}</Badge>
              <h1 className="text-ink text-[2.25rem] leading-[1.05] tracking-[-0.02em] sm:text-[3rem]">
                {service.name}
              </h1>
              <p className="font-display text-brand-text text-[1.5rem] leading-snug">
                {fr(service.tagline)}
              </p>
              <p className="text-ink-soft max-w-2xl text-[1.0625rem] leading-relaxed">
                {fr(service.summary)}
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <a href="#devis">
                    Demander un devis gratuit
                    <IconFleche size={18} />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a
                    href={whatsappLink(
                      `Bonjour, je suis intéressé par « ${service.name} ». Pouvons-nous en discuter ?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconWhatsapp size={18} />
                    Poser une question
                  </a>
                </Button>
              </div>
            </div>

            <aside className="border-line bg-paper-raised rounded-xl border p-6 sm:p-7">
              <p className="text-ink-faint text-[0.6875rem] font-medium tracking-[0.12em] uppercase">
                Tarif
              </p>
              <p className="font-display text-ink tabular mt-2 text-[2rem] leading-none">
                {formatServicePrice(service)}
              </p>
              <p className="text-ink-soft mt-3 text-sm leading-relaxed">
                {fr(service.priceNote)}
              </p>
              <div className="border-line mt-5 flex items-start gap-3 border-t pt-5">
                <IconHorloge
                  size={20}
                  className="text-brand-text mt-0.5 shrink-0"
                />
                <div>
                  <p className="text-ink text-sm font-medium">
                    Délai indicatif
                  </p>
                  <p className="text-ink-soft mt-1 text-sm leading-relaxed">
                    {fr(service.timeline)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* ============================== Vous vous reconnaissez ? ============================== */}
      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Votre situation"
            title={service.problem.title}
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {service.problem.points.map((point, index) => (
              <li
                key={point}
                className="rise-in border-line bg-paper rounded-lg border p-6"
                style={{ "--i": index } as React.CSSProperties}
              >
                <span
                  aria-hidden
                  className="bg-brand-50 text-brand-700 font-display tabular flex h-9 w-9 items-center justify-center rounded-full text-lg"
                >
                  {index + 1}
                </span>
                <p className="text-ink mt-4 text-[1rem] leading-relaxed">
                  {fr(point)}
                </p>
              </li>
            ))}
          </ul>
          <p className="font-display text-ink mt-10 max-w-2xl text-[1.5rem] leading-snug">
            {fr(
              "Si c'est votre cas, voici ce que nous mettons en place pour vous.",
            )}
          </p>
        </Container>
      </section>

      {/* ============================== Ce que vous recevez ============================== */}
      <section className="bg-paper border-line border-y py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Ce que vous recevez"
            title="Concrètement, voici ce que vous obtenez"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.deliverables.map((item, index) => (
              <div
                key={item.title}
                className="rise-in border-line bg-paper-raised flex flex-col gap-3 rounded-lg border p-6"
                style={{ "--i": index } as React.CSSProperties}
              >
                <span aria-hidden className="bg-brand h-1.5 w-8 rounded-full" />
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

      {/* ============================== Comment ça se passe ============================== */}
      <section className="py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="Comment ça se passe"
              title="Étape par étape"
            />
            <div className="border-line bg-paper rounded-xl border p-6">
              <h3 className="font-display text-ink text-[1.25rem] leading-tight">
                C&rsquo;est pour vous si vous êtes…
              </h3>
              <CheckList items={service.forWho.map(fr)} className="mt-4" />
            </div>
          </div>
          <ol className="flex flex-col">
            {service.process.map((step, index) => (
              <li
                key={step.title}
                className="border-line relative flex gap-5 border-l-2 pb-9 pl-8 last:border-transparent last:pb-0"
              >
                <span
                  aria-hidden
                  className="bg-brand text-brand-contrast font-display tabular absolute -left-[17px] flex h-8 w-8 items-center justify-center rounded-full text-base"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-display text-ink text-[1.25rem] leading-tight">
                    {fr(step.title)}
                  </h3>
                  <p className="text-ink-soft mt-2 text-[0.9375rem] leading-relaxed">
                    {fr(step.text)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="bg-paper border-line border-y py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            eyebrow="Questions fréquentes"
            title="Ce que l'on nous demande sur ce service"
          />
          <FaqList items={service.faq} />
        </Container>
      </section>

      {/* ============================== Devis ============================== */}
      <section id="devis" className="scroll-mt-20 py-14 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <Eyebrow>Votre devis gratuit</Eyebrow>
            <h2 className="text-ink text-[1.75rem] leading-[1.1] sm:text-[2.25rem]">
              {fr("Racontez-nous votre projet.")}
            </h2>
            <p className="text-ink-soft text-[1.0625rem] leading-relaxed">
              {fr(
                "Quelques phrases suffisent. Nous revenons vers vous avec une proposition claire : ce qui est livré, le prix, le délai.",
              )}
            </p>
            <ul className="flex flex-col gap-4">
              {[
                { icon: "devis", text: "Gratuit et sans engagement" },
                { icon: "horloge", text: "Réponse sous 24 h ouvrées" },
                {
                  icon: "verifie",
                  text: "Un conseil honnête, même si ce n'est pas nous qu'il vous faut",
                },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <IconChip name={item.icon as never} size={40} />
                  <span className="text-ink text-[0.9375rem] font-medium">
                    {fr(item.text)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-ink-soft text-sm">
              Vous préférez discuter ?{" "}
              <a
                href={whatsappLink(
                  `Bonjour, je suis intéressé par « ${service.name} ».`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text font-medium underline underline-offset-4"
              >
                Écrivez-nous sur WhatsApp
              </a>
              .
            </p>
          </div>
          <div className="border-line bg-paper shadow-card rounded-xl border p-6 sm:p-8">
            <DevisForm
              services={quoteOptions}
              defaultServiceSlug={service.slug}
            />
          </div>
        </Container>
      </section>

      {/* ============================== Autres prestations ============================== */}
      {siblings.length > 0 ? (
        <section className="bg-paper border-line border-t py-14 sm:py-20">
          <Container>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow={family.name}
                title="Autres prestations de cette famille"
              />
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/services">Tous les services</Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {siblings.slice(0, 3).map((item, index) => (
                <ServiceCard key={item.slug} service={item} index={index} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </div>
  );
}
