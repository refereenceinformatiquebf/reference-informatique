import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { QuoteStatusSelect } from "./quote-status-select";

export const metadata: Metadata = { title: "Devis" };
export const dynamic = "force-dynamic";

export default async function AdminDevisPage() {
  const quotes = await prisma.quoteRequest.findMany({
    include: { service: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-ink text-xl font-bold">Demandes de devis</h1>

      {quotes.length === 0 ? (
        <p className="text-ink-soft text-sm">Aucune demande de devis.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((quote) => (
            <div key={quote.id} className="border-line rounded-lg border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-ink text-sm font-semibold">
                    {quote.name} — {quote.service.name}
                  </p>
                  <p className="text-ink-faint mt-0.5 text-xs">
                    {quote.email} · {quote.phone}
                    {quote.company ? ` · ${quote.company}` : ""}
                  </p>
                </div>
                <QuoteStatusSelect quoteId={quote.id} status={quote.status} />
              </div>
              <p className="text-ink-soft mt-3 text-sm leading-relaxed">
                {quote.message}
              </p>
              {quote.budget ? (
                <p className="text-ink-faint mt-2 text-xs">
                  Budget indicatif : {quote.budget}
                </p>
              ) : null}
              <a
                href={`https://wa.me/${quote.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-success mt-3 inline-block text-xs font-semibold hover:underline"
              >
                Contacter sur WhatsApp
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
