import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import {
  Container,
  Eyebrow,
  IconChip,
  SectionHeading,
} from "@/components/ui/section";
import { JsonLd } from "@/components/json-ld";
import { StickyBuyBar } from "@/components/shop/sticky-buy-bar";
import {
  IconAlerte,
  IconCadenas,
  IconFleche,
  IconLogiciel,
  IconOrdinateur,
  IconPaiement,
} from "@/components/icons";
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
/* Chaque promesse ci-dessous correspond à ce qui est réellement livré (page   */
/* « Mes licences » de l'espace client, guide d'activation). Aucun avis, aucun */
/* chiffre de vente ni aucune garantie n'est inventé : les conditions          */
/* générales ne prévoient ni remboursement ni délai de rétractation.           */
/* -------------------------------------------------------------------------- */

const REASSURANCE: { icon: IconKey; label: string }[] = [
  { icon: "acces-a-vie", label: "Accès à vie, sans abonnement" },
  { icon: "eclair", label: "Prêt en quelques minutes" },
  { icon: "paiement", label: "Paiement Mobile Money et carte" },
  { icon: "verifie", label: "Plus de 160 clients nous font confiance" },
];

const PROBLEMS: {
  icon: typeof IconAlerte;
  title: string;
  text: string;
}[] = [
  {
    icon: IconLogiciel,
    title: "Votre document refuse de s'enregistrer",
    text: "Quand Office n'est pas activé, il passe en mode réduit : vous pouvez lire, mais plus modifier. Rapport, mémoire, CV, dossier de candidature… tout s'arrête au moment où vous en avez le plus besoin.",
  },
  {
    icon: IconOrdinateur,
    title: "« Activer Windows » reste collé à l'écran",
    text: "Le filigrane ne part pas, la personnalisation est bloquée, les rappels reviennent. Devant un client, un patron ou un jury, votre ordinateur donne une image bricolée.",
  },
  {
    icon: IconAlerte,
    title: "L'activation « trouvée sur internet » qui lâche",
    text: "Un lien, un crack, une activation faite par quelqu'un sur Facebook : ça tient quelques semaines, puis ça saute. Vous recommencez, vous repayez — et ces fichiers douteux peuvent cacher des virus.",
  },
  {
    icon: IconPaiement,
    title: "L'abonnement qui ne s'arrête jamais",
    text: "Avec un abonnement, vous gardez vos outils tant que vous payez. Le jour où vous arrêtez, ou que l'argent manque, vous perdez l'accès à vos propres documents de travail.",
  },
];

const BENEFITS: { icon: IconKey; title: string; text: string }[] = [
  {
    icon: "modele",
    title: "Word : écrivez sans limite",
    text: "Rapports, courriers, CV, mémoires : tapez, mettez en forme et enregistrez, sans aucun blocage.",
  },
  {
    icon: "logiciel",
    title: "Excel : maîtrisez vos chiffres",
    text: "Budgets, factures, tableaux de suivi : calculez et organisez vos données en toute tranquillité.",
  },
  {
    icon: "formation",
    title: "PowerPoint : présentez avec assurance",
    text: "Des diaporamas propres et professionnels pour convaincre un jury, un client ou toute une salle.",
  },
  {
    icon: "mail",
    title: "Outlook et OneNote : restez organisé",
    text: "Vos e-mails, votre agenda et vos notes réunis au même endroit.",
  },
  {
    icon: "ordinateur",
    title: "Windows activé : un PC enfin complet",
    text: "Plus de filigrane, personnalisation libre : votre ordinateur fonctionne comme il doit, à Windows 10 comme à Windows 11.",
  },
  {
    icon: "bouclier",
    title: "Bonus : 2 antivirus gratuits",
    text: "360 Total Security et Avast One Free sont fournis : installez celui que vous préférez pour protéger vos fichiers.",
  },
];

const PILLARS: { icon: IconKey; title: string; text: string }[] = [
  {
    icon: "acces-a-vie",
    title: "À vie : vous payez une fois",
    text: "Pas d'échéance, pas de renouvellement, pas de mauvaise surprise dans six mois. Un seul paiement, et c'est réglé pour de bon.",
  },
  {
    icon: "service",
    title: "Simple : aucun niveau technique requis",
    text: "Une seule petite application et un guide pas à pas. Si vous savez installer une application, vous saurez le faire.",
  },
  {
    icon: "eclair",
    title: "Rapide : prêt en quelques minutes",
    text: "Votre accès est généré automatiquement dès la confirmation du paiement : pas d'attente, pas de rendez-vous à prendre.",
  },
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "Vous commandez",
    text: "En une minute, par Mobile Money ou carte bancaire, sur une page de paiement sécurisée. Aucun compte à créer.",
  },
  {
    title: "Vous recevez tout, tout de suite",
    text: "Dès que le paiement est confirmé, votre accès personnel est généré automatiquement et un lien vous est envoyé par e-mail.",
  },
  {
    title: "Vous installez, et c'est fini",
    text: "Suivez le guide pas à pas : quelques minutes plus tard, Word, Excel, PowerPoint et Windows sont prêts à travailler.",
  },
];

const TRUST: { icon: IconKey; title: string; text: string }[] = [
  {
    icon: "cadenas",
    title: "Paiement sécurisé",
    text: "Carte bancaire ou Mobile Money sur une page protégée. Nous ne voyons jamais vos codes.",
  },
  {
    icon: "telecharger",
    title: "Fichiers officiels",
    text: "Windows et Office s'installent depuis des fichiers d'installation officiels.",
  },
  {
    icon: "support",
    title: "Un guide et une assistance",
    text: "Un guide pas à pas, et une équipe joignable si une étape vous bloque.",
  },
  {
    icon: "verifie",
    title: "Déjà 160 clients",
    text: "Plus de 160 clients nous font confiance pour leurs outils numériques.",
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Je ne suis pas à l'aise en informatique : vais-je y arriver ?",
    answer: `Oui. Il suffit d'installer une seule petite application et de suivre le guide, étape par étape : comptez quelques minutes. Et si une étape vous bloque, appelez ou écrivez-nous au ${SITE.phoneDisplay} : nous vous guidons.`,
  },
  {
    question: "Est-ce que ça expire ? Dois-je payer chaque année ?",
    answer:
      "Non. C'est un accès à vie : un seul paiement, aucun abonnement, aucun renouvellement à prévoir.",
  },
  {
    question: "Combien de temps pour recevoir mon pack ?",
    answer:
      "Dès que votre paiement est confirmé, votre accès est généré automatiquement et un lien personnel vous est envoyé par e-mail : vous n'attendez personne.",
  },
];

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
    <div>
      <JsonLd data={productJsonLd} />

      {/* ============================== Héros ============================== */}
      <section className="illus-zone on-navy">
        <Container className="grid grid-cols-1 gap-10 pt-8 pb-20 sm:pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-14 lg:pb-24">
          <div className="rise-in flex flex-col items-start gap-6">
            <p className="rounded-2xl bg-white/12 px-3.5 py-1.5 text-[0.75rem] leading-snug font-medium tracking-[0.04em] text-white ring-1 ring-white/25">
              {fr("Windows 10 et 11 + Office 365 · Activation à vie")}
            </p>
            <h1 className="text-[2.125rem] leading-[1.08] tracking-[-0.02em] sm:text-[3rem]">
              {fr(
                "Fini « Activer Windows » et les documents bloqués : Word, Excel et PowerPoint, à vie.",
              )}
            </h1>
            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-white/85 sm:text-lg">
              {fr(
                `Un seul paiement de ${price}. Vous installez en quelques minutes, guidé pas à pas, et votre ordinateur fonctionne enfin comme il le devrait : sans abonnement, sans blocage, sans mauvaise surprise.`,
              )}
            </p>

            <ul className="flex flex-col gap-2.5 text-[0.9375rem] text-white/90">
              {[
                "Accès à vie : vous payez une seule fois",
                "Prêt en quelques minutes, même sans être technique",
                "Reçu dès la confirmation de votre paiement",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="bg-brand-200 mt-[0.55rem] h-[7px] w-[7px] shrink-0 rounded-full"
                  />
                  <span>{fr(item)}</span>
                </li>
              ))}
            </ul>

            <div id="hero-cta" className="flex w-full flex-col gap-3 sm:w-auto">
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display tabular text-[2.5rem] leading-none">
                  {price}
                </span>
                <span className="text-sm text-white/75">
                  paiement unique, à vie
                </span>
              </p>
              <Button asChild variant="inverse" size="lg" className="w-full">
                <Link href={orderHref}>
                  Je commande maintenant
                  <IconFleche size={18} />
                </Link>
              </Button>
              <p className="flex items-center gap-2 text-[0.8125rem] text-white/75">
                <IconCadenas size={15} />
                {fr("Paiement sécurisé par Mobile Money ou carte bancaire")}
              </p>
            </div>
          </div>

          {product.poster ? (
            <div
              className="rise-in mx-auto w-full max-w-[26rem]"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
                <Image
                  src={product.poster.src}
                  alt={product.poster.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 416px, 92vw"
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-center text-xs text-white/65">
                {fr(
                  "Affiche de l'offre. Les informations de cette page (prix, contenu, livraison) font foi.",
                )}
              </p>
            </div>
          ) : null}
        </Container>
      </section>

      {/* ===================== Bandeau de réassurance ===================== */}
      <Container className="relative z-10 -mt-12">
        <ul className="bg-paper border-line shadow-lift grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
          {REASSURANCE.map((item) => (
            <li
              key={item.label}
              className="bg-paper flex min-w-0 flex-col items-start gap-2.5 p-4 sm:flex-row sm:items-center sm:gap-3 sm:p-5"
            >
              <IconChip name={item.icon} size={40} />
              <span className="text-ink min-w-0 text-[0.8125rem] leading-snug font-medium [overflow-wrap:anywhere] sm:text-sm">
                {fr(item.label)}
              </span>
            </li>
          ))}
        </ul>
      </Container>

      {/* ============================== Problème ============================== */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Vous connaissez sûrement ça"
            title={fr("Le pire moment pour que votre ordinateur vous lâche")}
            lead={fr(
              "Ce n'est jamais un jour tranquille : c'est la veille d'un rendu, d'une candidature, d'une réunion. Et c'est toujours à ce moment-là que ça bloque.",
            )}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {PROBLEMS.map(({ icon: ProblemIcon, title, text }) => (
              <div
                key={title}
                className="border-line bg-paper shadow-card flex flex-col gap-3 rounded-xl border p-6"
              >
                <span className="bg-danger-bg text-danger-text inline-flex h-11 w-11 items-center justify-center rounded-[12px]">
                  <ProblemIcon size={22} />
                </span>
                <h3 className="text-ink text-[1.1875rem] leading-snug font-semibold">
                  {fr(title)}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(text)}
                </p>
              </div>
            ))}
          </div>
          <p className="font-display text-ink mx-auto mt-10 max-w-2xl text-center text-[1.375rem] leading-snug sm:text-[1.625rem]">
            {fr(
              "Chaque blocage vous coûte du temps, du stress et parfois une occasion. Il existe une solution simple, une fois pour toutes.",
            )}
          </p>
        </Container>
      </section>

      {/* ============================== Solution ============================== */}
      <section className="bg-paper-raised border-line border-y py-20 sm:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="La solution"
            title={fr("Un seul pack. Tout est prêt. Pour de bon.")}
            lead={fr(
              "Windows et Office, activés ensemble, à vie. Vous payez une fois, vous installez en quelques minutes, et vous n'y pensez plus.",
            )}
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((item) => (
              <div
                key={item.title}
                className="border-line bg-paper shadow-card flex flex-col gap-3 rounded-xl border p-6"
              >
                <IconChip name={item.icon} size={44} />
                <h3 className="text-ink text-[1.1875rem] leading-snug font-semibold">
                  {fr(item.title)}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(item.text)}
                </p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href={orderHref}>
                {fr(`Je veux mon pack — ${price}`)}
                <IconFleche size={18} />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================== Piliers ============================== */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Pourquoi c'est le bon choix"
            title={fr("Trois raisons de ne plus jamais y repenser")}
          />
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {PILLARS.map((item) => (
              <div key={item.title} className="flex flex-col gap-3">
                <IconChip name={item.icon} size={48} />
                <h3 className="font-display text-ink text-[1.375rem] leading-tight">
                  {fr(item.title)}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(item.text)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Étapes ============================== */}
      <section className="bg-paper-raised border-line border-y py-20 sm:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Comment ça se passe"
            title={fr("Trois étapes, et c'est terminé")}
          />
          <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-line bg-paper shadow-card flex flex-col gap-3 rounded-xl border p-6"
              >
                <span className="bg-brand text-brand-contrast font-display flex h-10 w-10 items-center justify-center rounded-full text-[1.25rem]">
                  {index + 1}
                </span>
                <h3 className="text-ink text-[1.1875rem] leading-snug font-semibold">
                  {fr(step.title)}
                </h3>
                <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
                  {fr(step.text)}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-ink-soft mx-auto mt-8 max-w-2xl text-center text-[0.875rem] leading-relaxed">
            {fr(
              `Bon à savoir : ce pack est conçu pour les ordinateurs Windows (pas pour Mac), et votre licence l'active sur 2 appareils. Besoin d'un appareil de plus ? Appelez-nous au ${SITE.phoneDisplay}.`,
            )}
          </p>
        </Container>
      </section>

      {/* ============================== Confiance ============================== */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Votre tranquillité"
            title={fr("Vous achetez en confiance")}
            lead={fr(
              "On sait que vous avez peut-être déjà été déçu. Voilà ce qui rend cet achat sûr.",
            )}
          />
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div
                key={item.title}
                className="border-line bg-paper shadow-card flex flex-col gap-3 rounded-xl border p-5"
              >
                <IconChip name={item.icon} size={40} />
                <h3 className="text-ink text-base leading-snug font-semibold">
                  {fr(item.title)}
                </h3>
                <p className="text-ink-soft text-[0.875rem] leading-relaxed">
                  {fr(item.text)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Questions ============================== */}
      <section className="bg-paper-raised border-line border-y py-20 sm:py-24">
        <Container className="max-w-3xl">
          <Eyebrow>Questions fréquentes</Eyebrow>
          <h2 className="font-display text-ink mt-2 mb-6 text-[1.625rem] leading-tight sm:text-[2rem]">
            {fr("Avant de commander, vous vous demandez peut-être…")}
          </h2>
          <FaqList items={faq} />
        </Container>
      </section>

      {/* ============================== Appel final ============================== */}
      <section className="illus-zone on-navy">
        <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-[1.875rem] leading-[1.1] tracking-[-0.01em] sm:text-[2.75rem]">
            {fr("Reprenez la main sur votre ordinateur, dès aujourd'hui.")}
          </h2>
          <p className="max-w-xl text-[1.0625rem] leading-relaxed text-white/85">
            {fr(
              `Un seul paiement de ${price}, une fois pour toutes. Dans quelques minutes, Word, Excel, PowerPoint et Windows fonctionnent enfin sans limite.`,
            )}
          </p>
          <div id="final-cta" className="flex w-full max-w-sm flex-col gap-3">
            <Button asChild variant="inverse" size="lg" className="w-full">
              <Link href={orderHref}>
                {fr(`Je commande maintenant — ${price}`)}
                <IconFleche size={18} />
              </Link>
            </Button>
            <p className="flex items-center justify-center gap-2 text-[0.8125rem] text-white/75">
              <IconCadenas size={15} />
              {fr("Paiement sécurisé · Accès immédiat · À vie")}
            </p>
          </div>
        </Container>
      </section>

      <StickyBuyBar
        href={orderHref}
        label="Commander"
        name={product.name}
        price={price}
        hideWhileVisible={["hero-cta", "final-cta"]}
      />
    </div>
  );
}
