import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatPhone,
  readPurchases,
  shortProductLabel,
  whatsappLinkTo,
} from "@/lib/legacy/display";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

const BATCH = "RI01";

export default async function AdminClientsPage({
  searchParams,
}: PageProps<"/admin/clients">) {
  const { groupe, q } = await searchParams;
  const group = groupe === "comptes" ? "comptes" : "ri01";
  const query = typeof q === "string" ? q.trim() : "";

  const [legacyAll, accountCount] = await Promise.all([
    prisma.legacyClient.findMany({
      where: { batch: BATCH },
      select: { purchases: true, email: true },
    }),
    prisma.profile.count({ where: { role: "CLIENT" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-ink text-[1.75rem] leading-tight">Clients</h1>
        <p className="text-ink-soft text-sm">
          Le groupe {BATCH} rassemble les clients de l&rsquo;ancien site : ce
          sont des fiches de suivi, sans compte de connexion.
        </p>
      </div>

      <nav aria-label="Groupes de clients" className="flex flex-wrap gap-2">
        <GroupTab href="/admin/clients" active={group === "ri01"}>
          Clients {BATCH} ({legacyAll.length})
        </GroupTab>
        <GroupTab
          href="/admin/clients?groupe=comptes"
          active={group === "comptes"}
        >
          Comptes du site ({accountCount})
        </GroupTab>
      </nav>

      {group === "ri01" ? (
        <LegacyClients query={query} all={legacyAll} />
      ) : (
        <SiteAccounts />
      )}
    </div>
  );
}

function GroupTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand text-brand-contrast"
          : "border-line-strong bg-paper text-ink-soft hover:border-brand hover:text-brand-text",
      )}
    >
      {children}
    </Link>
  );
}

/* ----------------------------- Groupe RI01 ----------------------------- */

async function LegacyClients({
  query,
  all,
}: {
  query: string;
  all: { purchases: unknown; email: string | null }[];
}) {
  const digits = query.replace(/\D/g, "");
  const clients = await prisma.legacyClient.findMany({
    where: {
      batch: BATCH,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { code: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              ...(digits.length >= 3 ? [{ phone: { contains: digits } }] : []),
            ],
          }
        : {}),
    },
    orderBy: { code: "asc" },
  });

  // Totaux sur tout le groupe (pas seulement sur la recherche).
  const byProduct = new Map<string, number>();
  let accessCount = 0;
  for (const client of all) {
    for (const purchase of readPurchases(client.purchases)) {
      const label = shortProductLabel(purchase);
      byProduct.set(label, (byProduct.get(label) ?? 0) + 1);
      if (purchase.status === "ACCES_ACTIVE") accessCount += 1;
    }
  }
  const withEmail = all.filter((c) => c.email).length;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Clients" value={all.length} />
        <Stat label="Accès activés (ancien site)" value={accessCount} />
        <Stat
          label="Avec une vraie adresse email"
          value={withEmail}
          hint="Les autres se contactent par téléphone ou WhatsApp."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[...byProduct.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([label, count]) => (
            <Badge key={label} variant="neutral">
              {label} : {count}
            </Badge>
          ))}
      </div>

      <form method="get" className="flex max-w-xl gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="Rechercher un nom, un code (RI01-012), une ville, un téléphone…"
          aria-label="Rechercher un client"
        />
        <Button type="submit" variant="outline">
          Chercher
        </Button>
        {query ? (
          <Button asChild variant="ghost">
            <Link href="/admin/clients">Effacer</Link>
          </Button>
        ) : null}
      </form>

      <p className="text-ink-faint text-xs" aria-live="polite">
        {query
          ? `${clients.length} résultat(s) pour « ${query} »`
          : `${clients.length} client(s)`}
      </p>

      <div className="border-line bg-paper overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-line text-ink-faint border-b text-left text-xs uppercase">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Téléphone</th>
              <th className="px-4 py-3 font-semibold">Ville</th>
              <th className="px-4 py-3 font-semibold">Achats</th>
              <th className="px-4 py-3 font-semibold">Inscrit le</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const purchases = readPurchases(client.purchases);
              return (
                <tr
                  key={client.id}
                  className="border-line border-b align-top last:border-0"
                >
                  <td className="text-ink tabular px-4 py-3 font-medium whitespace-nowrap">
                    {client.code}
                  </td>
                  <td className="text-ink px-4 py-3 font-medium">
                    {client.name}
                    {client.adminNote ? (
                      <span className="text-ink-faint block text-xs font-normal">
                        {client.adminNote}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-ink-soft tabular px-4 py-3 whitespace-nowrap">
                    {formatPhone(client.phone)}
                  </td>
                  <td className="text-ink-soft px-4 py-3">
                    {client.city ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {purchases.map((purchase, index) => (
                        <Badge
                          key={index}
                          variant={
                            purchase.status === "PAIEMENT_RECU"
                              ? "warning"
                              : "neutral"
                          }
                          title={
                            purchase.status === "PAIEMENT_RECU"
                              ? "Paiement reçu, accès pas encore activé"
                              : "Accès activé"
                          }
                        >
                          {shortProductLabel(purchase)}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="text-ink-faint px-4 py-3 text-xs whitespace-nowrap">
                    {client.signedUpAt?.toLocaleDateString("fr-FR") ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs font-semibold">
                      {client.phone ? (
                        <a
                          href={whatsappLinkTo(
                            client.phone,
                            `Bonjour ${client.name.split(" ")[0]}, c'est Référence Informatique.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="text-brand-text hover:underline"
                        >
                          Email
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-ink-soft px-4 py-10 text-center"
                >
                  Aucun client ne correspond à cette recherche.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="border-line bg-paper rounded-lg border p-4">
      <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="font-display text-ink tabular mt-1 text-[2rem] leading-none">
        {value}
      </p>
      {hint ? <p className="text-ink-faint mt-2 text-xs">{hint}</p> : null}
    </div>
  );
}

/* --------------------------- Comptes du nouveau site --------------------------- */

async function SiteAccounts() {
  const clients = await prisma.profile.findMany({
    where: { role: "CLIENT" },
    include: { _count: { select: { orders: true, access: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="border-line bg-paper overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-line text-ink-faint border-b text-left text-xs uppercase">
            <th className="px-4 py-3 font-semibold">Nom</th>
            <th className="px-4 py-3 font-semibold">Téléphone</th>
            <th className="px-4 py-3 font-semibold">Commandes</th>
            <th className="px-4 py-3 font-semibold">Formations actives</th>
            <th className="px-4 py-3 font-semibold">Inscrit le</th>
            <th className="px-4 py-3 font-semibold">Contact</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-line border-b last:border-0">
              <td className="text-ink px-4 py-3 font-medium">{client.name}</td>
              <td className="text-ink-soft px-4 py-3">{client.phone}</td>
              <td className="text-ink tabular px-4 py-3">
                {client._count.orders}
              </td>
              <td className="text-ink tabular px-4 py-3">
                {client._count.access}
              </td>
              <td className="text-ink-faint px-4 py-3 text-xs">
                {client.createdAt.toLocaleDateString("fr-FR")}
              </td>
              <td className="px-4 py-3">
                {client.phone ? (
                  <a
                    href={whatsappLinkTo(client.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-green-700 hover:underline"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </td>
            </tr>
          ))}
          {clients.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-ink-soft px-4 py-10 text-center">
                Aucun client n&rsquo;a encore créé de compte sur le nouveau
                site.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
