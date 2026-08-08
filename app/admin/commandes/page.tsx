import type { Metadata } from "next";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/client";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/status-labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  confirmWhatsappPayment,
  cancelOrder,
} from "@/lib/actions/admin-orders";

export const metadata: Metadata = { title: "Commandes" };
export const dynamic = "force-dynamic";

const FILTERS: { label: string; value: OrderStatus | "TOUTES" }[] = [
  { label: "Toutes", value: "TOUTES" },
  { label: "En attente", value: "EN_ATTENTE" },
  { label: "Payées", value: "PAYE" },
  { label: "Annulées", value: "ANNULE" },
];

export default async function AdminCommandesPage({
  searchParams,
}: PageProps<"/admin/commandes">) {
  const { statut } = await searchParams;
  const statusFilter = typeof statut === "string" ? statut : "TOUTES";

  const orders = await prisma.order.findMany({
    where:
      statusFilter === "TOUTES" ? {} : { status: statusFilter as OrderStatus },
    include: { product: true, service: true, profile: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-ink text-xl font-bold">Commandes</h1>
        <div className="flex gap-1">
          {FILTERS.map((filter) => (
            <a
              key={filter.value}
              href={
                filter.value === "TOUTES"
                  ? "/admin/commandes"
                  : `/admin/commandes?statut=${filter.value}`
              }
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusFilter === filter.value
                  ? "bg-brand text-white"
                  : "border-line text-ink-soft border"
              }`}
            >
              {filter.label}
            </a>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucune commande.</p>
      ) : (
        <div className="border-line overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-line text-ink-faint border-b text-left text-xs uppercase">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Produit / service</th>
                <th className="px-4 py-3 font-semibold">Montant</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = ORDER_STATUS_LABELS[order.status];
                const canConfirmWhatsapp =
                  order.status === "EN_ATTENTE" &&
                  order.paymentProvider === "WHATSAPP_MANUAL";

                return (
                  <tr
                    key={order.id}
                    className="border-line border-b last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="text-ink font-medium">
                        {order.profile.name}
                      </p>
                      <p className="text-ink-faint text-xs">
                        {order.profile.phone}
                      </p>
                    </td>
                    <td className="text-ink-soft px-4 py-3">
                      {order.product?.name ?? order.service?.name ?? "—"}
                    </td>
                    <td className="text-ink tabular px-4 py-3 font-semibold">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="text-ink-soft px-4 py-3 text-xs">
                      {order.channel === "BOUTIQUE" ? "FedaPay" : "WhatsApp"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {canConfirmWhatsapp ? (
                        <div className="flex gap-2">
                          <form action={confirmWhatsappPayment}>
                            <input
                              type="hidden"
                              name="orderId"
                              value={order.id}
                            />
                            <Button type="submit" size="sm">
                              Confirmer le paiement
                            </Button>
                          </form>
                          <form action={cancelOrder}>
                            <input
                              type="hidden"
                              name="orderId"
                              value={order.id}
                            />
                            <Button type="submit" size="sm" variant="ghost">
                              Annuler
                            </Button>
                          </form>
                        </div>
                      ) : (
                        <a
                          href={`https://wa.me/${order.profile.phone?.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-success text-xs font-semibold hover:underline"
                        >
                          Contacter
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
