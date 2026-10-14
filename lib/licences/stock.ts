import "server-only";
import { prisma } from "@/lib/prisma/client";
import { claimEdnLicence, pullEdnLicenceLot, EdnLicenceError } from "./edn";
import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

/** Client Prisma OU client de transaction — les deux exposent $queryRaw. */
type Db = PrismaClient | Prisma.TransactionClient;

type StockRow = { license_key: string; installer_url: string };

/**
 * Consomme UNE licence du stock local (fonction SQL atomique, voir la migration
 * 20261014010000_licence_edn_stock) — renvoie null si le stock est vide, jamais une exception.
 * Passer `tx` pour consommer DANS la même transaction que la création de l'Access (cohérence :
 * jamais de licence "perdue" si la transaction échoue ensuite).
 */
export async function claimFromLocalStock(
  orderId: string,
  db: Db = prisma,
): Promise<{ licenseKey: string; installerUrl: string } | null> {
  const rows = await db.$queryRaw<
    StockRow[]
  >`SELECT * FROM claim_license_stock(${orderId}::uuid)`;
  const row = rows[0];
  return row
    ? { licenseKey: row.license_key, installerUrl: row.installer_url }
    : null;
}

const LOW_STOCK_THRESHOLD = 10;

/**
 * Alerte l'équipe (sendOrderAlert-like, voir lib/licences/notify.ts) quand le stock local passe
 * sous le seuil bas ou tombe à zéro — une seule fois par seuil (LicenseStockAlert, remise à zéro
 * par pullAndStoreLicenceLot à la prochaine réception). Ne doit jamais faire échouer une vente.
 */
export async function checkLowStock(): Promise<"low" | "empty" | null> {
  const available = await prisma.licenseStock.count({
    where: { assignedOrderId: null },
  });
  if (available > LOW_STOCK_THRESHOLD) return null;

  const milestone: "low" | "empty" = available === 0 ? "empty" : "low";
  const column = milestone === "empty" ? "emptyNotifiedAt" : "lowNotifiedAt";

  const existing = await prisma.licenseStockAlert.findUnique({
    where: { id: "singleton" },
  });
  if (!existing) {
    await prisma.licenseStockAlert.create({ data: { id: "singleton" } });
  } else if (existing[column]) {
    return null; // déjà envoyé pour ce seuil
  }

  const won = await prisma.licenseStockAlert.updateMany({
    where: { id: "singleton", [column]: null },
    data: { [column]: new Date() },
  });
  if (won.count === 0) return null; // un appel concurrent a déjà gagné la course

  return milestone;
}

/** Récupère un nouveau lot chez EDN et l'ajoute au stock local — déclenché depuis l'administration. */
export async function pullAndStoreLicenceLot(count: number): Promise<number> {
  const licences = await pullEdnLicenceLot(count);
  await prisma.licenseStock.createMany({
    data: licences.map((l) => ({
      licenseKey: l.licenseKey,
      installerUrl: l.installerUrl,
    })),
  });
  // Le stock remonte : les prochaines ruptures doivent pouvoir réalerter.
  await prisma.licenseStockAlert.updateMany({
    where: { id: "singleton" },
    data: { lowNotifiedAt: null, emptyNotifiedAt: null },
  });
  return licences.length;
}

export type LocalStockRow = {
  id: string;
  licenseKey: string;
  assigned: boolean;
  customerName: string | null;
  orderId: string | null;
  receivedAt: Date;
  assignedAt: Date | null;
};

/** Stock local, chaque ligne avec le client réel si déjà assignée — pour la grille admin. */
export async function getLocalStockOverview(): Promise<{
  available: number;
  totalReceived: number;
  rows: LocalStockRow[];
}> {
  const stock = await prisma.licenseStock.findMany({
    orderBy: { receivedAt: "asc" },
    take: 2000,
    include: { assignedOrder: { include: { profile: true } } },
  });
  const rows: LocalStockRow[] = stock.map((r) => ({
    id: r.id,
    licenseKey: r.licenseKey,
    assigned: r.assignedOrderId !== null,
    customerName: r.assignedOrder?.profile.name ?? null,
    orderId: r.assignedOrderId,
    receivedAt: r.receivedAt,
    assignedAt: r.assignedAt,
  }));
  return {
    available: rows.filter((r) => !r.assigned).length,
    totalReceived: rows.length,
    rows,
  };
}

export type LicenceSale = {
  id: string;
  licenseKey: string;
  customerName: string;
  customerEmail: string | null;
  grantedAt: Date;
};

/** Licences effectivement attribuées à un client, les plus récentes d'abord. */
export async function listLicenceSales(): Promise<LicenceSale[]> {
  const rows = await prisma.access.findMany({
    where: { licenseKey: { not: null } },
    include: { profile: true },
    orderBy: { grantedAt: "desc" },
    take: 500,
  });
  return rows.map((r) => ({
    id: r.id,
    licenseKey: r.licenseKey!,
    customerName: r.profile.name,
    customerEmail: r.profile.email,
    grantedAt: r.grantedAt,
  }));
}

export type LicenceProblem = {
  id: string;
  action: string;
  orderId: string | null;
  message: string | null;
  createdAt: Date;
};

/** Échecs récents de récupération automatique (API EDN en panne ou quota épuisé). */
export async function listLicenceProblems(
  limit = 20,
): Promise<LicenceProblem[]> {
  const rows = await prisma.adminAuditLog.findMany({
    where: {
      action: { in: ["licence.quota_reached", "licence.claim_failed"] },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    orderId: r.entityId,
    message: r.summary,
    createdAt: r.createdAt,
  }));
}

/**
 * Dernier filet avant une livraison manuelle : tente l'appel direct à EDN. Utilisé UNIQUEMENT
 * quand le stock local est vide (voir lib/orders.ts, ensureLicenceFulfilled) — jamais pendant une
 * transaction de base de données (appel réseau).
 */
export async function claimLiveFallback(
  clientName: string,
  clientEmail: string,
  orderRef: string,
): Promise<
  | { licenseKey: string; installerUrl: string }
  | { error: string; quotaReached: boolean }
> {
  try {
    return await claimEdnLicence(clientName, clientEmail, orderRef);
  } catch (err) {
    const message = err instanceof EdnLicenceError ? err.message : String(err);
    const quotaReached = err instanceof EdnLicenceError && err.quotaReached;
    console.error("EDN licence claim (repli direct) échoué", orderRef, message);
    return { error: message, quotaReached };
  }
}
