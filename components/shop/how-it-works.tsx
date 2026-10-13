import { fr } from "@/lib/typography";
import { SITE } from "@/lib/site";
import type { DeliveryMode } from "@/lib/catalog/types";

/**
 * « Comment vous le recevez » : les étapes réelles selon le mode de
 * livraison. Chaque phrase décrit ce que le site fait vraiment (accès activé
 * à la confirmation du paiement, livraison de la clé, prise de contact par
 * WhatsApp) — rien de plus.
 */
const STEPS: Record<DeliveryMode, { title: string; text: string }[]> = {
  "cle-physique": [
    {
      title: "Vous commandez",
      text: "En ligne par carte ou Mobile Money, ou par WhatsApp si vous préférez.",
    },
    {
      title: "Nous confirmons et préparons votre clé",
      text: "Dès que votre paiement est confirmé, votre accès à la plateforme s'active dans votre espace.",
    },
    {
      title: "Nous vous livrons gratuitement",
      text: "À domicile ou au bureau, partout au Burkina Faso, sous 24 à 48 h.",
    },
    {
      title: "Vous branchez et vous apprenez",
      text: `Sur la clé, même sans internet. En ligne, depuis votre espace. Une question ? WhatsApp au ${SITE.phoneDisplay}.`,
    },
  ],
  numerique: [
    {
      title: "Vous commandez",
      text: "Par carte bancaire ou Mobile Money, sur une page de paiement sécurisée.",
    },
    {
      title: "Votre paiement est confirmé",
      text: "Votre accès s'active automatiquement et vous recevez un email de confirmation.",
    },
    {
      title: "Vous accédez à votre achat",
      text: "Il est dans votre espace client, rubrique « Mes formations », à tout moment.",
    },
    {
      title: "Vous êtes accompagné",
      text: `Un souci d'accès ? Écrivez-nous sur WhatsApp au ${SITE.phoneDisplay}.`,
    },
  ],
  manuel: [
    {
      title: "Vous commandez",
      text: "Par carte bancaire ou Mobile Money, sur une page de paiement sécurisée.",
    },
    {
      title: "Votre paiement est confirmé",
      text: "Vous recevez un email de confirmation et votre commande apparaît dans votre espace.",
    },
    {
      title: "Notre équipe vous contacte",
      text: "Sur WhatsApp, pour vous remettre votre accès ou vous placer dans le bon groupe.",
    },
    {
      title: "Vous démarrez",
      text: `Et vous pouvez nous écrire à tout moment au ${SITE.phoneDisplay}.`,
    },
  ],
};

export function HowItWorks({ mode }: { mode: DeliveryMode }) {
  const steps = STEPS[mode];
  return (
    <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-col gap-2.5">
          <span className="font-display text-brand tabular text-[2rem] leading-none">
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
  );
}
