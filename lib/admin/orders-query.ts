import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { ADMIN_PAGE_SIZE, paramText } from "@/components/admin/ui";

type SearchParams = Record<string, string | string[] | undefined>;

export type OrderFilters = {
  q?: string;
  statut?: string;
  canal?: string;
  livraison?: string;
  produit?: string;
  du?: string;
  au?: string;
};

const STATUSES = ["EN_ATTENTE", "PAYE", "ECHOUE", "ANNULE", "REMBOURSE"];
const CHANNELS = ["BOUTIQUE", "WHATSAPP"];
const DELIVERIES = ["A_PREPARER", "EN_LIVRAISON", "LIVREE"];

export function parseOrderFilters(params: SearchParams): OrderFilters {
  const pick = (name: string, allowed?: string[]) => {
    const value = paramText(params[name]);
    return value && (!allowed || allowed.includes(value)) ? value : undefined;
  };
  return {
    q: paramText(params.q)?.slice(0, 100),
    statut: pick("statut", STATUSES),
    canal: pick("canal", CHANNELS),
    livraison: pick("livraison", DELIVERIES),
    produit: pick("produit"),
    du: pick("du"),
    au: pick("au"),
  };
}

function validDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Filtre Prisma pour les commandes. La recherche porte sur le nom, l'email,
 * le téléphone du client (compte ou livraison) et le début de la référence. */
export async function buildOrderWhere(
  filters: OrderFilters,
): Promise<Prisma.OrderWhereInput> {
  const and: Prisma.OrderWhereInput[] = [];

  if (filters.statut) and.push({ status: filters.statut as never });
  if (filters.canal) and.push({ channel: filters.canal as never });
  if (filters.livraison) {
    and.push({ deliveryStatus: filters.livraison as never });
  }
  if (filters.produit) and.push({ product: { slug: filters.produit } });

  const from = validDate(filters.du);
  const to = validDate(filters.au);
  if (from || to) {
    and.push({
      createdAt: {
        ...(from ? { gte: from } : {}),
        ...(to ? { lt: new Date(to.getTime() + 86_400_000) } : {}),
      },
    });
  }

  if (filters.q) {
    const q = filters.q;
    const or: Prisma.OrderWhereInput[] = [
      { profile: { name: { contains: q, mode: "insensitive" } } },
      { profile: { email: { contains: q, mode: "insensitive" } } },
      { profile: { phone: { contains: q } } },
      { shippingPhone: { contains: q } },
      { shippingCity: { contains: q, mode: "insensitive" } },
    ];
    // Référence de commande (début de l'identifiant).
    if (/^[0-9a-f-]{4,36}$/i.test(q)) {
      const ids = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM orders WHERE id::text ILIKE ${q.toLowerCase() + "%"} LIMIT 50`;
      if (ids.length > 0) or.push({ id: { in: ids.map((row) => row.id) } });
    }
    and.push({ OR: or });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function listOrders(
  filters: OrderFilters,
  page: number,
  size = ADMIN_PAGE_SIZE,
) {
  const where = await buildOrderWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * size,
      take: size,
      include: { product: true, profile: true },
    }),
    prisma.order.count({ where }),
  ]);
  return { rows, total };
}
