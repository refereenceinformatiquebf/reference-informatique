import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import {
  CheckList,
  Container,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { ServiceCard } from "@/components/services/service-card";
import { IconFleche, IconWhatsapp } from "@/components/icons";
import {
  ALL_SERVICE_FAMILIES,
  findFamily,
  servicesOfFamily,
} from "@/lib/catalog";
import { SERVICE_FAQ, WORK_STEPS } from "@/lib/content";
import { whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

export function generateStaticParams() {
  return ALL_SERVICE_FAMILIES.map((family) => ({ categorie: family.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[categorie]">): Promise<Metadata> {
  const { categorie } = await params;
  const family = findFamily(categorie);
  if (!family) return { title: "Page introuvable", robots: { index: false } };
  return {
    title: family.seo.title,
    description: family.seo.description,
    alternates: { canonical: `/services/${family.slug}` },
  };
}

export default async function ServiceFamilyPage({
  params,
}: PageProps<"/services/[categorie]">) {
  const { categorie } = await params;
  const family = findFamily(categorie);
  if (!family) notFound();

  const services = servicesOfFamily(family.slug);

  return (
    <div className="flex flex-col">
      {/* ============================== Entrée ============================== */}
      <section className="bg-paper border-line border-b">
        <Container className="py-10 sm:py-14">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Services", href: "/services" },
              { label: family.name },
            ]}
          />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div className="flex flex-col items-start gap-5">
              <IconChip name={family.icon} size={56} />
              <h1 className="text-ink text-[2.25rem] leading-[1.05] tracking-[-0.02em] sm:text-[3rem]">
                {family.name}
              </h1>
              <p className="font-display text-brand-text text-[1.5rem] leading-snug">
                {fr(family.tagline)}
              </p>
              {family.intro.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-ink-soft max-w-2xl text-[1.0625rem] leading-relaxed"
                >
                  {fr(paragraph)}
                </p>
              ))}
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link
                    href={`/contact?sujet=devis&service=${services[0]?.slug ?? ""}`}
                  >
                    Demander un devis gratuit
                    <IconFleche size={18} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a
                    href={whatsappLink(
                      `Bonjour, j'aimerais en savoir plus sur « ${family.name} ».`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconWhatsapp size={18} />
                    En parler sur WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <aside className="border-line bg-paper-raised rounded-xl border p-6 sm:p-7">
              <h2 className="font-display text-ink text-[1.375rem] leading-tight">
                C&rsquo;est pour vous si vous êtes…
              </h2>
              <CheckList items={family.forWho.map(fr)} className="mt-5" />
            </aside>
          </div>
        </Container>
      </section>

      {/* ============================== Prestations ============================== */}
      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Les prestations"
            title={fr("Choisissez celle qui correspond à votre besoin")}
            lead={fr(
              "Chaque fiche explique ce que vous recevez, comment ça se passe et ce que ça coûte.",
            )}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <ServiceCard key={service.slug} service={service} index={index} />
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Méthode ============================== */}
      <section className="bg-paper border-line border-y py-14 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Comment ça se passe"
            title="Quatre étapes, sans surprise"
          />
          <ol className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WORK_STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-3">
                <span className="font-display text-brand tabular text-[2.25rem] leading-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-ink text-[1.1875rem] leading-tight">
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
      <section className="py-14 sm:py-20">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.6fr]">
          <SectionHeading
            eyebrow="Questions fréquentes"
            title="Avant de nous écrire"
          />
          <FaqList items={SERVICE_FAQ} />
        </Container>
      </section>

      {/* ============================== Appel final ============================== */}
      <section className="px-4 pb-10 sm:pb-12">
        <div className="illus-zone mx-auto max-w-6xl rounded-xl px-6 py-12 text-center sm:px-12">
          <h2 className="mx-auto max-w-xl text-[1.75rem] leading-[1.15] sm:text-[2.25rem]">
            {fr(`Un projet de ${family.name.toLowerCase()} ?`)}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-white/85">
            {fr(
              "Racontez-le en quelques phrases : vous recevez une proposition claire et gratuite.",
            )}
          </p>
          <div className="mt-7">
            <Button asChild variant="inverse" size="lg">
              <Link
                href={`/contact?sujet=devis&service=${services[0]?.slug ?? ""}`}
              >
                Demander un devis gratuit
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
