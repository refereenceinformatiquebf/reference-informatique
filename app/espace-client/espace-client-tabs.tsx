"use client";

import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { supportWhatsappLink } from "@/lib/support";
import { ORDER_STATUS_LABELS, QUOTE_STATUS_LABELS } from "@/lib/status-labels";
import { signOut } from "@/lib/actions/auth";
import { PasswordForm, ProfileForm } from "./profile-forms";
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
  /** Onglet affiché à l'arrivée (« profil » pour un compte tout juste créé). */
  defaultTab?: "formations" | "commandes" | "devis" | "profil";
  access: (Access & { product: Product; isLicence: boolean })[];
  orders: (Order & { product: Product | null; service: Service | null })[];
  quotes: (QuoteRequest & { service: Service })[];
};

const DELIVERY_LABELS = {
  A_PREPARER: "en préparation",
  EN_LIVRAISON: "en cours de livraison",
  LIVREE: "remise",
} as const;

const dateFormat: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

export function EspaceClientTabs({
  profile,
  defaultTab = "formations",
  access,
  orders,
  quotes,
}: Props) {
  return (
    <Tabs defaultValue={defaultTab} className="mt-8">
      <TabsList aria-label="Sections de votre espace">
        <TabsTrigger value="formations">
          Mes formations ({access.length})
        </TabsTrigger>
        <TabsTrigger value="commandes">
          Mes commandes ({orders.length})
        </TabsTrigger>
        <TabsTrigger value="devis">Mes devis ({quotes.length})</TabsTrigger>
        <TabsTrigger value="profil">Mon profil</TabsTrigger>
      </TabsList>

      <TabsContent value="formations">
        {access.length === 0 ? (
          <EmptyState
            icon="formation"
            title="Aucune formation pour le moment"
            message="Vos formations en ligne apparaissent ici dès que le paiement est confirmé. Une clé USB commandée se retrouve dans « Mes commandes »."
            ctaHref="/boutique"
            ctaLabel="Découvrir la boutique"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {access.map((item) => (
              <div
                key={item.id}
                className="border-line bg-paper flex flex-col rounded-lg border p-5"
              >
                <IconChip
                  name={item.isLicence ? "cadenas" : "formation"}
                  size={44}
                />
                <h3 className="font-display text-ink mt-4 text-[1.25rem] leading-tight">
                  {item.product.name}
                </h3>
                <p className="text-ink-faint mt-1.5 text-xs">
                  Activé le{" "}
                  {item.grantedAt.toLocaleDateString("fr-FR", dateFormat)}
                </p>
                <Button asChild className="mt-5 w-full">
                  <Link
                    href={
                      item.isLicence
                        ? `/espace-client/licences/${item.product.slug}`
                        : `/espace-client/formations/${item.product.slug}`
                    }
                  >
                    {item.isLicence
                      ? "Accéder à ma licence"
                      : "Accéder à mon contenu"}
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
            icon="panier"
            title="Aucune commande pour le moment"
            message="Vos commandes et leur état s'affichent ici."
            ctaHref="/boutique"
            ctaLabel="Découvrir la boutique"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const status = ORDER_STATUS_LABELS[order.status];
              const label = order.product?.name ?? order.service?.name ?? "—";
              const canResume =
                order.status === "EN_ATTENTE" && order.product !== null;
              return (
                <div
                  key={order.id}
                  className="border-line bg-paper flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-ink text-[0.9375rem] font-medium">
                      {label}
                    </p>
                    <p className="text-ink-faint tabular mt-0.5 text-xs">
                      {order.createdAt.toLocaleDateString("fr-FR")} ·{" "}
                      {order.quantity > 1 ? `${order.quantity} × · ` : ""}
                      {formatPrice(order.amount)}
                    </p>
                    {order.status === "PAYE" && order.deliveryStatus ? (
                      <p className="text-ink-soft mt-1 text-xs">
                        Livraison de votre clé :{" "}
                        <strong className="text-ink font-medium">
                          {DELIVERY_LABELS[order.deliveryStatus]}
                        </strong>
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    {canResume ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/commande/${order.product!.slug}`}>
                          Reprendre la commande
                        </Link>
                      </Button>
                    ) : null}
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="devis">
        {quotes.length === 0 ? (
          <EmptyState
            icon="devis"
            title="Aucune demande de devis"
            message="Les devis que vous demandez apparaissent ici avec leur avancement."
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
                  className="border-line bg-paper flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div>
                    <p className="text-ink text-[0.9375rem] font-medium">
                      {quote.service.name}
                    </p>
                    <p className="text-ink-faint mt-0.5 text-xs">
                      Demandé le {quote.createdAt.toLocaleDateString("fr-FR")}
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="border-line bg-paper rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="bg-brand text-brand-contrast font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-display text-ink truncate text-[1.375rem] leading-tight">
                  {profile.name}
                </p>
                <p className="text-ink-faint mt-1 text-xs">
                  Membre depuis{" "}
                  {profile.createdAt.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ProfileForm
                name={profile.name}
                phone={profile.phone}
                email={profile.email}
              />
            </div>
          </div>

          <div className="border-line bg-paper rounded-lg border p-6">
            <h3 className="font-display text-ink text-[1.25rem] leading-tight">
              Mot de passe
            </h3>
            <div className="mt-4">
              <PasswordForm />
            </div>
          </div>

          <div className="border-line bg-paper flex flex-col gap-3 rounded-lg border p-6 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
            <Button asChild variant="whatsapp">
              <a
                href={(access.some((item) => item.isLicence)
                  ? supportWhatsappLink
                  : whatsappLink)(
                  "Bonjour, j'ai besoin d'aide avec mon espace.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                Contacter le support
              </a>
            </Button>
            <form action={signOut}>
              <Button variant="ghost" type="submit" className="w-full">
                Se déconnecter
              </Button>
            </form>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({
  icon,
  title,
  message,
  ctaHref,
  ctaLabel,
}: {
  icon: "formation" | "panier" | "devis";
  title: string;
  message: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="border-line bg-paper flex flex-col items-center gap-4 rounded-lg border border-dashed p-10 text-center">
      <IconChip name={icon} size={52} />
      <div>
        <p className="font-display text-ink text-[1.25rem] leading-tight">
          {title}
        </p>
        <p className="text-ink-soft mt-1.5 text-sm">{message}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
