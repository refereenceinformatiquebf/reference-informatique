import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, SectionHeading } from "@/components/ui/section";
import { getLegalSettings, isLegalComplete } from "@/lib/settings";
import { SITE } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de ${SITE.name} : éditeur du site, hébergeur et contact.`,
  alternates: { canonical: "/mentions-legales" },
};

/**
 * Page rédigée à partir des informations saisies dans l'administration
 * (Paramètres). Elle n'existe que si les informations indispensables sont
 * renseignées : jamais de champ vide ni de texte inventé.
 */
export default async function MentionsLegalesPage() {
  const legal = await getLegalSettings();
  if (!isLegalComplete(legal)) notFound();

  const publisher = [
    [
      "Éditeur du site",
      `${legal.companyName}${legal.legalForm ? `, ${legal.legalForm}` : ""}`,
    ],
    ["Siège", legal.address],
    legal.registration ? ["Immatriculation (RCCM)", legal.registration] : null,
    legal.taxId ? ["Identifiant fiscal (IFU)", legal.taxId] : null,
    legal.publicationDirector
      ? ["Directeur de la publication", legal.publicationDirector]
      : null,
    ["Contact", legal.contactEmail],
  ].filter((row): row is string[] => row !== null);

  return (
    <div className="pt-12 pb-8 sm:pt-14 sm:pb-10">
      <Container className="flex max-w-3xl flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Informations légales"
          title={fr("Mentions légales")}
          lead={fr(`Qui édite et héberge ${SITE.name}.`)}
        />
        <section className="flex flex-col gap-3">
          <h2 className="text-ink text-[1.375rem] leading-tight">Éditeur</h2>
          <dl className="text-ink-soft flex flex-col gap-2 text-[1rem] leading-relaxed">
            {publisher.map(([label, value]) => (
              <div key={label}>
                <dt className="text-ink font-medium">{label}</dt>
                <dd className="whitespace-pre-line">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        {legal.hostName ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-ink text-[1.375rem] leading-tight">
              Hébergement
            </h2>
            <p className="text-ink-soft text-[1rem] leading-relaxed">
              Le site est hébergé par {legal.hostName}
              {legal.hostAddress ? `, ${legal.hostAddress}` : ""}.
            </p>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
