import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { getProduct } from "@/lib/catalog/live";
import { Container, Eyebrow } from "@/components/ui/section";
import { fr } from "@/lib/typography";
import { EspaceClientTabs } from "./espace-client-tabs";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function EspaceClientPage({
  searchParams,
}: PageProps<"/espace-client">) {
  const profile = await requireProfile();
  const { bienvenue, onglet } = await searchParams;
  const isWelcome = bienvenue === "1";
  const defaultTab = isWelcome
    ? "profil"
    : onglet === "commandes" || onglet === "devis" || onglet === "profil"
      ? onglet
      : "formations";

  const [accessRows, orders, quotes] = await Promise.all([
    prisma.access.findMany({
      where: { profileId: profile.id },
      include: { product: true },
      orderBy: { grantedAt: "desc" },
    }),
    prisma.order.findMany({
      where: { profileId: profile.id },
      include: { product: true, service: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.quoteRequest.findMany({
      where: { profileId: profile.id },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Un produit "licence-edn" s'affiche différemment des formations (clé à activer, pas de
  // leçon) — déterminé via le catalogue (la base ne porte pas le mode de livraison).
  const access = await Promise.all(
    accessRows.map(async (item) => ({
      ...item,
      isLicence:
        (await getProduct(item.product.slug))?.delivery === "licence-edn",
    })),
  );

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        <Eyebrow>Mon espace</Eyebrow>
        <h1 className="text-ink mt-3 text-[2rem] leading-[1.1] sm:text-[2.5rem]">
          {fr(`Bonjour, ${profile.name.split(" ")[0]}`)}
        </h1>
        <p className="text-ink-soft mt-2 text-[1rem] leading-relaxed">
          Retrouvez ici vos formations, vos commandes et vos demandes de devis.
        </p>

        {isWelcome ? (
          <p
            role="status"
            className="bg-brand-50 text-ink mt-6 rounded-lg px-4 py-3 text-sm leading-relaxed"
          >
            Bienvenue ! Votre adresse est confirmée. Prenez une minute pour
            vérifier votre nom et votre téléphone ci-dessous : ils nous servent
            à vous livrer et à vous joindre sur WhatsApp.
          </p>
        ) : null}

        <EspaceClientTabs
          profile={profile}
          defaultTab={defaultTab}
          access={access}
          orders={orders}
          quotes={quotes}
        />
      </Container>
    </div>
  );
}
