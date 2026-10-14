import "server-only";
import { prisma } from "@/lib/prisma/client";

/** Emails envoyés et en échec sur les dernières 24 heures. */
export async function emailStats24h() {
  const since = new Date(Date.now() - 86_400_000);
  const [sent, failed] = await Promise.all([
    prisma.emailLog.count({
      where: { status: "SENT", createdAt: { gte: since } },
    }),
    prisma.emailLog.count({
      where: { status: "FAILED", createdAt: { gte: since } },
    }),
  ]);
  return { sent, failed };
}
