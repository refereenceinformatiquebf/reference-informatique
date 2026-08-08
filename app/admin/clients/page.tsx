import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const clients = await prisma.profile.findMany({
    where: { role: "CLIENT" },
    include: { _count: { select: { orders: true, access: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink text-xl font-bold">Clients ({clients.length})</h1>

      <div className="border-line overflow-x-auto rounded-lg border">
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
              <tr
                key={client.id}
                className="border-line border-b last:border-0"
              >
                <td className="text-ink px-4 py-3 font-medium">
                  {client.name}
                </td>
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
                      href={`https://wa.me/${client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success text-xs font-semibold hover:underline"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
