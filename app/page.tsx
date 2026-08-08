import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconFormation,
  IconCode,
  IconAgentIa,
  IconMaintenance,
  IconWhatsapp,
  IconFleche,
} from "@/components/icons";

// Cette page lit le catalogue en base à chaque requête : sans base de
// données réelle connectée (voir Étape 2), `next build` ne peut pas la
// prérendre statiquement. `force-dynamic` la reporte explicitement au
// moment de la requête plutôt que de faire échouer le build.
export const dynamic = "force-dynamic";

const METIERS = [
  {
    href: "/boutique",
    icon: IconFormation,
    title: "Formations",
    description:
      "Des clés USB de formation complètes, livrées chez vous, avec accès à vie à la plateforme en ligne.",
    accent: "brand" as const,
  },
  {
    href: "/services/conception-web",
    icon: IconCode,
    title: "Conception de sites web",
    description:
      "Sites vitrines, boutiques en ligne et plateformes sur mesure, pensés pour convertir.",
    accent: "green" as const,
  },
  {
    href: "/services/agents-ia",
    icon: IconAgentIa,
    title: "Agents IA",
    description:
      "Des assistants qui répondent à vos clients et automatisent vos tâches, 24h/24.",
    accent: "coral" as const,
  },
  {
    href: "/services/maintenance",
    icon: IconMaintenance,
    title: "Maintenance & veille",
    description:
      "Suivi, mises à jour et actualité technologique pour rester performant et sécurisé.",
    accent: "brand" as const,
  },
] as const;

// Fonds pleins + texte contrasté (jamais un fond pâle avec un texte de la
// même teinte : le vert et le corail n'ont pas assez d'écart de luminance
// avec leur propre nuance pâle pour rester lisibles — voir Étape 18, WCAG
// AA). green-700 (pas green-600) pour rester au-dessus de 4.5:1 en texte.
const ACCENT_STYLES = {
  brand: "bg-brand-700 text-white",
  green: "bg-green-700 text-white",
  coral: "bg-coral-600 text-white",
} as const;

const AVATAR_STYLES = [
  "bg-brand-700 text-white",
  "bg-green-700 text-white",
  "bg-coral-600 text-white",
] as const;

export default async function HomePage() {
  const [featuredProducts, testimonials] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      take: 4,
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="from-brand-900 to-brand-700 relative overflow-hidden bg-gradient-to-br px-4 py-24 sm:py-32">
        {/* Texture décorative — grille de points estompée, purement visuelle */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-600 opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="bg-coral-600 absolute -bottom-32 -left-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full bg-green-700 px-4 py-1.5 text-xs font-bold tracking-wide text-white uppercase">
            Burkina Faso · Depuis Ouagadougou
          </span>
          <h1 className="font-display text-3xl leading-tight font-semibold text-white sm:text-5xl">
            L&apos;informatique au service de votre réussite
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/80">
            Formations, sites web, agents IA et maintenance — Référence
            Informatique accompagne particuliers et entreprises au Burkina Faso,
            du premier clic jusqu&apos;au support après-vente.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/services">Découvrir nos services</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:border-white hover:bg-white/15 hover:text-white"
            >
              <Link href="/boutique">Voir la boutique</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* LES 4 MÉTIERS — poids visuel strictement égal */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {METIERS.map((metier) => (
              <Link
                key={metier.href}
                href={metier.href}
                className="border-line hover:border-brand group flex flex-col gap-4 rounded-lg border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-md",
                    ACCENT_STYLES[metier.accent],
                  )}
                >
                  <metier.icon size={22} />
                </span>
                <div>
                  <h2 className="font-display text-ink font-semibold">
                    {metier.title}
                  </h2>
                  <p className="text-ink-soft mt-1.5 text-sm leading-relaxed">
                    {metier.description}
                  </p>
                </div>
                <span className="text-brand mt-auto flex items-center gap-1 text-sm font-semibold">
                  En savoir plus
                  <IconFleche
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* APERÇU BOUTIQUE */}
      {featuredProducts.length > 0 ? (
        <section className="border-line bg-paper-raised border-y px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="font-display text-ink text-lg font-bold">
                  Nos formations sur clé USB
                </h2>
                <p className="text-ink-soft mt-1 text-sm">
                  Clé physique livrée chez vous + accès à vie à la plateforme en
                  ligne.
                </p>
              </div>
              <Link
                href="/boutique"
                className="text-brand hidden text-sm font-semibold sm:block"
              >
                Voir tout le catalogue →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => {
                const discount = product.compareAtPrice
                  ? Math.round(
                      (1 - product.price / product.compareAtPrice) * 100,
                    )
                  : null;
                return (
                  <Link
                    key={product.id}
                    href={`/boutique/${product.slug}`}
                    className="border-line bg-paper hover:border-brand relative flex flex-col overflow-hidden rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="bg-paper-raised relative aspect-[4/3] w-full">
                      {product.coverImageUrl ? (
                        <Image
                          src={product.coverImageUrl}
                          alt={product.name}
                          fill
                          sizes="(min-width: 640px) 25vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-ink-faint flex h-full w-full items-center justify-center">
                          <IconFormation size={32} />
                        </div>
                      )}
                      {discount ? (
                        <span className="bg-coral-600 absolute top-2.5 right-2.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold text-white">
                          -{discount}%
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <h3 className="font-display text-ink text-sm font-semibold">
                        {product.name}
                      </h3>
                      <p className="text-ink-soft line-clamp-2 text-xs leading-relaxed">
                        {product.shortDescription}
                      </p>
                      <div className="mt-auto flex items-baseline gap-2">
                        {product.compareAtPrice ? (
                          <span className="text-ink-faint tabular text-xs line-through">
                            {product.compareAtPrice.toLocaleString("fr-FR")} F
                          </span>
                        ) : null}
                        <span className="text-brand-700 tabular text-base font-bold">
                          {product.price.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* TÉMOIGNAGES */}
      {testimonials.length > 0 ? (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-ink mb-8 text-lg font-bold">
              Ce que disent nos clients
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <figure
                  key={testimonial.id}
                  className="border-line rounded-lg border p-6"
                >
                  <blockquote className="text-ink text-sm leading-relaxed">
                    « {testimonial.quote} »
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                        AVATAR_STYLES[index % AVATAR_STYLES.length],
                      )}
                    >
                      {testimonial.authorName.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-ink-soft text-xs font-medium">
                      {testimonial.authorName}
                      {testimonial.authorCity
                        ? ` — ${testimonial.authorCity}`
                        : ""}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA FINAL */}
      <section className="from-brand-900 to-brand-700 bg-gradient-to-br px-4 py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="font-display text-xl font-bold text-white">
            Une question ? Un projet ?
          </h2>
          <p className="text-sm text-white/80">
            Notre équipe vous répond rapidement, par WhatsApp ou par le
            formulaire de contact.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:border-white hover:text-white"
            >
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22675789737"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <IconWhatsapp size={16} />
                Écrire sur WhatsApp
              </a>
            </Button>
            <Button asChild variant="accent">
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
