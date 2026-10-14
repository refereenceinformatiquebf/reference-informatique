import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getVerifiedAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { toCsv } from "@/lib/admin/csv";
import { buildOrderWhere, parseOrderFilters } from "@/lib/admin/orders-query";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const date = (value: Date | null | undefined) =>
  value ? formatDateTime(value) : "";

/**
 * Exports CSV de l'administration. Réservés aux administrateurs : toute autre
 * personne reçoit une 404 (l'existence de la route n'est pas confirmée).
 * Chaque export est journalisé.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ what: string }> },
) {
  const profile = await getVerifiedAdmin();
  if (!profile) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { what } = await params;
  const url = new URL(request.url);
  let header: string[];
  let rows: unknown[][];

  switch (what) {
    case "commandes": {
      const filters = parseOrderFilters(
        Object.fromEntries(url.searchParams.entries()),
      );
      const orders = await prisma.order.findMany({
        where: await buildOrderWhere(filters),
        orderBy: { createdAt: "desc" },
        take: 5000,
        include: { product: true, profile: true },
      });
      header = [
        "Référence",
        "Date",
        "Client",
        "Email",
        "Téléphone",
        "Produit",
        "Quantité",
        "Montant (F CFA)",
        "Canal",
        "Statut",
        "Livraison",
        "Ville",
        "Adresse",
        "Téléphone de livraison",
        "Payée le",
      ];
      rows = orders.map((order) => [
        order.id,
        date(order.createdAt),
        order.profile.name,
        order.profile.email,
        order.profile.phone,
        order.product?.name,
        order.quantity,
        order.amount,
        order.channel === "BOUTIQUE" ? "SasPay" : "WhatsApp",
        order.status,
        order.deliveryStatus,
        order.shippingCity,
        order.shippingAddress,
        order.shippingPhone,
        date(order.paidAt),
      ]);
      break;
    }
    case "clients": {
      const profiles = await prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
        include: {
          orders: { where: { status: "PAYE" }, select: { amount: true } },
        },
      });
      header = [
        "Nom",
        "Email",
        "Téléphone",
        "Rôle",
        "Inscrit le",
        "Achats payés",
        "Total dépensé (F CFA)",
      ];
      rows = profiles.map((p) => [
        p.name,
        p.email,
        p.phone,
        p.role,
        date(p.createdAt),
        p.orders.length,
        p.orders.reduce((sum, order) => sum + order.amount, 0),
      ]);
      break;
    }
    case "clients-ri01": {
      const clients = await prisma.legacyClient.findMany({
        orderBy: { code: "asc" },
      });
      header = [
        "Code",
        "Nom",
        "Email",
        "Téléphone",
        "Ville",
        "Inscrit le (ancien site)",
        "Note",
      ];
      rows = clients.map((c) => [
        c.code,
        c.name,
        c.email,
        c.phone,
        c.city,
        date(c.signedUpAt),
        c.adminNote,
      ]);
      break;
    }
    case "devis": {
      const quotes = await prisma.quoteRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
        include: { service: true },
      });
      header = [
        "Date",
        "Nom",
        "Email",
        "Téléphone",
        "Entreprise",
        "Prestation",
        "Budget",
        "Statut",
        "Message",
        "Note interne",
      ];
      rows = quotes.map((q) => [
        date(q.createdAt),
        q.name,
        q.email,
        q.phone,
        q.company,
        q.service.name,
        q.budget,
        q.status,
        q.message,
        q.internalNote,
      ]);
      break;
    }
    case "messages": {
      const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
      });
      header = ["Date", "Nom", "Email", "Téléphone", "Traité", "Message"];
      rows = messages.map((m) => [
        date(m.createdAt),
        m.name,
        m.email,
        m.phone,
        m.handled ? "oui" : "non",
        m.message,
      ]);
      break;
    }
    default:
      return new NextResponse("Not found", { status: 404 });
  }

  await audit(
    profile,
    "export.csv",
    "export",
    what,
    `Export CSV « ${what} » (${rows.length} lignes)`,
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(header, rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${what}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
