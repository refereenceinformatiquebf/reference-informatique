import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { formatPrice } from "@/lib/format";
import { IconFormation } from "@/components/icons";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Formations sur clé USB avec accès à vie à la plateforme en ligne — livraison partout au Burkina Faso.",
};

export const dynamic = "force-dynamic";

export default async function BoutiquePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="flex flex-col">
      <section className="border-line border-b px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-ink text-2xl font-bold">Boutique</h1>
          <p className="text-ink-soft mt-3 leading-relaxed">
            Chaque formation est livrée sur clé USB physique et donne un accès à
            vie à la plateforme en ligne — apprenez avec ou sans connexion.
          </p>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/boutique/${product.slug}`}
              className="border-line hover:border-brand flex flex-col overflow-hidden rounded-lg border"
            >
              <div className="bg-paper-raised relative aspect-[4/3] w-full">
                {product.coverImageUrl ? (
                  <Image
                    src={product.coverImageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-ink-faint flex h-full w-full items-center justify-center">
                    <IconFormation size={40} />
                  </div>
                )}
                {product.compareAtPrice ? (
                  <span className="bg-danger absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                    -
                    {Math.round(
                      (1 - product.price / product.compareAtPrice) * 100,
                    )}
                    %
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h2 className="text-ink text-sm font-semibold">
                  {product.name}
                </h2>
                <p className="text-ink-soft line-clamp-2 text-xs leading-relaxed">
                  {product.shortDescription}
                </p>
                <div className="mt-auto flex items-baseline gap-2 pt-2">
                  {product.compareAtPrice ? (
                    <span className="text-ink-faint tabular text-xs line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  ) : null}
                  <span className="text-brand tabular text-lg font-bold">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
