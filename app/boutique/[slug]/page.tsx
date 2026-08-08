import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { IconFormation, IconPlateforme, IconCleUsb } from "@/components/icons";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/json-ld";

export const dynamic = "force-dynamic";

type FaqEntry = { question: string; answer: string };

function isFaqEntry(value: unknown): value is FaqEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "question" in value &&
    "answer" in value
  );
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: PageProps<"/boutique/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/boutique/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !product.active) {
    notFound();
  }

  const faq = Array.isArray(product.faq) ? product.faq.filter(isFaqEntry) : [];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.coverImageUrl ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="flex flex-col">
      <JsonLd data={productJsonLd} />
      <section className="border-line border-b px-4 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="bg-paper-raised relative aspect-[4/3] w-full overflow-hidden rounded-lg">
            {product.coverImageUrl ? (
              <Image
                src={product.coverImageUrl}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 512px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="text-ink-faint flex h-full w-full items-center justify-center">
                <IconFormation size={56} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-ink text-2xl font-bold">{product.name}</h1>
            <p className="text-ink-soft leading-relaxed">
              {product.shortDescription}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="border-line text-ink-soft flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                <IconCleUsb size={14} />
                Clé USB livrée chez vous
              </span>
              <span className="border-line text-ink-soft flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                <IconPlateforme size={14} />
                Accès plateforme à vie
              </span>
            </div>

            <div className="flex items-baseline gap-3 pt-2">
              {product.compareAtPrice ? (
                <span className="text-ink-faint tabular text-lg line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
              <span className="text-brand tabular text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            </div>

            <Button asChild size="lg" className="mt-2 w-full sm:w-auto">
              <Link href={`/commande/${product.slug}`}>Commander</Link>
            </Button>
          </div>
        </div>
      </section>

      {product.longDescription ? (
        <section className="px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-ink-soft leading-relaxed">
              {product.longDescription}
            </p>
          </div>
        </section>
      ) : null}

      {product.contents.length > 0 ? (
        <section className="border-line bg-paper-raised border-y px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-ink mb-6 text-lg font-bold">
              Ce que contient cette formation
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {product.contents.map((item, index) => (
                <li
                  key={item}
                  className="border-line bg-paper flex items-start gap-3 rounded-md border p-3"
                >
                  <span className="bg-brand tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-ink-soft text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {product.whyChooseUs || product.targetAudience.length > 0 ? (
        <section className="px-4 py-14">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-2">
            {product.whyChooseUs ? (
              <div>
                <h2 className="text-ink mb-3 text-base font-bold">
                  Pourquoi choisir cette formation
                </h2>
                <p className="text-ink-soft text-sm leading-relaxed">
                  {product.whyChooseUs}
                </p>
              </div>
            ) : null}
            {product.targetAudience.length > 0 ? (
              <div>
                <h2 className="text-ink mb-3 text-base font-bold">
                  Pour qui est cette formation
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {product.targetAudience.map((profile) => (
                    <li
                      key={profile}
                      className="text-ink-soft flex items-start gap-2 text-sm"
                    >
                      <span className="bg-brand mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                      {profile}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {faq.length > 0 ? (
        <section className="border-line bg-paper-raised border-t px-4 py-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-ink mb-4 text-lg font-bold">
              Questions fréquentes
            </h2>
            <Accordion type="single" collapsible>
              {faq.map((item, index) => (
                <AccordionItem key={item.question} value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ) : null}
    </div>
  );
}
