import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Container, Eyebrow, IconChip } from "@/components/ui/section";
import { FaqList } from "@/components/ui/faq-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JsonLd } from "@/components/json-ld";
import { PackInlineCta } from "@/components/shop/pack-inline-cta";
import { PackPurchaseCard } from "@/components/shop/pack-purchase-card";
import { ProductCover } from "@/components/shop/product-cover";
import { StepsGrid } from "@/components/shop/steps-grid";
import { StickyBuyBar } from "@/components/shop/sticky-buy-bar";
import { MetaEvent } from "@/components/marketing/meta-event";
import { productParams } from "@/lib/meta-pixel";
import { formatPrice } from "@/lib/format";
import { getVisibleProduct } from "@/lib/catalog/live";
import { productPath } from "@/lib/catalog/paths";
import { getVisitorCountry } from "@/lib/geo";
import { SITE } from "@/lib/site";
import { fr } from "@/lib/typography";
import type { IconKey } from "@/lib/catalog/types";

const SLUG = "pack-activation-windows11et10-et-office365-a-vie";

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

/* -------------------------------------------------------------------------- */
/* Contenu de la page de vente                                                 */
/*                                                                             */
/* Même architecture que la fiche du pack de 360 DIGITALE (affiche et carte    */
/* d'achat, onglets, étapes numérotées, barre d'achat mobile), textes écrits    */
/* pour Référence Informatique. Chaque promesse correspond à ce qui est        */
/* réellement livré (page « Mes licences », guide d'activation). Aucun avis,   */
/* aucun chiffre de vente ni aucune garantie n'est inventé : les conditions    */
/* générales ne prévoient ni remboursement ni délai de rétractation, et la     */
/* page n'en parle donc pas. « Plus de 160 clients » est un chiffre fourni par */
/* le propriétaire.                                                            */
/* -------------------------------------------------------------------------- */

const BADGES: { label: string; variant: "neutral" | "success" | "navy" }[] = [
  { label: "Pack Windows + Office", variant: "neutral" },
  { label: "Accès instantané", variant: "success" },
  { label: "Accès à vie", variant: "navy" },
];

const TAGLINE =
  "Fini « Activer Windows » et les documents bloqués : Word, Excel et PowerPoint travaillent enfin sans limite, pour un seul paiement.";

const CARD_POINTS: { icon: IconKey; text: string }[] = [
  {
    icon: "cadenas",
    text: "Vous réglez avec votre compte Mobile Money ou votre carte, sur une page protégée : vos codes ne passent jamais par nous.",
  },
  {
    icon: "eclair",
    text: "Votre accès personnel arrive dès la confirmation du paiement.",
  },
  {
    icon: "support",
    text: "Guide pas à pas inclus, et une assistance si une étape vous bloque.",
  },
  {
    icon: "verifie",
    text: "Plus de 160 clients nous font confiance.",
  },
];

const LEAD =
  "Un ordinateur qui bloque ne prévient jamais : c'est la veille d'un rendu, d'un concours ou d'une réunion que « Activer Windows » s'affiche et que Word passe en lecture seule.";

const INTRO =
  "Ce pack règle tout cela en une seule fois. Vous payez, vous installez une petite application en suivant le guide, et Windows 10 ou 11 comme Office s'activent pour de bon : plus d'abonnement qui tourne, plus de bricolage, plus de rappel à l'écran.";

const PROBLEMS: { title: string; text: string }[] = [
  {
    title: "Le document qui refuse de s'enregistrer",
    text: "Office non activé passe en mode lecture : vous ouvrez vos fichiers, mais vous ne pouvez plus les modifier. Rapport, mémoire, CV, dossier de candidature : tout s'arrête quand l'échéance approche.",
  },
  {
    title: "« Activer Windows » qui ne part jamais",
    text: "Le filigrane reste affiché, la personnalisation est verrouillée, les rappels reviennent. Devant un client ou un jury, votre PC fait bricolé.",
  },
  {
    title: "L'astuce d'internet qui lâche au bout de quelques semaines",
    text: "Lien douteux, activation faite par un inconnu sur Facebook : ça tient un temps, puis ça saute et il faut tout refaire. Sans compter les virus que ces fichiers peuvent cacher.",
  },
  {
    title: "L'abonnement qui ne s'arrête jamais",
    text: "Tant que vous payez, vous gardez vos outils. Le jour où l'argent manque, c'est l'accès à vos propres documents qui disparaît.",
  },
];

const OFFICE_APPS: [name: string, detail: string][] = [
  ["Word", "rapports, courriers, CV et mémoires, sans limite."],
  ["Excel", "budgets, factures et tableaux de suivi."],
  ["PowerPoint", "des diaporamas qui font bonne impression."],
  ["Outlook", "messagerie et agenda réunis au même endroit."],
  ["OneNote", "vos notes et vos idées bien rangées."],
];

const CONTENTS: { title: string; text: string; apps?: boolean }[] = [
  {
    title: "Votre accès personnel",
    text: "Une clé à votre nom, créée automatiquement une fois le paiement confirmé. Une seule clé suffit pour activer Office et Windows, grâce à l'application fournie.",
  },
  {
    title: "Microsoft Office",
    text: "Les logiciels que l'on utilise partout, au travail comme aux études :",
    apps: true,
  },
  {
    title: "Windows 10 et 11, activés",
    text: "Fini le filigrane et les réglages verrouillés : la personnalisation s'ouvre et votre PC fonctionne comme il le doit, que vous soyez sous Windows 10 ou 11.",
  },
  {
    title: "Une installation guidée, et un antivirus gratuit offert",
    text: "L'application, les fichiers d'installation officiels de Windows et d'Office et un guide pas à pas vous attendent dans votre espace. Un antivirus gratuit est offert pour protéger vos fichiers.",
  },
];

const WHY: { title: string; text: string }[] = [
  {
    title: "Un seul paiement.",
    text: "Aucun abonnement, aucun renouvellement : ce que vous réglez aujourd'hui l'est pour de bon.",
  },
  {
    title: "Prêt en quelques minutes.",
    text: "L'accès est créé automatiquement à la confirmation du paiement : personne à attendre, aucun rendez-vous à prendre.",
  },
  {
    title: "Accessible à tous.",
    text: "Une petite application et un guide pas à pas : si vous savez installer une application sur votre téléphone, vous y arriverez.",
  },
  {
    title: "Les bons fichiers.",
    text: "Windows et Office s'installent à partir des fichiers d'installation officiels, fournis dans votre espace.",
  },
  {
    title: "Un coup de main si besoin.",
    text: "En cas de blocage, l'assistance vous répond sur WhatsApp.",
  },
];

const FOR_WHO =
  "Aux étudiants qui rédigent leur mémoire, aux fonctionnaires et salariés qui vivent dans Word et Excel, aux entrepreneurs qui préparent devis et présentations, et à toute personne qui vient d'acheter, d'installer ou de réinitialiser un ordinateur.";

const GOOD_TO_KNOW: string[] = [
  "Ce pack est conçu pour les ordinateurs Windows : il ne fonctionne pas sur Mac.",
  "Chaque paiement correspond à un ordinateur.",
  "Il faut une connexion Internet pour télécharger, installer et activer.",
  "Le pack active Windows 10 et 11 ; installer Windows 11, en revanche, dépend de la configuration de votre PC (exigences de Microsoft).",
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "Vous commandez",
    text: "En une minute, avec Mobile Money ou votre carte, depuis une page de paiement protégée. Aucun compte à créer.",
  },
  {
    title: "Votre accès est créé",
    text: "Une fois le paiement confirmé, l'accès se crée tout seul et un e-mail vous envoie le lien de votre espace personnel.",
  },
  {
    title: "Vous installez et activez",
    text: "Depuis votre espace, téléchargez l'application et collez-y votre clé : Windows et Office s'activent en un clic, avec le guide sous les yeux à chaque écran.",
  },
  {
    title: "Vous êtes accompagné",
    text: "Une étape vous bloque ? L'assistance vous répond sur WhatsApp, depuis votre espace.",
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question:
      "Je n'y connais pas grand-chose en informatique : vais-je y arriver ?",
    answer:
      "Oui. Il suffit d'installer une seule petite application et de suivre le guide, étape par étape : comptez quelques minutes. Et si une étape vous bloque, notre équipe vous aide pas à pas.",
  },
  {
    question: "Est-ce que ça expire ? Dois-je payer chaque année ?",
    answer:
      "Non. Vous payez une seule fois : pas d'abonnement, rien à renouveler, l'accès est à vie.",
  },
  {
    question: "Combien de temps pour recevoir mon pack ?",
    answer:
      "En quelques minutes : une fois votre paiement confirmé, l'accès se crée tout seul et un lien personnel arrive dans votre boîte e-mail. Vous n'attendez personne.",
  },
];

const H2 =
  "font-display text-ink mt-4 text-[1.375rem] leading-tight sm:text-[1.625rem]";

function Dot() {
  return (
    <span
      aria-hidden
      className="bg-brand mt-[0.55rem] h-[7px] w-[7px] shrink-0 rounded-full"
    />
  );
}

export default async function PackActivationPage() {
  const country = await getVisitorCountry();
  const product = await getVisibleProduct(SLUG, country);
  if (!product) notFound();

  const orderHref = `/commande/${product.slug}`;
  const price = formatPrice(product.price);
  const faq = FAQ.map((item) => ({
    question: fr(item.question),
    answer: fr(item.answer),
  }));

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
    },
  };

  return (
    <div className="pb-24">
      <JsonLd data={productJsonLd} />
      <MetaEvent name="ViewContent" params={productParams(product)} />

      {/* ====================== En-tête : affiche + achat ====================== */}
      <section className="bg-paper border-line border-b">
        <Container className="py-8 sm:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="mx-auto w-full max-w-md min-w-0 lg:sticky lg:top-6 lg:max-w-none lg:self-start">
              <div className="border-line bg-paper-raised relative overflow-hidden rounded-xl border">
                {product.poster ? (
                  <div className="relative aspect-square w-full bg-white">
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
              {product.poster ? (
                <p className="text-ink-faint mt-3 text-xs">
                  {fr(
                    "Affiche de l'offre. Le prix, le contenu et la livraison indiqués sur cette page font foi.",
                  )}
                </p>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                {BADGES.map((badge) => (
                  <Badge key={badge.label} variant={badge.variant}>
                    {fr(badge.label)}
                  </Badge>
                ))}
              </div>

              <div>
                <h1 className="text-ink text-[1.875rem] leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] lg:text-[2.75rem]">
                  {fr(product.name)}
                </h1>
                <p className="text-ink-soft mt-4 text-[1.0625rem] leading-relaxed">
                  {fr(TAGLINE)}
                </p>
              </div>

              <PackPurchaseCard
                price={product.price}
                orderHref={orderHref}
                points={CARD_POINTS}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ====================== Description / Livraison ====================== */}
      <section className="bg-paper-raised py-12 sm:py-16">
        <Container className="max-w-3xl">
          <Tabs defaultValue="description">
            <TabsList
              aria-label="Détails du pack"
              className="-mx-4 [scrollbar-width:none] px-4 sm:mx-0 sm:px-0"
            >
              <TabsTrigger
                value="description"
                className="min-h-12 text-[0.9375rem]"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="livraison"
                className="min-h-12 text-[0.9375rem]"
              >
                Livraison et accès
              </TabsTrigger>
            </TabsList>

            {/* forceMount : les deux onglets restent dans la page (lisibles par
                les moteurs de recherche, boutons surveillés par la barre d'achat). */}
            <TabsContent
              value="description"
              forceMount
              className="pt-8 data-[state=inactive]:hidden"
            >
              <div className="flex max-w-3xl flex-col gap-5">
                <p className="font-display text-ink text-[1.375rem] leading-snug sm:text-[1.5rem]">
                  {fr(LEAD)}
                </p>
                <p className="text-ink-soft text-[1.0625rem] leading-relaxed">
                  {fr(INTRO)}
                </p>

                <h2 className={H2}>Les blocages que vous ne reverrez plus</h2>
                <ul className="flex flex-col gap-4">
                  {PROBLEMS.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <Dot />
                      <p className="text-ink-soft min-w-0 text-[0.9375rem] leading-relaxed">
                        <strong className="text-ink block font-semibold">
                          {fr(item.title)}
                        </strong>
                        {fr(item.text)}
                      </p>
                    </li>
                  ))}
                </ul>

                <h2 className={H2}>Ce que contient votre pack</h2>
                <div className="flex flex-col gap-5">
                  {CONTENTS.map((block, index) => (
                    <div key={block.title}>
                      <h3 className="text-ink text-[1.0625rem] leading-snug font-semibold">
                        {index + 1}. {fr(block.title)}
                      </h3>
                      <p className="text-ink-soft mt-1 text-[0.9375rem] leading-relaxed">
                        {fr(block.text)}
                      </p>
                      {block.apps ? (
                        <ul className="mt-2.5 flex flex-col gap-1.5">
                          {OFFICE_APPS.map(([name, detail]) => (
                            <li
                              key={name}
                              className="text-ink-soft text-[0.9375rem] leading-relaxed"
                            >
                              <span className="text-ink font-semibold">
                                {name}
                              </span>{" "}
                              : {fr(detail)}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>

                <h2 className={H2}>
                  Pourquoi ce pack plutôt qu&rsquo;un autre
                </h2>
                <ul className="flex flex-col gap-3">
                  {WHY.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <Dot />
                      <p className="text-ink-soft min-w-0 text-[0.9375rem] leading-relaxed">
                        <strong className="text-ink font-semibold">
                          {fr(item.title)}
                        </strong>{" "}
                        {fr(item.text)}
                      </p>
                    </li>
                  ))}
                </ul>

                <h2 className={H2}>À qui s&rsquo;adresse ce pack</h2>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(FOR_WHO)}
                </p>

                <div className="border-line bg-paper rounded-xl border p-5">
                  <p className="font-display text-ink flex items-center gap-3 text-[1.125rem]">
                    <IconChip name="verifie" size={32} />À savoir avant de
                    commander
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {GOOD_TO_KNOW.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Dot />
                        <span className="text-ink-soft min-w-0 text-[0.9375rem] leading-relaxed">
                          {fr(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <h2 className={H2}>Prix</h2>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(
                    `Le pack complet (Windows 10 et 11, Office et antivirus gratuit) pour ${price}. Vous payez une fois, sans abonnement ni renouvellement.`,
                  )}
                </p>
              </div>

              <PackInlineCta
                id="description-cta"
                title="Prêt à reprendre la main sur votre ordinateur ?"
                label={`Je commande — ${price}`}
                href={orderHref}
              />
            </TabsContent>

            <TabsContent
              value="livraison"
              forceMount
              className="pt-8 data-[state=inactive]:hidden"
            >
              <div className="max-w-3xl">
                <h2 className="font-display text-ink text-[1.375rem] leading-tight sm:text-[1.625rem]">
                  Comment vous recevez votre pack
                </h2>
                <div className="mt-6">
                  <StepsGrid steps={STEPS} />
                </div>

                <div className="mt-12">
                  <Eyebrow>Questions fréquentes</Eyebrow>
                  <h2 className="font-display text-ink mt-2 mb-5 text-[1.375rem] leading-tight sm:text-[1.625rem]">
                    {fr("Avant de commander, vous vous demandez peut-être…")}
                  </h2>
                  <FaqList items={faq} />
                </div>
              </div>

              <PackInlineCta
                id="delivery-cta"
                title="Votre pack vous attend."
                label={`Je commande — ${price}`}
                href={orderHref}
              />
            </TabsContent>
          </Tabs>
        </Container>
      </section>

      <StickyBuyBar
        href={orderHref}
        label="Commander"
        name={product.name}
        price={price}
        hideWhileVisible={["hero-cta", "description-cta", "delivery-cta"]}
      />
    </div>
  );
}
