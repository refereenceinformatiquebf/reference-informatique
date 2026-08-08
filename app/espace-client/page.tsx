import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { EspaceClientTabs } from "./espace-client-tabs";

export const metadata: Metadata = { title: "Mon espace" };
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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-ink text-xl font-bold">
        Bonjour, {profile.name.split(" ")[0]}
      </h1>
      <p className="text-ink-soft mt-1 text-sm">
        Retrouvez vos formations, commandes et demandes de devis.
      </p>

      <EspaceClientTabs
        profile={profile}
        access={access}
        orders={orders}
        quotes={quotes}
      />
    </div>
  );
}
