"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconFormation, IconWhatsapp } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/status-labels";
import { signOut } from "@/lib/actions/auth";
import type {
  Access,
  Order,
  Product,
  QuoteRequest,
  Service,
  Profile,
} from "@/lib/generated/prisma/client";

type Props = {
  profile: Profile;
  access: (Access & { product: Product })[];
  orders: (Order & { product: Product | null; service: Service | null })[];
  quotes: (QuoteRequest & { service: Service })[];
};

export function EspaceClientTabs({ profile, access, orders, quotes }: Props) {
  return (
    <Tabs defaultValue="formations" className="mt-8">
      <TabsList>
        <TabsTrigger value="formations">
          Mes formations ({access.length})
        </TabsTrigger>
        <TabsTrigger value="commandes">
          Mes commandes ({orders.length})
        </TabsTrigger>
        <TabsTrigger value="devis">Mes devis ({quotes.length})</TabsTrigger>
        <TabsTrigger value="profil">Profil</TabsTrigger>
      </TabsList>

      <TabsContent value="formations">
        {access.length === 0 ? (
          <EmptyState
            message="Aucune formation active pour le moment."
            ctaHref="/boutique"
            ctaLabel="Voir la boutique"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {access.map((item) => (
              <div key={item.id} className="border-line rounded-lg border p-5">
                <div className="bg-brand/10 text-brand flex h-10 w-10 items-center justify-center rounded-md">
                  <IconFormation size={20} />
                </div>
                <h3 className="text-ink mt-3 text-sm font-semibold">
                  {item.product.name}
                </h3>
                <p className="text-ink-faint mt-1 text-xs">
                  Activé le{" "}
                  {item.grantedAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <Button asChild size="sm" className="mt-4 w-full">
                  <Link href={`/espace-client/formations/${item.product.slug}`}>
                    Accéder
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="commandes">
        {orders.length === 0 ? (
          <EmptyState
            message="Aucune commande pour le moment."
            ctaHref="/boutique"
            ctaLabel="Voir la boutique"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const status = ORDER_STATUS_LABELS[order.status];
              const label = order.product?.name ?? order.service?.name ?? "—";
              return (
                <div
                  key={order.id}
                  className="border-line flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div>
                    <p className="text-ink text-sm font-semibold">{label}</p>
                    <p className="text-ink-faint mt-0.5 text-xs">
                      {order.createdAt.toLocaleDateString("fr-FR")} ·{" "}
                      {formatPrice(order.amount)}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="devis">
        {quotes.length === 0 ? (
          <EmptyState
            message="Aucune demande de devis pour le moment."
            ctaHref="/services"
            ctaLabel="Voir nos services"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {quotes.map((quote) => {
              const status = QUOTE_STATUS_LABELS[quote.status];
              return (
                <div
                  key={quote.id}
                  className="border-line flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div>
                    <p className="text-ink text-sm font-semibold">
                      {quote.service.name}
                    </p>
                    <p className="text-ink-faint mt-0.5 text-xs">
                      {quote.createdAt.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="profil">
        <div className="border-line max-w-sm rounded-lg border p-5">
          <div className="bg-brand flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-ink mt-3 text-sm font-semibold">{profile.name}</p>
          <p className="text-ink-soft text-xs">{profile.phone}</p>
          <p className="text-ink-faint mt-1 text-xs">
            Membre depuis{" "}
            {profile.createdAt.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <a
            href="https://wa.me/22675789737"
            target="_blank"
            rel="noopener noreferrer"
            className="text-success mt-4 flex items-center gap-2 text-sm font-semibold"
          >
            <IconWhatsapp size={16} />
            Contacter le support
          </a>

          <form action={signOut} className="mt-4">
            <Button variant="outline" size="sm" type="submit">
              Se déconnecter
            </Button>
          </form>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({
  message,
  ctaHref,
  ctaLabel,
}: {
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="border-line flex flex-col items-center gap-3 rounded-lg border border-dashed p-10 text-center">
      <p className="text-ink-soft text-sm">{message}</p>
      <Button asChild variant="outline" size="sm">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
