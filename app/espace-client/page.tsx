import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { getProduct, getVisibleProducts } from "@/lib/catalog/live";
import { getVisitorCountry } from "@/lib/geo";
import { rankRecommendations } from "@/lib/catalog/recommendations";
import { ProductCard } from "@/components/shop/product-card";
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
  const requestedTab =
    onglet === "commandes" ||
    onglet === "devis" ||
    onglet === "profil" ||
    onglet === "formations"
      ? onglet
      : null;

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

  // Qui n'a acheté qu'une clé USB n'a aucune formation en ligne : on l'accueille
  // sur ses commandes (état de la livraison) plutôt que sur un onglet vide.
  const defaultTab = isWelcome
    ? "profil"
    : (requestedTab ??
      (access.length === 0 && orders.length > 0 ? "commandes" : "formations"));

  // Recommandations : ce que le client ne possède pas encore (achats payés et
  // accès), restreint aux offres visibles depuis son pays.
  const ownedSlugs = new Set<string>([
    ...accessRows.map((item) => item.product.slug),
    ...orders
      .filter((order) => order.status === "PAYE" && order.product)
      .map((order) => order.product!.slug),
  ]);
  const visible = await getVisibleProducts(await getVisitorCountry());
  const owned = (
    await Promise.all([...ownedSlugs].map((slug) => getProduct(slug)))
  ).filter((product): product is NonNullable<typeof product> =>
    Boolean(product),
  );
  const recommendations = rankRecommendations(owned, visible, 3);

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

        {recommendations.length > 0 ? (
          <section aria-labelledby="recommandations" className="mt-16">
            <Eyebrow>Pour aller plus loin</Eyebrow>
            <h2
              id="recommandations"
              className="text-ink mt-3 text-[1.5rem] leading-tight sm:text-[1.875rem]"
            >
              Recommandé pour vous
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
