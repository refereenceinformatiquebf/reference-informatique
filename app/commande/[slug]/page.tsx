import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { IconFormation, IconPaiement, IconWhatsapp } from "@/components/icons";
import { startFedapayCheckout, startWhatsappOrder } from "@/lib/actions/order";

export const metadata: Metadata = { title: "Commander" };
export const dynamic = "force-dynamic";

export default async function CommandePage({
  params,
}: PageProps<"/commande/[slug]">) {
  const { slug } = await params;

  // Protège aussi la page elle-même (pas seulement le proxy optimiste) —
  // c'est la vérification qui compte réellement, voir lib/auth/dal.ts.
  await requireProfile();

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.active) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-ink text-xl font-bold">Finaliser la commande</h1>

      <div className="border-line mt-6 flex items-center gap-4 rounded-lg border p-4">
        <div className="bg-paper-raised relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
          {product.coverImageUrl ? (
            <Image
              src={product.coverImageUrl}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="text-ink-faint flex h-full w-full items-center justify-center">
              <IconFormation size={24} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-ink text-sm font-semibold">{product.name}</p>
          <p className="text-brand tabular text-lg font-bold">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>

      <form className="mt-8 flex flex-col gap-3">
        <input type="hidden" name="productId" value={product.id} />

        <Button
          formAction={startFedapayCheckout}
          size="lg"
          className="flex items-center justify-center gap-2"
        >
          <IconPaiement size={18} />
          Payer en ligne maintenant
        </Button>

        <Button
          formAction={startWhatsappOrder}
          variant="outline"
          size="lg"
          className="flex items-center justify-center gap-2"
        >
          <IconWhatsapp size={18} />
          Commander et payer via WhatsApp
        </Button>

        <p className="text-ink-faint text-center text-xs">
          Carte bancaire, Orange Money, Moov Money ou Wave — ou commandez
          directement sur WhatsApp si vous préférez.
        </p>
      </form>
    </div>
  );
}
