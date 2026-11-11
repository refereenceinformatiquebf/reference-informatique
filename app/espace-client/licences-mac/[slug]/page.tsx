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
import { fulfilPendingMacLicence } from "@/lib/licences/fulfil";
import {
  SUPPORT_PHONE_DISPLAY,
  supportMessage,
  supportWhatsappLink,
} from "@/lib/support";
import { fr } from "@/lib/typography";

/**
 * Jumelle de app/espace-client/licences/[slug]/page.tsx pour le Pack Mac Office — voir ce
 * fichier pour le raisonnement complet (même convention de duplication que le reste du projet).
 * Contenu propre au Mac : pas d'ISO Windows ni d'antivirus Windows, mais l'installeur Office,
 * l'outil d'activation et le guide, tous les trois renvoyés par l'API partenaire EDN.
 */

export const metadata: Metadata = {
  title: "Ma licence Mac",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function LicenceMacPage({
  params,
}: PageProps<"/espace-client/licences-mac/[slug]">) {
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

  const licence = access.macLicenseKey
    ? {
        licenseKey: access.macLicenseKey,
        installerUrl: access.macInstallerUrl,
        serializerUrl: access.macSerializerUrl,
        guideUrl: access.macGuideUrl,
      }
    : await fulfilPendingMacLicence(access.id).catch((error) => {
        console.error(
          "[licence mac] livraison automatique impossible :",
          error,
        );
        return null;
      });

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
                    Votre licence, l&rsquo;installeur et le guide pour activer
                    Office 2024 à vie sur votre Mac
                  </p>
                </div>
              </div>

              <p className="text-ink-soft text-sm font-medium">
                Votre licence Expert — elle active Microsoft Office 2024 sur
                votre Mac :
              </p>
              <div className="bg-paper border-line mt-2 rounded-lg border px-4 py-3">
                <p className="text-ink font-mono text-[1.0625rem] font-bold tracking-wide break-all">
                  {licence.licenseKey}
                </p>
              </div>

              <p className="text-ink-faint mt-5 text-xs leading-relaxed">
                {fr("Cette licence est personnelle : ne la partagez pas.")}
              </p>
            </div>

            <div className="border-line bg-paper shadow-card mt-6 rounded-xl border p-6 sm:p-8">
              <p className="text-ink font-display text-lg">
                Fichiers Office pour Mac
              </p>
              <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
                Trois étapes : installez Office, puis l&rsquo;outil
                d&rsquo;activation, en suivant le guide.
              </p>
              <ul className="border-line mt-5 divide-y rounded-lg border">
                {licence.installerUrl ? (
                  <li>
                    <a
                      href={licence.installerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-paper-raised flex items-center gap-3 px-4 py-3.5 transition-colors"
                    >
                      <IconChip
                        name="logiciel"
                        size={40}
                        className="shrink-0"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block text-[0.9375rem] font-medium">
                          1. Installeur Microsoft Office 2024 (Mac)
                        </span>
                        <span className="text-ink-faint block text-xs">
                          Word, Excel, PowerPoint, Outlook
                        </span>
                      </span>
                      <span className="text-brand-text shrink-0 text-xs font-semibold">
                        Télécharger
                      </span>
                    </a>
                  </li>
                ) : null}
                {licence.serializerUrl ? (
                  <li>
                    <a
                      href={licence.serializerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-paper-raised flex items-center gap-3 px-4 py-3.5 transition-colors"
                    >
                      <IconChip name="cadenas" size={40} className="shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block text-[0.9375rem] font-medium">
                          2. Application d&rsquo;activation
                        </span>
                        <span className="text-ink-faint block text-xs">
                          À lancer après l&rsquo;installeur, avec la licence
                          ci-dessus
                        </span>
                      </span>
                      <span className="text-brand-text shrink-0 text-xs font-semibold">
                        Télécharger
                      </span>
                    </a>
                  </li>
                ) : null}
                {licence.guideUrl ? (
                  <li>
                    <a
                      href={licence.guideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:bg-paper-raised flex items-center gap-3 px-4 py-3.5 transition-colors"
                    >
                      <IconChip name="pdf" size={40} className="shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block text-[0.9375rem] font-medium">
                          3. Guide d&rsquo;activation (PDF)
                        </span>
                        <span className="text-ink-faint block text-xs">
                          Les étapes, à garder ou imprimer
                        </span>
                      </span>
                      <span className="text-brand-text shrink-0 text-xs font-semibold">
                        Télécharger
                      </span>
                    </a>
                  </li>
                ) : null}
              </ul>
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
