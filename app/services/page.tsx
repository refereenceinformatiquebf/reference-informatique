import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import {
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { ServiceCard } from "@/components/services/service-card";
import { IconFleche, IconWhatsapp } from "@/components/icons";
import { ALL_SERVICE_FAMILIES, servicesOfFamily } from "@/lib/catalog";
import { SERVICE_FAQ, WORK_STEPS } from "@/lib/content";
import { whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Services : sites web, agents IA, automatisation et maintenance",
  description:
    "Création de sites web, agents IA, logiciels sur mesure, automatisation et maintenance informatique. Un devis clair et gratuit, expliqué simplement.",
  alternates: { canonical: "/services" },
};

const ARGUMENTS = [
  {
    icon: "devis",
    title: "Le prix est écrit avant de commencer",
    text: "Chaque projet démarre par un devis : ce qui est livré, le prix, le délai. Vous savez ce que vous achetez et ce que ça coûte, sans surprise.",
  },
  {
    icon: "verifie",
    title: "Vous comprenez ce que nous faisons",
    text: "Nous parlons votre langage, pas celui des informaticiens. À chaque étape, vous savez ce qui se passe et pourquoi.",
  },
  {
    icon: "bouclier",
    title: "Vous gardez le contrôle",
    text: "Vous validez ce qui avance, étape par étape. Nos agents IA préparent le travail ; c'est vous qui décidez.",
  },
  {
    icon: "support",
    title: "Nous restons joignables après la livraison",
    text: "Une question, un souci, une idée d'évolution ? Vous écrivez sur WhatsApp, une personne vous répond.",
  },
] as const;

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* ============================== Entrée ============================== */}
      <section className="bg-paper border-line border-b">
        <Container className="py-14 sm:py-20">
          <SectionHeading
            as="h1"
            eyebrow="Nos services"
            title={fr("Des services numériques, expliqués simplement.")}
            lead={fr(
              "Vous décrivez votre besoin avec vos mots. Nous revenons vers vous avec une proposition claire, gratuite et sans engagement. Si une solution plus simple vous convient mieux, nous vous le disons.",
            )}
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact">
                Demander un devis gratuit
                <IconFleche size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href={whatsappLink(
                  "Bonjour, j'aimerais discuter d'un projet avec vous.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                En parler sur WhatsApp
              </a>
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================== Familles ============================== */}
      {ALL_SERVICE_FAMILIES.map((family, familyIndex) => {
        const services = servicesOfFamily(family.slug);
        return (
          <section
            key={family.slug}
            id={family.slug}
            className={
              familyIndex % 2 === 0
                ? "py-16 sm:py-20"
                : "bg-paper border-line border-y py-16 sm:py-20"
            }
          >
            <Container>
              <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
                <div className="flex flex-col items-start gap-5 lg:sticky lg:top-24 lg:self-start">
                  <IconChip name={family.icon} size={56} />
                  <h2 className="text-ink text-[1.75rem] leading-[1.1] sm:text-[2.25rem]">
                    {family.name}
                  </h2>
                  <p className="font-display text-brand-text text-[1.25rem] leading-snug">
                    {fr(family.tagline)}
                  </p>
                  {family.intro.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-ink-soft text-[0.9375rem] leading-relaxed"
                    >
                      {fr(paragraph)}
                    </p>
                  ))}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/services/${family.slug}`}>
                      Tout savoir sur cette famille
                      <IconFleche size={16} />
                    </Link>
                  </Button>
                </div>

                <div className="grid content-start gap-5 sm:grid-cols-2">
                  {services.map((service, index) => (
                    <ServiceCard
                      key={service.slug}
                      service={service}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      {/* ============================== Arguments ============================== */}
      <section className="bg-brand-900 on-navy text-white">
        <Container className="py-16 sm:py-20">
          <div className="max-w-2xl">
            <Eyebrow className="text-brand-200">
              Pourquoi nous confier votre projet
            </Eyebrow>
            <h2 className="mt-3 text-[1.625rem] leading-[1.15] sm:text-[2.25rem]">
              {fr("Ce que vous pouvez attendre de nous")}
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ARGUMENTS.map((item) => (
              <div key={item.title} className="flex flex-col gap-4">
                <IconChip name={item.icon} tone="solid" size={52} />
                <h3 className="font-display text-[1.25rem] leading-tight">
                  {fr(item.title)}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-white/75">
                  {fr(item.text)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Méthode ============================== */}
      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Comment ça se passe"
            title={fr("Du premier message à la mise en service")}
          />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WORK_STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <span className="font-display text-brand tabular text-[2.5rem] leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-ink text-[1.25rem] leading-tight">
                  {fr(step.title)}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(step.text)}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="bg-paper border-line border-y py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            eyebrow="Questions fréquentes"
            title={fr("Ce que l'on nous demande avant de commencer")}
          />
          <FaqList items={SERVICE_FAQ} />
        </Container>
      </section>

      {/* ============================== Appel final ============================== */}
      <section className="px-4 py-16 sm:py-20">
        <div className="illus-zone mx-auto max-w-6xl rounded-xl px-6 py-14 text-center sm:px-12">
          <h2 className="mx-auto max-w-2xl text-[1.75rem] leading-[1.15] sm:text-[2.5rem]">
            {fr("Un projet en tête ? Parlons-en.")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-white/85">
            {fr(
              "Décrivez-le en quelques phrases. Vous recevez une proposition claire, gratuite, sans engagement.",
            )}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="inverse" size="lg">
              <Link href="/contact">Demander un devis gratuit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
