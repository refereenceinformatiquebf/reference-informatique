import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth/dal";
import { PRODUCT_KINDS } from "@/lib/catalog";
import { getVisibleProduct } from "@/lib/catalog/live";
import { getVisitorCountry } from "@/lib/geo";
import { Container } from "@/components/ui/section";
import { Price } from "@/components/shop/price";
import { ProductCover } from "@/components/shop/product-cover";
import { IconBouclier } from "@/components/icons";
import { OrderForm } from "./order-form";

export const metadata: Metadata = {
  title: "Finaliser ma commande",
  robots: { index: false, follow: false },
};

const DELIVERY_LINE = {
  "cle-physique":
    "Clé USB livrée gratuitement chez vous sous 24 à 48 h après la confirmation du paiement, avec l'accès à la plateforme.",
  numerique:
    "Accès activé dans votre espace client dès que le paiement est confirmé.",
  manuel:
    "Après la confirmation du paiement, notre équipe vous contacte sur WhatsApp pour vous remettre votre accès.",
  "licence-edn":
    "Votre licence d'activation est générée automatiquement et vous attend dans votre espace client dès que le paiement est confirmé.",
} as const;

export default async function CommandePage({
  params,
}: PageProps<"/commande/[slug]">) {
  const { slug } = await params;

  // Protège aussi la page elle-même (pas seulement le proxy optimiste) —
  // c'est la vérification qui compte réellement, voir lib/auth/dal.ts.
  const profile = await requireProfile();

  // Même règle que la fiche produit : un produit réservé à un autre pays
  // n'existe pas pour ce visiteur.
  const country = await getVisitorCountry();
  const product = await getVisibleProduct(slug, country);
  if (!product) notFound();

  const kind = PRODUCT_KINDS[product.kind];

  return (
    <div className="py-10 sm:py-16">
      <Container className="max-w-3xl">
        <Link
          href={`/boutique/${product.slug}`}
          className="text-ink-faint hover:text-brand-text text-sm transition-colors"
        >
          ← Retour à la fiche
        </Link>
        <h1 className="text-ink mt-4 text-[1.875rem] leading-[1.1] sm:text-[2.5rem]">
          Finaliser ma commande
        </h1>

        <div className="border-line bg-paper mt-8 flex items-center gap-5 rounded-xl border p-4 sm:p-5">
          <div className="border-line bg-paper-raised relative w-20 shrink-0 overflow-hidden rounded-lg border sm:w-24">
            {product.poster ? (
              <div className="relative aspect-[4/5]">
                <Image
                  src={product.poster.src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
            ) : (
              <ProductCover product={product} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
              {kind.label}
            </p>
            <p className="font-display text-ink mt-1 text-[1.25rem] leading-tight">
              {product.name}
            </p>
            <Price
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              className="mt-2"
            />
          </div>
        </div>

        <p className="text-ink-soft mt-4 text-[0.9375rem] leading-relaxed">
          {DELIVERY_LINE[product.delivery]}
        </p>

        <div className="border-line bg-paper shadow-card mt-8 rounded-xl border p-6 sm:p-8">
          <OrderForm
            productSlug={product.slug}
            needsShipping={product.delivery === "cle-physique"}
            defaultPhone={profile.phone ?? undefined}
            unitPrice={product.price}
          />
          <p className="text-ink-faint mt-6 flex items-start gap-2 text-xs leading-relaxed">
            <IconBouclier size={16} className="mt-px shrink-0" />
            Le paiement en ligne se fait sur une page sécurisée, par carte
            bancaire ou Mobile Money. Nous ne voyons jamais vos codes. Si vous
            préférez, la commande par WhatsApp vous met en relation directe avec
            notre équipe.
          </p>
        </div>
      </Container>
    </div>
  );
}
