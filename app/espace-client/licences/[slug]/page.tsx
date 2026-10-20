import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { Container, IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import {
  AssistanceSection,
  FloatingAssistance,
} from "@/components/support/assistance";
import { formatDate } from "@/lib/format";
import { fulfilPendingLicence } from "@/lib/licences/fulfil";
import {
  SUPPORT_PHONE_DISPLAY,
  supportMessage,
  supportWhatsappLink,
} from "@/lib/support";
import { fr } from "@/lib/typography";
import type { IconKey } from "@/lib/catalog/types";

/**
 * Téléchargements complémentaires du pack licence — liens externes officiels (Microsoft,
 * Google Drive) pour Windows/Office, et fichiers hébergés ici même (public/antivirus/) pour
 * les antivirus : volontairement une copie locale plutôt qu'un lien vers
 * expertdunumerique.com, pour que cette page ne dépende d'aucun autre site.
 */
const DOWNLOADS: {
  icon: IconKey;
  label: string;
  description: string;
  href: string;
}[] = [
  {
    icon: "ordinateur",
    label: "Windows 11",
    description: "Fichier ISO officiel",
    href: "https://drive.google.com/drive/folders/1YNlKNQJtswKVo9GdfUYOymvrbF_PxOP5?usp=sharing",
  },
  {
    icon: "logiciel",
    label: "Microsoft 365 (Office 365)",
    description: "Word, Excel, PowerPoint, Outlook et plus",
    href: "https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/fr-fr/O365HomePremRetail.img",
  },
  {
    icon: "logiciel",
    label: "Office 2024 Professional Plus",
    description: "Word, Excel, PowerPoint, Outlook et plus",
    href: "https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/fr-fr/ProPlus2024Retail.img",
  },
  {
    icon: "bouclier",
    label: "360 Total Security",
    description: "Antivirus gratuit — installation en 2 minutes",
    href: "/antivirus/360-total-security.exe",
  },
  {
    icon: "bouclier",
    label: "Avast One Free",
    description: "Antivirus gratuit — alternative à 360 Total Security",
    href: "/antivirus/avast-one-free.exe",
  },
  {
    icon: "telecharger",
    label: "Guide d'installation et d'activation (PDF)",
    description: "Les mêmes étapes, à garder ou imprimer",
    href: "/guides/guide-installation-activation.pdf",
  },
];

export const metadata: Metadata = {
  title: "Ma licence",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function LicencePage({
  params,
}: PageProps<"/espace-client/licences/[slug]">) {
  const { slug } = await params;
  const profile = await requireProfile();

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const access = await prisma.access.findUnique({
    where: {
      profileId_productId: { profileId: profile.id, productId: product.id },
    },
  });

  if (!access) {
    return (
      <Container className="max-w-md py-24 text-center">
        <IconChip name="cadenas" size={56} className="mx-auto" />
        <h1 className="text-ink mt-5 text-[1.75rem] leading-tight">
          Accès non autorisé
        </h1>
        <p className="text-ink-soft mt-3 text-[0.9375rem] leading-relaxed">
          Vous n&rsquo;avez pas (ou plus) accès à ce produit. Si vous venez de
          payer, patientez quelques instants puis actualisez la page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/boutique">Voir la boutique</Link>
        </Button>
      </Container>
    );
  }

  // Un client qui a payé sans avoir reçu sa clé (stock vide et EDN injoignable au moment
  // du paiement) la reçoit ici dès que le stock le permet : plus besoin d'attendre l'équipe.
  const licence = access.licenseKey
    ? { licenseKey: access.licenseKey, installerUrl: access.installerUrl }
    : await fulfilPendingLicence(access.id).catch((error) => {
        console.error("[licence] livraison automatique impossible :", error);
        return null;
      });

  // Assistance dédiée : message prérempli avec le nom du client et la date de son achat.
  const supportHref = supportWhatsappLink(
    supportMessage(profile.name, formatDate(access.grantedAt)),
  );

  return (
    <div className="py-10 pb-28 sm:py-14 sm:pb-28">
      <Container className="max-w-2xl">
        <Link
          href="/espace-client"
          className="text-ink-faint hover:text-brand-text text-sm transition-colors"
        >
          ← Mon espace
        </Link>
        <h1 className="text-ink mt-3 text-[1.875rem] leading-[1.1] sm:text-[2.25rem]">
          {product.name}
        </h1>

        {licence ? (
          <>
            <div className="border-brand-200 bg-brand-50/40 mt-8 rounded-xl border-2 p-6 sm:p-8">
              <div className="mb-4 flex items-center gap-3">
                <IconChip name="acces-a-vie" size={36} tone="solid" />
                <div>
                  <p className="font-display text-ink text-sm font-bold">
                    Espace Activation
                  </p>
                  <p className="text-ink-soft text-xs">
                    Votre licence, l&rsquo;application et le guide pour activer
                    à vie
                  </p>
                </div>
              </div>

              <p className="text-ink-soft text-sm font-medium">
                Votre licence Expert — elle active Microsoft Office 365 et
                Windows 11 :
              </p>
              <div className="bg-paper border-line mt-2 rounded-lg border px-4 py-3">
                <p className="text-ink font-mono text-[1.0625rem] font-bold tracking-wide break-all">
                  {licence.licenseKey}
                </p>
              </div>

              {licence.installerUrl ? (
                <Button asChild size="lg" className="mt-5 w-full">
                  <a href={licence.installerUrl}>
                    Télécharger l&rsquo;application
                  </a>
                </Button>
              ) : null}

              <p className="text-ink-soft mt-3 text-xs leading-relaxed">
                {fr(
                  "Installez l'application, collez votre licence ci-dessus dans l'application, puis activez Windows et Office en un clic.",
                )}
              </p>

              <p className="text-ink-faint mt-5 text-xs leading-relaxed">
                {fr(
                  "Cette licence est personnelle : ne la partagez pas. Elle active 2 appareils maximum.",
                )}
              </p>
            </div>

            <div className="border-line bg-paper shadow-card mt-6 rounded-xl border p-6 sm:p-8">
              <p className="text-ink font-display text-lg">
                Fichiers Windows &amp; Office
              </p>
              <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
                À installer normalement, sans licence à saisir —
                l&rsquo;activation se fait ensuite avec l&rsquo;application
                ci-dessus.
              </p>
              <ul className="border-line mt-5 divide-y rounded-lg border">
                {DOWNLOADS.map((d) => (
                  <li key={d.label}>
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-paper-raised flex items-center gap-3 px-4 py-3.5 transition-colors"
                    >
                      <IconChip name={d.icon} size={40} className="shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block text-[0.9375rem] font-medium">
                          {d.label}
                        </span>
                        <span className="text-ink-faint block text-xs">
                          {d.description}
                        </span>
                      </span>
                      <span className="text-brand-text shrink-0 text-xs font-semibold">
                        Télécharger
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="mt-5 w-full"
              >
                <Link href="/guide-activation">
                  Voir le guide d&rsquo;installation en ligne
                </Link>
              </Button>
            </div>

            <AssistanceSection href={supportHref} />
          </>
        ) : (
          <div className="border-line bg-paper mt-8 flex flex-col items-start gap-4 rounded-lg border p-6">
            <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
              {fr(
                "Votre licence est en cours de préparation. Si elle n'apparaît pas ici sous peu, écrivez-nous avec votre numéro de commande : nous la vérifions tout de suite.",
              )}
            </p>
            <Button asChild variant="whatsapp">
              <a href={supportHref} target="_blank" rel="noopener noreferrer">
                <IconWhatsapp size={18} />
                Écrire à l&rsquo;assistance sur WhatsApp
              </a>
            </Button>
            <p className="text-ink-faint text-xs">{SUPPORT_PHONE_DISPLAY}</p>
          </div>
        )}
      </Container>
      <FloatingAssistance href={supportHref} />
    </div>
  );
}
