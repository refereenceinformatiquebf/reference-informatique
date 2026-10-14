import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Container, Eyebrow } from "@/components/ui/section";
import { JsonLd } from "@/components/json-ld";
import { HowItWorks } from "@/components/shop/how-it-works";
import { Price } from "@/components/shop/price";
import { ProductCard } from "@/components/shop/product-card";
import { IconBouclier, IconWhatsapp } from "@/components/icons";
import { formatPrice } from "@/lib/format";
import { PRODUCT_KINDS } from "@/lib/catalog";
import { getRelatedProducts, getVisibleProduct } from "@/lib/catalog/live";
import { getVisitorCountry } from "@/lib/geo";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";

const SLUG = "licence-expert-office-365-windows-11";

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
    alternates: { canonical: `/boutique/${product.slug}` },
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

export default async function LicenceExpertPage() {
  const country = await getVisitorCountry();
  const product = await getVisibleProduct(SLUG, country);
  if (!product) notFound();

  const kind = PRODUCT_KINDS[product.kind];
  const related = await getRelatedProducts(product, country, 3);
  const orderHref = `/commande/${product.slug}`;
  const wa = whatsappLink(
    `Bonjour, j'ai une question sur « ${product.name} ».`,
  );

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
      url: `${SITE.url}/boutique/${product.slug}`,
      priceCurrency: "XOF",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={productJsonLd} />

      {/* ======================= En-tête ======================= */}
      <section className="bg-paper border-line border-b">
        <Container className="py-8 sm:py-10">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Boutique", href: "/boutique" },
              { label: kind.plural, href: `/boutique?famille=${product.kind}` },
              { label: product.name },
            ]}
          />

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
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
                ) : null}
              </div>
              <p className="text-ink-faint mt-3 text-xs">
                Affiche de l&rsquo;offre. Les informations de cette page (prix,
                contenu, livraison) font foi.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{kind.label}</Badge>
                {product.badge ? (
                  <Badge variant="success">{fr(product.badge)}</Badge>
                ) : null}
              </div>

              <div>
                <h1 className="text-ink text-[2rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem]">
                  {product.name}
                </h1>
                <p className="text-ink-soft mt-4 text-[1.0625rem] leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              <div className="border-line bg-paper shadow-card rounded-xl border p-5 sm:p-6">
                <Price price={product.price} size="lg" />

                <div className="mt-5 flex flex-col gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href={orderHref}>Commander maintenant</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={wa} target="_blank" rel="noopener noreferrer">
                      <IconWhatsapp size={18} />
                      Poser une question sur WhatsApp
                    </a>
                  </Button>
                </div>

                <p className="text-ink-faint mt-4 flex items-start gap-2 text-xs leading-relaxed">
                  <IconBouclier size={16} className="mt-px shrink-0" />
                  Paiement sécurisé par carte bancaire ou Mobile Money. Nous ne
                  voyons jamais vos codes.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================= Description / Livraison ======================= */}
      <section className="py-14 sm:py-20">
        <Container className="max-w-3xl">
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="livraison">Livraison et accès</TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="flex flex-col gap-5">
                <p className="font-display text-ink text-[1.375rem] leading-snug">
                  {fr(
                    "Windows qui réclame son activation, Office qui refuse d'enregistrer un document : ça arrive au pire moment, en plein rapport ou en pleine présentation.",
                  )}
                </p>
                <p className="text-ink-soft text-[1.0625rem] leading-relaxed">
                  {fr(
                    "Cette licence Expert règle les deux à la fois : elle active Microsoft Office 365 et Windows 11 sur votre ordinateur, via une seule petite application à installer. Vous payez, votre licence personnelle est générée automatiquement en quelques minutes, vous l'installez : c'est fait. Pas d'abonnement à renouveler, pas de compte tiers à créer — une licence à vie, à vous.",
                  )}
                </p>

                <h2 className="font-display text-ink mt-4 text-[1.5rem] leading-tight">
                  Ce que contient la licence
                </h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-ink text-[1.0625rem] font-semibold">
                      1. Licence Expert
                    </h3>
                    <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
                      {fr(
                        "Une clé d'activation personnelle — pas une simple licence Windows : c'est elle qui active à la fois Office 365 ET Windows 11 sur votre ordinateur, via l'application d'activation incluse.",
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-ink text-[1.0625rem] font-semibold">
                      2. Microsoft Office 365
                    </h3>
                    <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
                      Retrouvez les principaux outils bureautiques Microsoft :
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {[
                        [
                          "Word",
                          "rédiger vos documents, rapports et courriers.",
                        ],
                        [
                          "Excel",
                          "effectuer vos calculs, créer des tableaux et gérer vos données.",
                        ],
                        [
                          "PowerPoint",
                          "concevoir des présentations professionnelles.",
                        ],
                        [
                          "Outlook",
                          "organiser vos e-mails et vos communications.",
                        ],
                        [
                          "OneNote",
                          "prendre des notes et organiser vos idées.",
                        ],
                      ].map(([name, detail]) => (
                        <li
                          key={name}
                          className="text-ink-soft text-[0.9375rem] leading-relaxed"
                        >
                          <span className="text-ink font-medium">{name}</span> :{" "}
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-ink text-[1.0625rem] font-semibold">
                      3. Windows 11 activé
                    </h3>
                    <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
                      {fr(
                        "Profitez de Windows 11 et de son interface moderne pour travailler, étudier et utiliser vos applications au quotidien, sous réserve de la compatibilité de votre ordinateur.",
                      )}
                    </p>
                  </div>
                </div>

                <h2 className="font-display text-ink mt-4 text-[1.5rem] leading-tight">
                  Pourquoi choisir cette licence
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {[
                    "Trois éléments en un seul achat : licence Expert, Office 365 et Windows 11 — pas juste une licence Windows seule.",
                    "Livraison automatique et instantanée : votre licence arrive dès la confirmation du paiement, aucune attente.",
                    "Installation guidée : un guide complet vous accompagne étape par étape.",
                    "Licence à vie : aucun abonnement à renouveler.",
                    "Assistance sur WhatsApp si une étape bloque.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[0.9375rem] leading-relaxed"
                    >
                      <span
                        aria-hidden
                        className="bg-brand mt-[0.55rem] h-[7px] w-[7px] shrink-0 rounded-full"
                      />
                      <span className="text-ink-soft">{fr(item)}</span>
                    </li>
                  ))}
                </ul>

                <h2 className="font-display text-ink mt-4 text-[1.5rem] leading-tight">
                  À qui s&rsquo;adresse cette licence
                </h2>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(
                    "À toute personne dont Windows ou Office n'est plus activé, aux étudiants, entrepreneurs et salariés qui ont besoin d'Office pour travailler, à qui vient d'installer ou de réinitialiser son PC, et à qui préfère une licence à vie plutôt qu'un abonnement à renouveler. Cette licence est conçue pour Windows : elle ne fonctionne pas sur Mac.",
                  )}
                </p>

                <h2 className="font-display text-ink mt-4 text-[1.5rem] leading-tight">
                  Prix
                </h2>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(
                    `La licence complète (Expert + Office 365 + Windows 11) à ${formatPrice(product.price)}, en un paiement unique.`,
                  )}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="livraison">
              <HowItWorks mode={product.delivery} />
              <div className="mt-10">
                <Eyebrow>Questions fréquentes</Eyebrow>
                <h2 className="font-display text-ink mt-2 mb-5 text-[1.5rem] leading-tight">
                  Avant de commander
                </h2>
                <FaqList items={product.faq} />
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </section>

      {/* ======================= Suggestions ======================= */}
      {related.length > 0 ? (
        <section className="bg-paper border-line border-t pt-14 pb-10 sm:pt-16 sm:pb-12">
          <Container>
            <Eyebrow>Pour aller plus loin</Eyebrow>
            <h2 className="font-display text-ink mt-2 mb-8 text-[1.625rem] leading-tight sm:text-[2rem]">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <ProductCard key={item.slug} product={item} index={index} />
              ))}
            </div>
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
    </div>
  );
}
