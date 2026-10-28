import Image from "next/image";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Container, Eyebrow } from "@/components/ui/section";
import { Icon } from "@/components/icons/icon-by-key";
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

const SLUG = "pack-activation-windows11et10-et-office365-a-vie";

// Typographie propre à cette page (règles .pack-type dans app/globals.css) :
// titres en Plus Jakarta Sans, texte en Inter. Polices variables, sous-ensemble
// latin : une quarantaine de ko chacune, chargées sur cette page seulement.
const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pack-heading",
  display: "swap",
});
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-pack-body",
  display: "swap",
});

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
/*                                                                             */
/* Écriture : phrases courtes, une idée par phrase, le client au centre         */
/* (« vous »), des scènes qu'il a déjà vécues, des mots simples.               */
/* -------------------------------------------------------------------------- */

const BADGES: { label: string; variant: "neutral" | "success" | "navy" }[] = [
  { label: "Pack Windows + Office", variant: "neutral" },
  { label: "Accès instantané", variant: "success" },
  { label: "Accès à vie", variant: "navy" },
];

const TAGLINE =
  "Fini « Activer Windows » et les documents verrouillés. Word, Excel et PowerPoint tournent enfin sans limite, pour un seul paiement, à vie.";

const PROBLEMS: { title: string; text: string }[] = [
  {
    title: "Word refuse d'enregistrer.",
    text: "Sans activation, Office passe en lecture seule : vous ouvrez vos fichiers, vous ne pouvez plus les modifier. Rapport, mémoire, CV, candidature : tout s'arrête.",
  },
  {
    title: "« Activer Windows » ne part jamais.",
    text: "Filigrane en permanence, réglages verrouillés, rappels à répétition. Devant un client ou un jury, votre PC fait bricolé.",
  },
  {
    title: "L'astuce d'internet lâche au bout de quelques semaines.",
    text: "Un lien douteux ou une activation faite par un inconnu sur Facebook ne dure pas, et peut cacher des virus. Vous recommencez, vous repayez.",
  },
  {
    title: "L'abonnement Microsoft pèse lourd, année après année.",
    text: "Il se paie chaque année, en devises, et demande souvent une carte internationale que beaucoup n'ont pas. Le jour où vous arrêtez, vous perdez l'accès à vos propres documents.",
  },
];

const OFFICE_APPS: [name: string, detail: string][] = [
  ["Word", "rapports, courriers, CV et mémoires, sans limite."],
  ["Excel", "budgets, factures et tableaux de suivi."],
  ["PowerPoint", "des diaporamas qui font bonne impression."],
  ["Outlook", "messagerie et agenda réunis au même endroit."],
  ["OneNote", "vos notes et vos idées bien rangées."],
];

const INCLUDED: { title: string; text: string }[] = [
  {
    title: "Votre clé d'activation personnelle.",
    text: "Elle porte votre nom et se crée dès que votre paiement passe : une seule clé active Office et Windows.",
  },
  {
    title: "L'application d'activation.",
    text: "Vous y collez votre clé, un clic, et c'est fait.",
  },
  {
    title: "Microsoft Office, en deux versions.",
    text: "Office 365 et Office 2024 Professional Plus, au choix : Word, Excel, PowerPoint, Outlook, OneNote et plus encore.",
  },
  {
    title: "Windows 10 et 11, activés.",
    text: "Plus de filigrane, plus de réglages verrouillés.",
  },
  {
    title: "Les fichiers d'installation officiels.",
    text: "Windows et Office, à télécharger depuis votre espace.",
  },
  {
    title: "Un antivirus gratuit, offert.",
    text: "Pour protéger vos fichiers dès le premier jour.",
  },
  {
    title: "Le guide pas à pas.",
    text: "En PDF et en ligne, à suivre écran après écran.",
  },
  {
    title: "Une assistance sur WhatsApp.",
    text: "Si une étape vous bloque, quelqu'un vous répond.",
  },
  {
    title: "Votre espace personnel.",
    text: "Votre clé, vos fichiers et votre guide, à retrouver quand vous voulez, sur téléphone comme sur ordinateur.",
  },
];

const FOR_WHO: string[] = [
  "Vous êtes étudiant : mémoire, exposés, dossiers à rendre.",
  "Vous êtes fonctionnaire ou salarié : Word et Excel font votre quotidien.",
  "Vous êtes entrepreneur ou freelance : devis, factures et présentations ne peuvent pas attendre.",
  "Vous êtes secrétaire ou assistant : courriers, plannings et comptes rendus s'enchaînent.",
  "Vous êtes comptable ou gestionnaire : vos tableaux Excel doivent tourner sans accroc.",
  "Vous êtes enseignant : cours, supports et évaluations à préparer.",
  "Vous venez d'acheter, d'installer ou de réinitialiser un ordinateur Windows (le pack ne fonctionne pas sur Mac).",
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "Vous commandez",
    text: "Une minute suffit, avec Mobile Money ou votre carte, depuis une page de paiement protégée. Aucun compte à créer.",
  },
  {
    title: "Votre accès se crée",
    text: "Une fois le paiement confirmé, tout est généré automatiquement. Un e-mail vous envoie le lien de votre espace personnel.",
  },
  {
    title: "Vous installez, vous activez",
    text: "Téléchargez l'application, collez-y votre clé : Windows et Office s'activent en un clic, avec le guide sous les yeux.",
  },
  {
    title: "Vous n'êtes jamais seul",
    text: "Une étape vous bloque ? L'assistance vous répond sur WhatsApp, depuis votre espace.",
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question:
      "Je n'y connais pas grand-chose en informatique : vais-je y arriver ?",
    answer:
      "Oui. C'est très simple d'activer Windows et Office à vie, vous recevez le guide aussi : comptez juste quelques minutes. Et si vous rencontrez des difficultés, notre équipe vous aide pas à pas.",
  },
  {
    question: "Est-ce que ça expire ? Dois-je payer chaque année ?",
    answer:
      "Non. Vous payez une seule fois : pas d'abonnement, rien à renouveler, l'accès est à vie.",
  },
  {
    question: "Combien de temps pour recevoir mon pack ?",
    answer:
      "Quelques minutes. Une fois votre paiement confirmé, l'accès se crée tout seul et un lien personnel arrive dans votre boîte e-mail. Vous n'attendez personne.",
  },
];

const H2 = "text-ink mt-6 text-[1.5rem] leading-tight sm:text-[1.75rem]";
const BODY = "text-ink-soft text-base leading-[1.75]";

function Dot() {
  return (
    <span
      aria-hidden
      className="bg-brand mt-[0.65rem] h-[7px] w-[7px] shrink-0 rounded-full"
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
    <div
      className={`pack-type pb-24 ${headingFont.variable} ${bodyFont.variable}`}
    >
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
                <h1 className="text-ink text-[1.75rem] sm:text-[2.25rem] lg:text-[2.5rem]">
                  {fr(product.name)}
                </h1>
                <p className="text-ink-soft mt-4 text-[1.0625rem] leading-[1.7]">
                  {fr(TAGLINE)}
                </p>
              </div>

              <PackPurchaseCard price={product.price} orderHref={orderHref} />
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
                className="font-display min-h-12 text-base font-semibold"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="livraison"
                className="font-display min-h-12 text-base font-semibold"
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
                <p className="font-display text-ink text-[1.5rem] leading-[1.25] sm:text-[1.875rem]">
                  {fr(
                    "Le jour où votre ordinateur vous lâche, c'est toujours le pire jour.",
                  )}
                </p>
                <p className={`${BODY} text-[1.0625rem]`}>
                  {fr(
                    "La veille d'un rendu. Avant un concours. Une heure avant une réunion. Et soudain, « Activer Windows » s'affiche, Word passe en lecture seule, votre document refuse de s'enregistrer.",
                  )}
                </p>
                <p className={`${BODY} text-[1.0625rem]`}>
                  {fr("Ce pack met fin à tout cela, ")}
                  <strong className="text-ink font-semibold">
                    {fr("une bonne fois pour toutes.")}
                  </strong>
                </p>
                <p className="font-display text-brand-text text-[1.375rem] leading-snug sm:text-[1.625rem]">
                  {fr("Vous payez. Vous installez. Ça marche.")}
                </p>
                <p className={`${BODY} text-[1.0625rem]`}>
                  {fr(
                    "Une petite application, un guide pas à pas, et Windows 10 ou 11 comme Office s'activent pour de bon.",
                  )}
                </p>

                <h2 className={H2}>
                  Reconnaissez-vous l&rsquo;un de ces blocages ?
                </h2>
                <ul className="flex flex-col gap-5">
                  {PROBLEMS.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <Dot />
                      <p className={`${BODY} min-w-0`}>
                        <strong className="text-ink block font-semibold">
                          {fr(item.title)}
                        </strong>
                        {fr(item.text)}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="border-brand bg-paper font-display text-ink rounded-r-lg border-l-4 px-5 py-4 text-[1.0625rem] leading-snug">
                  {fr(
                    "Si l'un de ces blocages est le vôtre, ce pack est fait pour vous.",
                  )}
                </p>

                <h2 className={H2}>Ce que vous recevez exactement</h2>
                <ul className="flex flex-col gap-4">
                  {INCLUDED.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="text-brand-text mt-[0.2rem] shrink-0">
                        <Icon name="verifie" size={20} />
                      </span>
                      <p className={`${BODY} min-w-0`}>
                        <strong className="text-ink font-semibold">
                          {fr(item.title)}
                        </strong>{" "}
                        {fr(item.text)}
                      </p>
                    </li>
                  ))}
                </ul>

                <h3 className="text-ink mt-2 text-[1.125rem] leading-snug">
                  Avec Office, vous pouvez enfin :
                </h3>
                <ul className="flex flex-col gap-2">
                  {OFFICE_APPS.map(([name, detail]) => (
                    <li key={name} className={`${BODY} flex gap-3`}>
                      <Dot />
                      <span className="min-w-0">
                        <span className="text-ink font-semibold">{name}</span> :{" "}
                        {fr(detail)}
                      </span>
                    </li>
                  ))}
                </ul>

                <h2 className={H2}>Ce pack est pour vous si…</h2>
                <ul className="flex flex-col gap-3">
                  {FOR_WHO.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Dot />
                      <span className={`${BODY} min-w-0`}>{fr(item)}</span>
                    </li>
                  ))}
                </ul>

                <h2 className={H2}>Le prix</h2>
                <p className={BODY}>
                  <strong className="text-ink font-semibold">
                    {price}, une seule fois.
                  </strong>{" "}
                  {fr(
                    "Windows 10 et 11, Office, antivirus gratuit et guide compris. Rien d'autre à payer, ni aujourd'hui ni plus tard.",
                  )}
                </p>
                <p className={BODY}>
                  {fr(
                    "Un abonnement Microsoft se paie chaque année, sans fin. Ici, vous payez une fois et c'est à vous pour de bon.",
                  )}
                </p>
                <p className={BODY}>
                  {fr(
                    "Réglez avec Orange Money, Moov Money ou un autre Mobile Money, ou par carte bancaire, depuis une page protégée.",
                  )}
                </p>
              </div>

              <PackInlineCta
                id="description-cta"
                title="Vous payez. Vous installez. Ça marche."
                label={`Je commande — ${price}`}
                href={orderHref}
                note="Paiement sécurisé · Accès dès la confirmation · À vie"
              />
            </TabsContent>

            <TabsContent
              value="livraison"
              forceMount
              className="pt-8 data-[state=inactive]:hidden"
            >
              <div className="max-w-3xl">
                <h2 className="text-ink text-[1.5rem] leading-tight sm:text-[1.75rem]">
                  Comment ça se passe, concrètement
                </h2>
                <p className={`${BODY} mt-3`}>
                  {fr(
                    "Pas d'attente, pas de rendez-vous : tout se fait en ligne, à votre rythme.",
                  )}
                </p>
                <div className="mt-6">
                  <StepsGrid steps={STEPS} />
                </div>

                <div className="mt-12">
                  <Eyebrow>Questions fréquentes</Eyebrow>
                  <h2 className="text-ink mt-2 mb-5 text-[1.5rem] leading-tight sm:text-[1.75rem]">
                    {fr("Les questions qu'on nous pose le plus")}
                  </h2>
                  <FaqList items={faq} />
                </div>
              </div>

              <PackInlineCta
                id="delivery-cta"
                title="Votre pack vous attend."
                label={`Je commande — ${price}`}
                href={orderHref}
                note="Plus de 160 clients nous font déjà confiance."
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
