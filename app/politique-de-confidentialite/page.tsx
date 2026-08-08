import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false, follow: true },
};

const SECTIONS = [
  {
    title: "Quelles données nous collectons",
    body: "Lorsque vous créez un compte, passez commande ou demandez un devis, nous collectons votre nom, votre numéro de téléphone, votre adresse email et, selon le cas, le contenu de votre message. Lorsque vous consultez une formation, nous enregistrons quelles leçons vous avez visionnées, pour afficher votre progression.",
  },
  {
    title: "Pourquoi nous les collectons",
    body: "Ces données servent uniquement à traiter vos commandes et demandes, activer votre accès aux formations, vous contacter à propos de votre compte, et améliorer nos services. Nous ne vendons ni ne louons vos données à des tiers.",
  },
  {
    title: "Paiement",
    body: "Les paiements en ligne sont traités par FedaPay, qui reçoit les informations nécessaires à la transaction (montant, coordonnées de contact). Nous ne stockons jamais vos identifiants Mobile Money ou vos numéros de carte bancaire — ces données transitent uniquement par FedaPay.",
  },
  {
    title: "Conservation",
    body: "Vos données sont conservées tant que votre compte est actif, puis archivées pendant la durée nécessaire au respect de nos obligations comptables et légales.",
  },
  {
    title: "Vos droits",
    body: "Vous pouvez demander l'accès, la correction ou la suppression de vos données à tout moment en nous contactant par email ou WhatsApp.",
  },
] as const;

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-ink text-2xl font-bold">
        Politique de confidentialité
      </h1>
      <p className="text-ink-soft mt-3 text-sm leading-relaxed">
        Référence Informatique s&apos;engage à protéger vos données
        personnelles. Cette page explique quelles données nous collectons et
        comment elles sont utilisées.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-ink text-base font-bold">{section.title}</h2>
            <p className="text-ink-soft mt-2 text-sm leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
