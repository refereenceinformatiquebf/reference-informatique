import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { deepFr } from "@/lib/typography";

/**
 * Témoignages affichés sur le site : ceux que l'équipe a PUBLIÉS dans
 * l'administration. Tant qu'un produit n'en a aucun en base, le témoignage du
 * code (lib/catalog) prend le relais, pour que le site ne se retrouve jamais
 * sans le message qu'il affichait déjà.
 *
 * Seuls de vrais messages de clients doivent être publiés ici : le site les
 * présente comme « des messages reçus de clients, publiés tels quels ».
 */

export const TESTIMONIALS_TAG = "testimonials";

export type PublicTestimonial = {
  id: string;
  quote: string;
  author: string;
  city?: string;
  productSlug?: string;
  productName?: string;
  featured: boolean;
};

type Loaded = {
  /** Témoignages publiés, dans l'ordre d'affichage. */
  published: PublicTestimonial[];
  /** Nombre total de témoignages en base (publiés ou non). */
  total: number;
};

const fetchPublished = unstable_cache(
  async (): Promise<Loaded> => {
    const [rows, total] = await Promise.all([
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        include: { product: { select: { slug: true, name: true } } },
      }),
      prisma.testimonial.count(),
    ]);
    return {
      total,
      published: rows.map((row) => ({
        id: row.id,
        quote: row.quote,
        author: row.authorName,
        city: row.authorCity ?? undefined,
        productSlug: row.product?.slug,
        productName: row.product?.name,
        featured: row.featured,
      })),
    };
  },
  ["published-testimonials-v1"],
  { tags: [TESTIMONIALS_TAG], revalidate: 60 },
);

async function load(): Promise<Loaded> {
  if (process.env.CATALOG_SKIP_DB === "1") return { published: [], total: 0 };
  try {
    return await fetchPublished();
  } catch (error) {
    console.error("[testimonials] lecture impossible :", error);
    // Base injoignable : on retombe sur les témoignages du code.
    return { published: [], total: 0 };
  }
}

/** Témoignages du code, au même format (repli). */
function fromCode(): PublicTestimonial[] {
  return deepFr(ALL_PRODUCTS).flatMap((product) =>
    product.testimonial
      ? [
          {
            id: `code:${product.slug}`,
            quote: product.testimonial.quote,
            author: product.testimonial.author,
            city: product.testimonial.city,
            productSlug: product.slug,
            productName: product.name,
            featured: false,
          },
        ]
      : [],
  );
}

/** Le témoignage à montrer sur la fiche d'un produit (ou rien). */
export async function getTestimonialForProduct(
  slug: string,
): Promise<PublicTestimonial | undefined> {
  const { published, total } = await load();
  // Dès que l'équipe gère des témoignages en base, la base fait foi : un
  // témoignage dépublié n'est JAMAIS réaffiché par le repli du code.
  if (total > 0) return published.find((item) => item.productSlug === slug);
  return fromCode().find((item) => item.productSlug === slug);
}

/**
 * Témoignages de l'accueil, limités à ceux dont le produit est visible par ce
 * visiteur : un visiteur hors du Burkina ne voit donc jamais un message qui
 * parle d'une clé qu'il ne peut pas voir. Les témoignages sans produit sont
 * toujours visibles.
 */
export async function getHomeTestimonials(
  visibleSlugs: ReadonlySet<string>,
  limit = 6,
): Promise<PublicTestimonial[]> {
  const { published, total } = await load();
  const base = total > 0 ? published : fromCode();
  return base
    .filter((item) => !item.productSlug || visibleSlugs.has(item.productSlug))
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, limit);
}
