import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { Container, IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

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

  return (
    <div className="py-10 sm:py-14">
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

        {access.licenseKey ? (
          <div className="border-line bg-paper shadow-card mt-8 rounded-xl border p-6 sm:p-8">
            <p className="text-ink-soft text-sm font-medium">
              Votre licence Expert — elle active Microsoft Office 365 et Windows
              11 :
            </p>
            <div className="bg-paper-raised border-line mt-2 rounded-lg border px-4 py-3">
              <p className="text-ink font-mono text-[1.0625rem] font-bold tracking-wide break-all">
                {access.licenseKey}
              </p>
            </div>

            {access.installerUrl ? (
              <Button asChild size="lg" className="mt-5 w-full">
                <a href={access.installerUrl}>
                  Télécharger l&rsquo;application
                </a>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="lg" className="mt-3 w-full">
              <Link href="/guide-activation">
                Voir le guide d&rsquo;installation
              </Link>
            </Button>

            <p className="text-ink-faint mt-5 text-xs leading-relaxed">
              {fr(
                "Cette licence est personnelle : ne la partagez pas. Elle active 2 appareils maximum.",
              )}
            </p>
          </div>
        ) : (
          <div className="border-line bg-paper mt-8 flex flex-col items-start gap-4 rounded-lg border p-6">
            <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
              {fr(
                "Votre licence est en cours de préparation. Si elle n'apparaît pas ici sous peu, écrivez-nous avec votre numéro de commande : nous la vérifions tout de suite.",
              )}
            </p>
            <Button asChild variant="whatsapp">
              <a
                href={whatsappLink(
                  `Bonjour, je viens d'acheter « ${product.name} » et j'attends ma licence.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                Nous écrire sur WhatsApp
              </a>
            </Button>
            <p className="text-ink-faint text-xs">{SITE.phoneDisplay}</p>
          </div>
        )}
      </Container>
    </div>
  );
}
