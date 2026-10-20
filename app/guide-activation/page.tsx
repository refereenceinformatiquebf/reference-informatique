import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import type { IconKey } from "@/lib/catalog/types";
import { SUPPORT_PHONE_DISPLAY, supportWhatsappLink } from "@/lib/support";
import { fr } from "@/lib/typography";

export const metadata: Metadata = {
  title: "Guide d'installation de votre licence Expert",
  description:
    "Installez l'application d'activation, entrez votre licence et activez Microsoft Office et Windows 10 et 11 en quelques minutes.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/guide-activation" },
};

const STEPS: {
  icon: IconKey;
  title: string;
  intro: string;
  details: string[];
}[] = [
  {
    icon: "telecharger",
    title: "Téléchargez l'application",
    intro: "Deux minutes suffisent pour l'avoir prête sur votre ordinateur.",
    details: [
      "Depuis votre espace client, rubrique « Mes licences », cliquez sur « Télécharger l'application ».",
      "Le fichier téléchargé est un installateur (.exe) — c'est normal, aucun antivirus sérieux ne devrait le bloquer.",
    ],
  },
  {
    icon: "ordinateur",
    title: "Installez l'application",
    intro: "Un assistant classique, comme pour n'importe quel logiciel.",
    details: [
      "Ouvrez le fichier téléchargé et suivez l'assistant : dossier d'installation, raccourci sur le Bureau, puis Installer.",
      "Windows affiche une fenêtre « Contrôle de compte d'utilisateur » — cliquez sur Oui. C'est nécessaire pour que l'activation fonctionne.",
      "Une fois l'installation terminée, l'application se lance automatiquement sur l'écran de licence.",
    ],
  },
  {
    icon: "cadenas",
    title: "Entrez votre licence Expert",
    intro:
      "Une seule clé active à la fois Microsoft Office et Windows 10 et 11 — elle ne sert qu'à vous.",
    details: [
      "Retrouvez-la dans votre e-mail de confirmation de commande, ou sur votre espace client, rubrique « Mes licences ».",
      "Collez le code exactement tel qu'il vous a été fourni, puis validez.",
      "Une fois validée, la licence reste enregistrée sur cet ordinateur : vous n'aurez plus à la ressaisir.",
    ],
  },
  {
    icon: "acces-a-vie",
    title: "Activez Office et Windows 10 et 11",
    intro: "Un menu simple, quelques options claires.",
    details: [
      "Choisissez ce que vous voulez activer : Windows seul, Office seul, ou les deux.",
      "Une fenêtre affiche la progression en direct — ne la fermez pas avant le message de confirmation (moins d'une minute en général).",
      "Une fois confirmée, un récapitulatif de votre activation s'affiche : conservez-le.",
    ],
  },
];

export default function GuideActivationPage() {
  const wa = supportWhatsappLink(
    "Bonjour, j'ai besoin d'aide pour l'activation de ma licence Expert.",
  );

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Eyebrow>Guide d&rsquo;installation</Eyebrow>
        <h1 className="text-ink mt-3 text-[2rem] leading-[1.1] sm:text-[2.5rem]">
          Installer votre licence Expert
        </h1>
        <p className="text-ink-soft mt-3 text-[1.0625rem] leading-relaxed">
          {fr(
            "Le parcours complet, du téléchargement de l'application jusqu'à l'activation d'Office et de Windows 10 et 11 — en quelques minutes, sans compétence technique.",
          )}
        </p>

        <div className="border-line bg-paper-raised mt-8 rounded-xl border p-5">
          <p className="text-ink text-sm font-medium">
            Ce qu&rsquo;il vous faut avant de commencer
          </p>
          <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
            {fr(
              "Windows ou Office déjà installés sur votre PC · une connexion Internet active · votre licence (reçue par e-mail après votre achat).",
            )}
          </p>
        </div>

        <ol className="mt-10 flex flex-col gap-6">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="border-line bg-paper shadow-card rounded-xl border p-6 sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span className="relative shrink-0">
                  <IconChip name={step.icon} size={56} />
                  <span className="bg-brand font-display absolute -top-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full text-sm font-bold text-white">
                    {index + 1}
                  </span>
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-ink text-[1.1875rem] leading-tight sm:text-[1.375rem]">
                    {step.title}
                  </h2>
                  <p className="text-ink-soft mt-0.5 text-[0.9375rem] leading-relaxed">
                    {step.intro}
                  </p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2 pl-[4.5rem] text-[0.9375rem] leading-relaxed">
                {step.details.map((detail) => (
                  <li key={detail} className="text-ink flex gap-2.5">
                    <span
                      aria-hidden
                      className="bg-brand mt-[0.55rem] h-[7px] w-[7px] shrink-0 rounded-full"
                    />
                    {fr(detail)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="bg-paper-raised mt-12 rounded-xl p-6 text-center sm:p-8">
          <SectionHeading
            align="center"
            title="Une étape bloque ou un message n'est pas clair ?"
            lead="Contactez-nous, nous vous répondons personnellement."
          />
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="whatsapp">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <IconWhatsapp size={18} />
                Écrire sur WhatsApp
              </a>
            </Button>
            <p className="text-ink-faint text-xs">{SUPPORT_PHONE_DISPLAY}</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
