import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/dal";
import { phoneRequired } from "@/lib/checkout/rules";
import { PRODUCT_KINDS } from "@/lib/catalog";
import { getVisibleProduct } from "@/lib/catalog/live";
import { productPath } from "@/lib/catalog/paths";
import { getVisitorCountry } from "@/lib/geo";
import { formatPrice } from "@/lib/format";
import { fr } from "@/lib/typography";
import { Container } from "@/components/ui/section";
import { Price } from "@/components/shop/price";
import { ProductCover } from "@/components/shop/product-cover";
import { IconBouclier } from "@/components/icons";
import { LicenceOrderForm } from "@/components/checkout/licence-order-form";
import { OrderForm } from "./order-form";

export const metadata: Metadata = {
  title: "Finaliser ma commande",
  robots: { index: false, follow: false },
};

const DELIVERY_LINE = {
  "cle-physique":
    "Clé USB livrée gratuitement chez vous sous 24 à 48 h après la confirmation du paiement. Nous vous contactons pour convenir de la remise.",
  numerique:
    "Dès que le paiement est confirmé, un lien personnel vous est envoyé par email : un clic ouvre votre achat, sans mot de passe.",
  manuel:
    "Après la confirmation du paiement, notre équipe vous contacte sur WhatsApp pour vous remettre votre accès.",
} as const;

export default async function CommandePage({
  params,
}: PageProps<"/commande/[slug]">) {
  const { slug } = await params;

  // Pas de compte exigé : un visiteur connecté retrouve ses informations déjà
  // remplies, les autres commandent avec leur nom, leur email et leur téléphone.
  const profile = await getCurrentProfile();

  // Même règle que la fiche produit : un produit réservé à un autre pays
  // n'existe pas pour ce visiteur.
  const country = await getVisitorCountry();
  const product = await getVisibleProduct(slug, country);
  if (!product) notFound();

  const buyer = profile
    ? {
        email: profile.email ?? undefined,
        name: profile.name,
        phone: profile.phone ?? undefined,
      }
    : {};

  // Accès livré automatiquement (licence) : formulaire en deux étapes, paiement
  // en ligne uniquement — pas de commande par WhatsApp, pas de lien de sortie.
  if (product.delivery === "licence-edn") {
    const priceLabel = formatPrice(product.price);
    return (
      <div className="py-8 sm:py-12">
        <Container className="max-w-5xl">
          <h1 className="text-ink text-[1.875rem] leading-[1.1] sm:text-[2.25rem]">
            Finaliser ma commande
          </h1>
          <p className="text-ink-soft mt-2 text-sm">
            Paiement sécurisé — accès envoyé par e-mail dès la confirmation du
            paiement
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
            <LicenceOrderForm
              productSlug={product.slug}
              productName={product.name}
              posterSrc={product.poster?.src}
              priceLabel={priceLabel}
              buyer={buyer}
            />

            <aside className="border-line bg-paper shadow-card sticky top-6 hidden rounded-xl border p-5 lg:block">
              <h2 className="text-ink text-sm font-semibold">Votre commande</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="border-line bg-paper-raised relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
                  {product.poster ? (
                    <Image
                      src={product.poster.src}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  ) : null}
                </div>
                <p className="text-ink min-w-0 flex-1 text-sm leading-snug break-words">
                  {product.name}
                </p>
              </div>
              <div className="border-line mt-4 flex items-center justify-between gap-3 border-t pt-3">
                <span className="text-ink text-sm font-semibold">Total</span>
                <span className="font-display text-ink tabular text-[1.375rem] leading-none">
                  {priceLabel}
                </span>
              </div>
              <p className="text-ink-soft mt-4 flex items-center gap-2 text-xs">
                <IconBouclier size={16} className="text-success shrink-0" />
                {fr("Paiement 100 % sécurisé")}
              </p>
            </aside>
          </div>
        </Container>
      </div>
    );
  }

  const kind = PRODUCT_KINDS[product.kind];

  return (
    <div className="py-10 sm:py-16">
      <Container className="max-w-3xl">
        <Link
          href={productPath(product.slug)}
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
            phoneRequired={phoneRequired(product.delivery)}
            buyer={buyer}
            unitPrice={product.price}
          />
          <p className="text-ink-faint mt-6 flex items-start gap-2 text-xs leading-relaxed">
            <IconBouclier size={16} className="mt-px shrink-0" />
            <span>
              Le paiement en ligne se fait sur une page sécurisée, par carte
              bancaire ou Mobile Money. Nous ne voyons jamais vos codes. Si vous
              préférez, la commande par WhatsApp vous met en relation directe
              avec notre équipe. Une question après l&apos;achat ?{" "}
              <Link
                href="/commande/suivi"
                className="text-brand-text underline underline-offset-4"
              >
                Retrouver ma commande
              </Link>
              .
            </span>
          </p>
        </div>
      </Container>
    </div>
  );
}
