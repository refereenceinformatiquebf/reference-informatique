import Link from "next/link";
import { prisma } from "@/lib/prisma/client";
import { Button } from "@/components/ui/button";
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
  },
  {
    href: "/services/conception-web",
    icon: IconCode,
    title: "Conception de sites web",
    description:
      "Sites vitrines, boutiques en ligne et plateformes sur mesure, pensés pour convertir.",
  },
  {
    href: "/services/agents-ia",
    icon: IconAgentIa,
    title: "Agents IA",
    description:
      "Des assistants qui répondent à vos clients et automatisent vos tâches, 24h/24.",
  },
  {
    href: "/services/maintenance",
    icon: IconMaintenance,
    title: "Maintenance & veille",
    description:
      "Suivi, mises à jour et actualité technologique pour rester performant et sécurisé.",
  },
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
      <section className="border-line border-b px-4 py-20 sm:py-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h1 className="text-ink text-2xl leading-tight font-bold sm:text-4xl">
            L&apos;informatique au service de votre réussite
          </h1>
          <p className="text-ink-soft max-w-xl text-base leading-relaxed">
            Formations, sites web, agents IA et maintenance — Référence
            Informatique accompagne particuliers et entreprises au Burkina Faso,
            du premier clic jusqu&apos;au support après-vente.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/services">Découvrir nos services</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
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
                className="border-line hover:border-brand group flex flex-col gap-4 rounded-lg border p-6 transition-colors"
              >
                <span className="bg-brand/10 text-brand flex h-11 w-11 items-center justify-center rounded-md">
                  <metier.icon size={22} />
                </span>
                <div>
                  <h2 className="text-ink font-semibold">{metier.title}</h2>
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
                <h2 className="text-ink text-lg font-bold">
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
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/boutique/${product.slug}`}
                  className="border-line bg-paper hover:border-brand flex flex-col gap-3 rounded-lg border p-5 transition-colors"
                >
                  <h3 className="text-ink text-sm font-semibold">
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
                    <span className="text-brand tabular text-base font-bold">
                      {product.price.toLocaleString("fr-FR")} F
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* TÉMOIGNAGES */}
      {testimonials.length > 0 ? (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-ink mb-8 text-lg font-bold">
              Ce que disent nos clients
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.id}
                  className="border-line rounded-lg border p-6"
                >
                  <blockquote className="text-ink text-sm leading-relaxed">
                    « {testimonial.quote} »
                  </blockquote>
                  <figcaption className="text-ink-soft mt-4 text-xs font-medium">
                    {testimonial.authorName}
                    {testimonial.authorCity
                      ? ` — ${testimonial.authorCity}`
                      : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA FINAL */}
      <section className="border-line bg-paper-raised border-t px-4 py-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <h2 className="text-ink text-xl font-bold">
            Une question ? Un projet ?
          </h2>
          <p className="text-ink-soft text-sm">
            Notre équipe vous répond rapidement, par WhatsApp ou par le
            formulaire de contact.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
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
            <Button asChild>
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
