import "server-only";
import { prisma } from "@/lib/prisma/client";
import {
  claimEdnMacLicence,
  pullEdnMacLicenceLot,
  EdnMacLicenceError,
} from "./mac-edn";
import type { Prisma, PrismaClient } from "@/lib/generated/prisma/client";

/** Jumelle de lib/licences/stock.ts pour le Pack Mac Office — voir ce fichier pour le
 * raisonnement complet (stock local, alerte bas/vide, prévision de consommation) ; ici juste
 * les mêmes opérations redirigées vers mac_license_stock. */

type Db = PrismaClient | Prisma.TransactionClient;

type MacStockRow = {
  license_key: string;
  installer_url: string;
  serializer_url: string;
  guide_url: string;
};

export async function claimFromLocalMacStock(
  orderId: string,
  db: Db = prisma,
): Promise<{
  licenseKey: string;
  installerUrl: string;
  serializerUrl: string;
  guideUrl: string;
} | null> {
  const rows = await db.$queryRaw<
    MacStockRow[]
  >`SELECT * FROM claim_mac_license_stock(${orderId}::uuid)`;
  const row = rows[0];
  return row
    ? {
        licenseKey: row.license_key,
        installerUrl: row.installer_url,
        serializerUrl: row.serializer_url,
        guideUrl: row.guide_url,
      }
    : null;
}

const LOW_STOCK_THRESHOLD = 10;

export async function checkLowMacStock(): Promise<"low" | "empty" | null> {
  const available = await prisma.macLicenseStock.count({
    where: { assignedOrderId: null },
  });
  if (available > LOW_STOCK_THRESHOLD) return null;

  const milestone: "low" | "empty" = available === 0 ? "empty" : "low";
  const column = milestone === "empty" ? "emptyNotifiedAt" : "lowNotifiedAt";

  const existing = await prisma.macLicenseStockAlert.findUnique({
    where: { id: "singleton" },
  });
  if (!existing) {
    await prisma.macLicenseStockAlert.create({ data: { id: "singleton" } });
  } else if (existing[column]) {
    return null;
  }

  const won = await prisma.macLicenseStockAlert.updateMany({
    where: { id: "singleton", [column]: null },
    data: { [column]: new Date() },
  });
  if (won.count === 0) return null;

  return milestone;
}

/** Récupère un nouveau lot Mac chez EDN et l'ajoute au stock local — déclenché depuis l'administration. */
export async function pullAndStoreMacLicenceLot(
  count: number,
): Promise<number> {
  const licences = await pullEdnMacLicenceLot(count);
  await prisma.macLicenseStock.createMany({
    data: licences.map((l) => ({
      licenseKey: l.licenseKey,
      installerUrl: l.installerUrl,
      serializerUrl: l.serializerUrl,
      guideUrl: l.guideUrl,
    })),
  });
  await prisma.macLicenseStockAlert.updateMany({
    where: { id: "singleton" },
    data: { lowNotifiedAt: null, emptyNotifiedAt: null },
  });
  return licences.length;
}

export type MacConsumptionForecast = {
  dailyRate: number;
  daysRemaining: number | null;
  windowDays: number;
};

const FORECAST_WINDOW_DAYS = 7;

export async function getMacConsumptionForecast(): Promise<MacConsumptionForecast> {
  const since = new Date(
    Date.now() - FORECAST_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
  const [consumed, available] = await Promise.all([
    prisma.macLicenseStock.count({ where: { assignedAt: { gte: since } } }),
    prisma.macLicenseStock.count({ where: { assignedOrderId: null } }),
  ]);
  const dailyRate = consumed / FORECAST_WINDOW_DAYS;
  const daysRemaining =
    dailyRate > 0 ? Math.floor(available / dailyRate) : null;
  return { dailyRate, daysRemaining, windowDays: FORECAST_WINDOW_DAYS };
}

export type MacLocalStockRow = {
  id: string;
  licenseKey: string;
  assigned: boolean;
  customerName: string | null;
  orderId: string | null;
  receivedAt: Date;
  assignedAt: Date | null;
};

export async function getLocalMacStockOverview(): Promise<{
  available: number;
  totalReceived: number;
  rows: MacLocalStockRow[];
}> {
  const stock = await prisma.macLicenseStock.findMany({
    orderBy: { receivedAt: "asc" },
    take: 2000,
    include: { assignedOrder: { include: { profile: true } } },
  });
  const rows: MacLocalStockRow[] = stock.map((r) => ({
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

/** Dernier filet avant une livraison manuelle : tente l'appel direct à EDN pour une licence Mac. */
export async function claimMacLiveFallback(
  clientName: string,
  clientEmail: string,
  orderRef: string,
): Promise<
  | {
      licenseKey: string;
      installerUrl: string;
      serializerUrl: string;
      guideUrl: string;
    }
  | { error: string; quotaReached: boolean }
> {
  try {
    return await claimEdnMacLicence(clientName, clientEmail, orderRef);
  } catch (err) {
    const message =
      err instanceof EdnMacLicenceError ? err.message : String(err);
    const quotaReached = err instanceof EdnMacLicenceError && err.quotaReached;
    console.error("EDN licence Mac (repli direct) échoué", orderRef, message);
    return { error: message, quotaReached };
  }
}
