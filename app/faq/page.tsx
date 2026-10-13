import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { Container, SectionHeading } from "@/components/ui/section";
import { JsonLd } from "@/components/json-ld";
import { IconWhatsapp } from "@/components/icons";
import { getVisitorCountry, isHomeCountry } from "@/lib/geo";
import { SERVICE_FAQ } from "@/lib/content";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";
import type { Faq } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Commande, paiement, livraison, accès, devis : les réponses aux questions les plus fréquentes sur Référence Informatique.",
  alternates: { canonical: "/faq" },
};

const COMMANDER: Faq[] = [
  {
    question: "Comment puis-je payer ?",
    answer:
      "En ligne, par carte bancaire ou Mobile Money, sur une page de paiement sécurisée : nous ne voyons jamais vos codes. Vous pouvez aussi commander par WhatsApp si vous préférez discuter.",
  },
  {
    question: "Dois-je créer un compte pour commander ?",
    answer:
      "Oui, un compte gratuit est nécessaire : c'est lui qui vous donne accès à vos achats, à tout moment, dans votre espace client. La création prend une minute.",
  },
  {
    question: "J'ai payé mais je ne vois rien dans mon espace. Que faire ?",
    answer: `Patientez quelques minutes et actualisez la page : la confirmation de paiement peut prendre un instant. Si rien n'apparaît, écrivez-nous sur WhatsApp au ${SITE.phoneDisplay} avec votre nom et le produit commandé : nous vérifions tout de suite.`,
  },
  {
    question: "Puis-je acheter depuis l'étranger ?",
    answer:
      "Oui, pour les formations, livres numériques, modèles et outils : l'accès s'active dans votre espace dès que le paiement est confirmé.",
  },
];

const ACCES: Faq[] = [
  {
    question: "Comment vais-je recevoir un produit numérique ?",
    answer:
      "Dès que votre paiement est confirmé, votre accès s'active dans votre espace client, rubrique « Mes formations », et vous recevez un email de confirmation. Il n'y a pas de livraison à attendre.",
  },
  {
    question: "Pendant combien de temps ai-je accès à mes achats ?",
    answer:
      "Les produits présentés avec un accès à vie restent disponibles dans votre espace client sans limite de durée. La fiche de chaque produit précise ce qui s'applique.",
  },
  {
    question: "Je n'arrive pas à me connecter ou à ouvrir un contenu.",
    answer: `Utilisez « Mot de passe oublié » sur la page de connexion si c'est un problème de mot de passe. Pour tout autre souci, écrivez-nous sur WhatsApp au ${SITE.phoneDisplay} : une personne vous aide.`,
  },
];

const CLES: Faq[] = [
  {
    question: "Comment se passe la livraison d'une clé de formations ?",
    answer:
      "Elle est gratuite partout au Burkina Faso, à domicile ou au bureau, sous 24 à 48 h après la confirmation de votre paiement.",
  },
  {
    question: "La clé fonctionne-t-elle sans internet ?",
    answer:
      "Oui. Vous la branchez sur un ordinateur Windows ou Mac et vous apprenez, même sans connexion. L'accès à la plateforme en ligne est en plus inclus.",
  },
  {
    question: "Que se passe-t-il si je perds ma clé ?",
    answer:
      "Votre accès à la plateforme en ligne reste actif : vous retrouvez vos formations. Écrivez-nous sur WhatsApp, nous cherchons une solution ensemble.",
  },
];

const COMPTE: Faq[] = [
  {
    question: "Mes données sont-elles protégées ?",
    answer:
      "Nous ne collectons que ce qui est nécessaire pour traiter votre commande ou votre demande, et nous ne vendons aucune donnée. Les détails sont dans notre politique de confidentialité.",
  },
  {
    question: "Vos paiements sont-ils sécurisés ?",
    answer:
      "Les paiements passent par une page de paiement sécurisée. Nous ne voyons ni ne conservons vos numéros de carte ou vos codes Mobile Money.",
  },
];

export default async function FaqPage() {
  const country = await getVisitorCountry();
  const atHome = isHomeCountry(country);

  const groups: { title: string; items: Faq[] }[] = [
    { title: "Commander et payer", items: COMMANDER },
    {
      title: "Livraison et accès",
      items: atHome ? [...ACCES, ...CLES] : ACCES,
    },
    { title: "Services et devis", items: SERVICE_FAQ },
    { title: "Compte et sécurité", items: COMPTE },
  ];

  const all = groups.flatMap((group) => group.items);

  return (
    <div className="py-12 sm:py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: all.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />
      <Container className="flex flex-col gap-14">
        <SectionHeading
          as="h1"
          eyebrow="Aide"
          title={fr("Questions fréquentes")}
          lead={fr(
            "Les réponses à ce que l'on nous demande le plus souvent. Si la vôtre n'y est pas, écrivez-nous : nous répondons.",
          )}
        />

        {groups.map((group) => (
          <section
            key={group.title}
            className="grid gap-6 lg:grid-cols-[1fr_1.8fr] lg:gap-14"
          >
            <h2 className="text-ink text-[1.5rem] leading-tight sm:text-[1.875rem]">
              {group.title}
            </h2>
            <FaqList items={group.items} withJsonLd={false} />
          </section>
        ))}

        <div className="border-line bg-paper flex flex-col items-start gap-5 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-ink text-[1.5rem] leading-tight">
              Vous ne trouvez pas votre réponse ?
            </h2>
            <p className="text-ink-soft mt-2 text-[0.9375rem] leading-relaxed">
              {fr(
                "Écrivez-nous sur WhatsApp ou avec le formulaire : une personne vous répond.",
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button asChild variant="whatsapp">
              <a
                href={whatsappLink("Bonjour, j'ai une question.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact?sujet=question">Formulaire</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
