import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/section";
import { IconTelephone, IconWhatsapp } from "@/components/icons";
import { getAllServices, getService } from "@/lib/catalog/live";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";
import { ContactTabs } from "./contact-tabs";

export const metadata: Metadata = {
  title: "Contact : devis gratuit, question ou WhatsApp",
  description:
    "Demandez un devis gratuit ou posez une question à Référence Informatique, par WhatsApp, par téléphone ou avec le formulaire.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: PageProps<"/contact">) {
  const { sujet, service } = await searchParams;

  const defaultTab = sujet === "question" ? "question" : "devis";
  const requested =
    typeof service === "string" ? await getService(service) : undefined;
  const services = (await getAllServices()).map(({ slug, name }) => ({
    slug,
    name,
  }));

  return (
    <div className="pt-10 pb-8 sm:pt-14 sm:pb-12">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading
            as="h1"
            eyebrow="Contact"
            title={fr("Parlons de ce que vous voulez accomplir.")}
            lead={fr(
              "Un projet, une question, un doute avant d'acheter : écrivez-nous. Une vraie personne vous répond.",
            )}
          />

          <div className="flex flex-col gap-3">
            <a
              href={whatsappLink("Bonjour, j'ai une question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-line bg-paper flex items-center gap-4 rounded-lg border p-4 transition-colors duration-200 hover:border-green-600"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-green-100 text-green-700">
                <IconWhatsapp size={24} />
              </span>
              <span>
                <span className="text-ink block text-[0.9375rem] font-medium">
                  WhatsApp
                </span>
                <span className="text-ink-soft block text-sm">
                  Le plus rapide : {SITE.phoneDisplay}
                </span>
              </span>
            </a>
            <a
              href={`tel:${SITE.phoneInternational}`}
              className="border-line bg-paper hover:border-brand flex items-center gap-4 rounded-lg border p-4 transition-colors duration-200"
            >
              <span className="bg-brand-50 text-brand-text flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px]">
                <IconTelephone size={24} />
              </span>
              <span>
                <span className="text-ink block text-[0.9375rem] font-medium">
                  Téléphone
                </span>
                <span className="text-ink-soft block text-sm">
                  {SITE.phoneDisplay}
                </span>
              </span>
            </a>
          </div>

          <div className="border-line bg-paper rounded-lg border p-5">
            <h2 className="font-display text-ink text-[1.25rem] leading-tight">
              Ce qui se passe après votre message
            </h2>
            <ol className="text-ink-soft mt-4 flex flex-col gap-3 text-[0.9375rem] leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand tabular font-display text-lg leading-snug">
                  1
                </span>
                Nous lisons votre demande et, si besoin, nous vous posons une ou
                deux questions.
              </li>
              <li className="flex gap-3">
                <span className="text-brand tabular font-display text-lg leading-snug">
                  2
                </span>
                Vous recevez une réponse claire sous 24 h ouvrées.
              </li>
              <li className="flex gap-3">
                <span className="text-brand tabular font-display text-lg leading-snug">
                  3
                </span>
                Si vous êtes d&rsquo;accord, nous démarrons. Sinon, aucune
                obligation.
              </li>
            </ol>
          </div>
        </div>

        <div className="border-line bg-paper shadow-card h-fit rounded-xl border p-6 sm:p-8">
          <ContactTabs
            defaultTab={defaultTab}
            services={services}
            defaultServiceSlug={requested?.slug}
          />
        </div>
      </Container>
    </div>
  );
}
