import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/section";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données Référence Informatique collecte, pourquoi, et comment vous gardez la maîtrise de vos informations.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

const SECTIONS = [
  {
    title: "Quelles données nous collectons",
    body: "Lorsque vous créez un compte, passez commande ou demandez un devis, nous collectons votre nom, votre numéro de téléphone, votre adresse email et, selon le cas, le contenu de votre message. Pour un produit livré physiquement, nous collectons aussi votre ville, votre adresse de livraison et un numéro joignable. Lorsque vous consultez une formation, nous enregistrons quelles leçons vous avez ouvertes, pour afficher votre progression.",
  },
  {
    title: "Pourquoi nous les collectons",
    body: "Ces données servent uniquement à traiter vos commandes et vos demandes, activer votre accès, vous livrer, vous contacter à propos de votre compte ou de votre commande, et améliorer nos services. Nous ne vendons ni ne louons vos données à des tiers.",
  },
  {
    title: "Paiement",
    body: "Les paiements en ligne sont traités par SasPay, qui reçoit les informations nécessaires à la transaction (montant, nom, adresse email et numéro de téléphone). Nous ne stockons jamais vos identifiants Mobile Money ou vos numéros de carte bancaire : ces données transitent uniquement par SasPay.",
  },
  {
    title: "Votre pays",
    body: "Pour décider quelles offres vous sont proposées, notre serveur détermine votre pays à partir de votre adresse IP. Cette information n'est pas enregistrée dans votre compte et n'est pas conservée.",
  },
  {
    title: "Emails",
    body: "Nous vous écrivons pour confirmer vos commandes, vos paiements et vos accès, et pour répondre à vos demandes. Nous n'envoyons pas de publicité sans que vous l'ayez demandée.",
  },
  {
    title: "Conservation",
    body: "Vos données sont conservées tant que votre compte est actif, puis archivées pendant la durée nécessaire au respect de nos obligations comptables et légales.",
  },
  {
    title: "Vos droits",
    body: "Vous pouvez demander l'accès, la correction ou la suppression de vos données à tout moment en nous contactant par WhatsApp ou avec le formulaire de la page Contact.",
  },
] as const;

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="py-12 sm:py-16">
      <Container className="flex max-w-3xl flex-col gap-10">
        <SectionHeading
          as="h1"
          eyebrow="Confidentialité"
          title={fr("Politique de confidentialité")}
          lead={fr(
            "Référence Informatique s'engage à protéger vos données personnelles. Voici, simplement, ce que nous collectons et ce que nous en faisons.",
          )}
        />
        {SECTIONS.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-ink text-[1.375rem] leading-tight">
              {section.title}
            </h2>
            <p className="text-ink-soft text-[1rem] leading-relaxed">
              {fr(section.body)}
            </p>
          </section>
        ))}
      </Container>
    </div>
  );
}
