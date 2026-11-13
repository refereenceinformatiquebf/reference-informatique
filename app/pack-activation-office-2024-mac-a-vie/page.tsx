import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckList,
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { JsonLd } from "@/components/json-ld";
import { ContactFab } from "@/components/shop/contact-fab";
import { Price } from "@/components/shop/price";
import { ProductCover } from "@/components/shop/product-cover";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/catalog";
import { getVisibleProduct } from "@/lib/catalog/live";
import { productPath } from "@/lib/catalog/paths";
import { getVisitorCountry } from "@/lib/geo";
import { getTestimonialForProduct } from "@/lib/testimonials";
import { SITE } from "@/lib/site";
import { fr } from "@/lib/typography";

/**
 * Fiche du pack Mac Office, servie à une adresse courte à la racine du site,
 * comme le pack Windows (voir lib/catalog/paths.ts). Dérivée de
 * app/boutique/[slug]/page.tsx mais épurée : ni fil d'Ariane, ni étapes de
 * livraison, ni FAQ, ni suggestions — seulement ce qui mène à la commande.
 * /boutique/<slug> redirige ici ; l'ancien slug (avant « Office 2024 ») aussi.
 */
const SLUG = "pack-activation-office-2024-mac-a-vie";

export async function generateMetadata(): Promise<Metadata> {
  const country = await getVisitorCountry();
  const product = await getVisibleProduct(SLUG, country);
  if (!product) {
    return {
      title: "Page introuvable",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: productPath(product.slug) },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      images: product.poster
        ? [{ url: product.poster.src, alt: product.poster.alt }]
        : [
            {
              url: "/opengraph-image.png",
              width: 1200,
              height: 630,
              alt: SITE.name,
            },
          ],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function MacPackPage() {
  const country = await getVisitorCountry();
  const product = await getVisibleProduct(SLUG, country);
  if (!product) notFound();

  const percent = discountPercent(product);
  const testimonial = await getTestimonialForProduct(product.slug);
  const orderHref = `/commande/${product.slug}`;
  const isKey = product.kind === "cle";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seo.description,
    sku: product.slug,
    brand: { "@type": "Brand", name: SITE.name },
    ...(product.poster ? { image: `${SITE.url}${product.poster.src}` } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE.url}${productPath(product.slug)}`,
      priceCurrency: "XOF",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE.name },
      ...(product.restrictedTo
        ? {
            eligibleRegion: product.restrictedTo.map((code) => ({
              "@type": "Country",
              name: code,
            })),
          }
        : {}),
    },
  };

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={productJsonLd} />

      {/* ======================= En-tête de fiche ======================= */}
      <section className="bg-paper border-line border-b">
        <Container className="py-8 sm:py-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            {/* Visuel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="border-line bg-paper-raised relative overflow-hidden rounded-xl border">
                {product.poster ? (
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={product.poster.src}
                      alt={product.poster.alt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 520px, 100vw"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <ProductCover product={product} />
                )}
              </div>
            </div>

            {/* Informations et achat */}
            <div className="flex flex-col gap-6">
              {product.badge || isKey ? (
                <div className="flex flex-wrap items-center gap-2">
                  {product.badge ? (
                    <Badge variant="success">{fr(product.badge)}</Badge>
                  ) : null}
                  {isKey ? (
                    <Badge variant="outline">Disponible au Burkina Faso</Badge>
                  ) : null}
                </div>
              ) : null}

              <div>
                <h1 className="text-ink text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
                  {product.name}
                </h1>
                <p className="text-ink-soft mt-4 text-[1.0625rem] leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              <ul className="grid grid-cols-2 gap-3">
                {product.facts.map((fact) => (
                  <li
                    key={fact.label}
                    className="border-line bg-paper-raised flex items-center gap-3 rounded-lg border p-3"
                  >
                    <IconChip name={fact.icon} size={36} className="bg-paper" />
                    <span className="text-ink text-[0.8125rem] leading-snug font-medium">
                      {fact.label}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-line bg-paper shadow-card rounded-xl border p-5 sm:p-6">
                <Price
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  size="lg"
                  showDiscount
                />
                {percent && product.compareAtPrice ? (
                  <p className="text-success-text mt-2 text-sm font-medium">
                    {`Vous économisez ${formatPrice(product.compareAtPrice - product.price)}`}
                  </p>
                ) : null}

                <div className="mt-5">
                  <Button asChild size="lg" className="w-full">
                    <Link href={orderHref}>Commander maintenant</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================= Le récit ======================= */}
      <section className="py-14 sm:py-20">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <Eyebrow>
              {isKey ? "Pourquoi cette clé" : "Pourquoi ce produit"}
            </Eyebrow>
            <div className="mt-4 flex max-w-2xl flex-col gap-5">
              {product.story.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? "font-display text-ink text-[1.5rem] leading-snug"
                      : "text-ink-soft text-[1.0625rem] leading-relaxed"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="border-line bg-paper h-fit rounded-xl border p-6 sm:p-7">
            <h2 className="font-display text-ink text-[1.5rem] leading-tight">
              Ce que vous obtenez
            </h2>
            <CheckList items={product.highlights} className="mt-5" />
          </div>
        </Container>
      </section>

      {/* ======================= Contenu détaillé ======================= */}
      {product.contents && product.contents.length > 0 ? (
        <section className="bg-paper border-line border-y py-14 sm:py-20">
          <Container>
            <SectionHeading
              eyebrow="Le contenu"
              title={
                isKey ? "Ce que contient la clé" : "Ce que contient ce produit"
              }
            />
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {product.contents.map((group) => (
                <div
                  key={group.title}
                  className="border-line bg-paper-raised rounded-lg border p-6"
                >
                  <h3 className="font-display text-ink text-[1.25rem] leading-tight">
                    {group.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-4">
                    {group.items.map((item) => (
                      <li key={item.name} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="bg-brand mt-[0.55rem] h-[7px] w-[7px] shrink-0 rounded-full"
                        />
                        <span>
                          <span className="text-ink block text-[0.9375rem] leading-snug font-medium">
                            {item.name}
                          </span>
                          {item.detail ? (
                            <span className="text-ink-soft mt-0.5 block text-sm leading-relaxed">
                              {item.detail}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ======================= Pour qui ======================= */}
      <section className="py-14 sm:py-20">
        <Container>
          <SectionHeading
            as="h2"
            eyebrow="Pour qui ?"
            title="Ce produit est fait pour vous si…"
          />
          <CheckList items={product.forWho} className="mt-6 max-w-2xl" />
        </Container>
      </section>

      {/* ======================= Témoignage ======================= */}
      {testimonial ? (
        <section className="py-14 sm:py-20">
          <Container>
            <figure className="mx-auto max-w-3xl text-center">
              <blockquote className="font-display text-ink text-[1.5rem] leading-snug sm:text-[1.875rem]">
                «&nbsp;{fr(testimonial.quote)}&nbsp;»
              </blockquote>
              <figcaption className="text-ink-soft mt-5 text-sm">
                <span className="text-ink font-medium">
                  {testimonial.author}
                </span>
                {testimonial.city ? `, ${testimonial.city}` : ""}
                <span className="text-ink-faint">
                  {" "}
                  · message d&rsquo;un client
                </span>
              </figcaption>
            </figure>
          </Container>
        </section>
      ) : null}

      {/* ======================= Barre d'achat mobile ======================= */}
      <div className="border-line bg-paper/95 fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-ink-soft truncate text-xs">{product.name}</p>
            <p className="font-display text-ink tabular text-[1.375rem] leading-tight">
              {formatPrice(product.price)}
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href={orderHref}>Commander</Link>
          </Button>
        </div>
      </div>

      <ContactFab
        productSlug={product.slug}
        productName={product.name}
        priceLabel={formatPrice(product.price)}
        value={product.price}
        orderHref={orderHref}
      />
    </div>
  );
}
