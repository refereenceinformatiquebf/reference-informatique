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
    body: "Lorsque vous créez un compte, passez commande ou demandez un devis, nous collectons votre nom, votre numéro de téléphone, votre adresse email et, selon le cas, le contenu de votre message. Si vous commandez sans créer de compte, nous préparons pour vous un compte sans mot de passe à partir de votre adresse email : il vous permet de retrouver vos achats avec un simple lien reçu par email. Pour un produit livré physiquement, nous collectons aussi votre ville, votre adresse de livraison et un numéro joignable. Lorsque vous consultez une formation, nous enregistrons quelles leçons vous avez ouvertes, pour afficher votre progression.",
  },
  {
    title: "Pourquoi nous les collectons",
    body: "Ces données servent à traiter vos commandes et vos demandes, activer votre accès, vous livrer, vous contacter à propos de votre compte ou de votre commande, et améliorer nos services. La mesure de nos publicités fait l'objet d'une rubrique à part, plus bas. Nous ne vendons ni ne louons vos données à des tiers.",
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
    body: "Nous vous écrivons pour confirmer vos commandes, vos paiements et vos accès, et pour répondre à vos demandes. Si vous ne terminez pas un paiement, nous pouvons vous envoyer un seul rappel pour le reprendre. Nous n'envoyons pas de publicité sans que vous l'ayez demandée.",
  },
  {
    title: "Mesure d'audience et publicité (pixel Meta)",
    body: "Notre site utilise le pixel Meta (Facebook et Instagram). Grâce à des cookies et à des identifiants, il enregistre les pages que vous consultez, le produit que vous regardez, les étapes de votre commande et, si vous achetez, le montant et la référence de la commande. Nous l'utilisons pour mesurer l'efficacité de nos publicités sur Facebook et Instagram et pour les montrer à des personnes susceptibles d'être intéressées. Ces informations sont transmises à Meta Platforms, qui les traite selon sa propre politique de confidentialité. Nous ne lui transmettons volontairement ni votre nom, ni vos moyens de paiement, ni votre mot de passe. Selon les réglages de mesure du pixel, Meta peut toutefois lire dans nos formulaires votre adresse email ou votre numéro de téléphone et les recevoir sous forme chiffrée (hachée), afin de reconnaître votre compte et de relier vos actions à nos publicités. Le pixel n'est pas chargé sur les pages de votre espace client, de connexion et d'administration. Pour le refuser, vous pouvez régler vos préférences publicitaires dans votre compte Facebook (facebook.com/adpreferences), bloquer les cookies de suivi dans votre navigateur, ou nous écrire.",
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
    <div className="pt-12 pb-8 sm:pt-14 sm:pb-10">
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
