import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { Container, Eyebrow } from "@/components/ui/section";
import { fr } from "@/lib/typography";
import { EspaceClientTabs } from "./espace-client-tabs";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function EspaceClientPage() {
  const profile = await requireProfile();

  const [access, orders, quotes] = await Promise.all([
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

        <EspaceClientTabs
          profile={profile}
          access={access}
          orders={orders}
          quotes={quotes}
        />
      </Container>
    </div>
  );
}
