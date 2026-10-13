import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/section";
import { getVisitorCountry, isHomeCountry } from "@/lib/geo";
import { SITE } from "@/lib/site";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Conditions générales de vente et de service",
  description:
    "Conditions applicables aux achats de la boutique et aux prestations de services de Référence Informatique.",
  alternates: { canonical: "/conditions-generales" },
};

/**
 * Conditions générales : rédigées en langage simple et limitées à ce que le
 * site fait réellement. Elles ne contiennent aucun engagement qu'on ne
 * pourrait pas tenir (pas de délai de rétractation inventé, pas de garantie
 * chiffrée). Elles doivent être relues par un juriste avant d'être
 * considérées comme définitives.
 */
type Paragraph = string | { text: string; homeOnly: true };

const SECTIONS: { title: string; body: Paragraph[] }[] = [
  {
    title: "1. Qui nous sommes",
    body: [
      `Référence Informatique est une entreprise burkinabè qui propose des prestations de services numériques (sites web, agents IA, logiciels, automatisation, maintenance) et une boutique de formations et de ressources numériques. Vous pouvez nous joindre par WhatsApp ou par téléphone au ${SITE.phoneDisplay}, ou avec le formulaire de la page Contact.`,
    ],
  },
  {
    title: "2. Prix et paiement",
    body: [
      "Tous les prix sont indiqués en francs CFA (F CFA). Le prix applicable est celui affiché au moment de votre commande.",
      "Les achats de la boutique se paient en ligne, par carte bancaire ou Mobile Money, sur une page de paiement sécurisée. Nous ne voyons ni ne conservons vos numéros de carte ou vos codes.",
      "Pour les services, le prix et les modalités de paiement (en général un acompte au démarrage et le solde à la livraison) figurent dans le devis que vous acceptez.",
    ],
  },
  {
    title: "3. Produits de la boutique : livraison et accès",
    body: [
      "Produits numériques : votre accès s'active dans votre espace client dès que votre paiement est confirmé. Vous recevez un email de confirmation.",
      "Produits à prestation manuelle (formation en direct, outil remis par notre équipe) : après confirmation du paiement, notre équipe vous contacte par WhatsApp pour vous remettre votre accès.",
      {
        // Offre réservée au Burkina Faso : ce paragraphe n'est affiché
        // qu'aux visiteurs de ce pays (comme la boutique des clés).
        homeOnly: true,
        text: "Clés de formations (Burkina Faso uniquement) : la livraison de la clé est gratuite et intervient sous 24 à 48 h après la confirmation du paiement.",
      },
      "Lorsqu'un produit est présenté avec un « accès à vie », cela signifie que vous pouvez y accéder depuis votre espace client sans limite de durée.",
    ],
  },
  {
    title: "4. Si quelque chose ne se passe pas comme prévu",
    body: [
      "Si vous rencontrez un problème d'accès, ou si un produit ne correspond pas à sa description, contactez-nous en indiquant votre nom et le produit commandé. Nous cherchons d'abord à résoudre le problème.",
      "Si aucune solution n'est possible, nous étudions votre situation au cas par cas, de bonne foi.",
    ],
  },
  {
    title: "5. Services sur mesure",
    body: [
      "Chaque projet fait l'objet d'un devis gratuit qui précise ce qui est livré, le prix, le délai, la période de garantie et les conditions de propriété et d'utilisation. Le travail démarre une fois le devis accepté.",
      "Le travail avance par étapes que vous validez. Les modifications qui sortent du périmètre du devis peuvent faire l'objet d'un avenant, que nous vous soumettons avant de les réaliser.",
    ],
  },
  {
    title: "6. Utilisation de nos contenus",
    body: [
      "Les formations, livres et modèles que vous achetez sont destinés à votre usage personnel ou à celui de votre structure, selon ce qui est indiqué sur la fiche. Vous ne pouvez pas les revendre ni les redistribuer.",
    ],
  },
  {
    title: "7. Vos données",
    body: [
      "Nous collectons uniquement les informations nécessaires pour traiter vos commandes et vos demandes. Les détails figurent dans notre politique de confidentialité.",
    ],
  },
  {
    title: "8. Évolution de ces conditions",
    body: [
      "Nous pouvons faire évoluer ces conditions. La version applicable à votre commande est celle en vigueur à la date de cette commande.",
    ],
  },
];

export default async function ConditionsGeneralesPage() {
  const atHome = isHomeCountry(await getVisitorCountry());

  return (
    <div className="py-12 sm:py-16">
      <Container className="flex max-w-3xl flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Conditions"
          title={fr("Conditions générales de vente et de service")}
          lead={fr(
            "En clair : ce que nous faisons, ce que vous recevez, et ce qui se passe quand il y a un souci.",
          )}
        />
        {SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-ink text-[1.375rem] leading-tight">
              {section.title}
            </h2>
            {section.body.map((paragraph) => {
              const text =
                typeof paragraph === "string" ? paragraph : paragraph.text;
              if (
                typeof paragraph !== "string" &&
                paragraph.homeOnly &&
                !atHome
              ) {
                return null;
              }
              return (
                <p
                  key={text}
                  className="text-ink-soft text-[1rem] leading-relaxed"
                >
                  {fr(text)}
                </p>
              );
            })}
          </section>
        ))}
      </Container>
    </div>
  );
}
