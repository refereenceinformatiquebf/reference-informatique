import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { formatServicePrice } from "@/lib/format";
import { ServiceCategoryIcon } from "@/components/marketing/service-category-icon";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { DevisForm } from "./devis-form";

export const dynamic = "force-dynamic";

const FAQ_COMMUNE = [
  {
    question: "Quel est le délai moyen pour un projet ?",
    answer:
      "Cela dépend de la complexité — nous vous donnons un délai précis dans le devis, après avoir compris votre besoin. Un site vitrine simple prend généralement 1 à 2 semaines.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "Un acompte au démarrage, le solde à la livraison. Orange Money, Wave ou virement — selon ce qui vous convient.",
  },
  {
    question: "Y a-t-il un support après la livraison ?",
    answer:
      "Oui, une période de garantie est incluse dans chaque devis. Un contrat de maintenance est disponible ensuite si vous le souhaitez.",
  },
];

async function getCategory(slug: string) {
  return prisma.serviceCategory.findUnique({
    where: { slug },
    include: {
      services: { where: { active: true }, orderBy: { displayOrder: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[categorie]">): Promise<Metadata> {
  const { categorie } = await params;
  const category = await getCategory(categorie);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
  };
}

export default async function ServiceCategoryPage({
  params,
}: PageProps<"/services/[categorie]">) {
  const { categorie } = await params;
  const category = await getCategory(categorie);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <section className="border-line border-b px-4 py-14">
        <div className="mx-auto flex max-w-3xl items-start gap-4">
          <span className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
            <ServiceCategoryIcon iconKey={category.iconKey} size={24} />
          </span>
          <div>
            <h1 className="text-ink text-2xl font-bold">{category.name}</h1>
            <p className="text-ink-soft mt-2 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-3xl gap-5">
          {category.services.map((service) => (
            <div key={service.id} className="border-line rounded-lg border p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-ink text-base font-semibold">
                  {service.name}
                </h2>
                <span className="text-brand tabular text-sm font-bold">
                  {formatServicePrice(service)}
                </span>
              </div>
              <p className="text-ink-soft mt-2 text-sm leading-relaxed">
                {service.description}
              </p>
              {service.features.length > 0 ? (
                <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-ink-soft flex items-center gap-2 text-xs"
                    >
                      <span className="bg-brand h-1 w-1 shrink-0 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="border-line bg-paper-raised border-y px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-ink mb-4 text-lg font-bold">
            Questions fréquentes
          </h2>
          <Accordion type="single" collapsible>
            {FAQ_COMMUNE.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-lg">
          <h2 className="text-ink text-lg font-bold">Demander un devis</h2>
          <p className="text-ink-soft mt-2 mb-6 text-sm">
            Décrivez votre besoin, nous revenons vers vous sous 24h ouvrées.
          </p>
          <DevisForm services={category.services} />
        </div>
      </section>
    </div>
  );
}
