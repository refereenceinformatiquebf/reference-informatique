import { prisma } from "@/lib/prisma/client";
import { findFamily } from "@/lib/catalog";
import { getProduct, getService } from "@/lib/catalog/live";

/**
 * La base n'a besoin des produits et des services que pour les relations
 * (commande, accès, demande de devis). Ces fonctions créent la ligne de base
 * correspondante AU MOMENT où elle devient nécessaire.
 *
 * Elles ne modifient JAMAIS ce que l'équipe a réglé depuis l'administration :
 *  - ligne absente : créée à partir du catalogue (code ou administration) ;
 *  - ligne présente et jamais modifiée par l'équipe : ses champs miroirs sont
 *    rafraîchis depuis le code, pour qu'une correction du code s'applique ;
 *  - ligne modifiée par l'équipe : intouchée (la base fait foi).
 * Le prix facturé vient toujours du catalogue vivant (lib/catalog/live.ts),
 * pas de cette ligne.
 */

/** Ligne `products` pour ce slug (créée si besoin), ou null si le slug est inconnu. */
export async function ensureProductRow(slug: string) {
  // Un produit géré depuis l'administration (créé ou modifié là) a toujours sa
  // ligne, MÊME masqué : l'équipe doit pouvoir préparer son contenu et ses
  // accès avant de le rendre visible. Les clients, eux, ne passent jamais par
  // ici pour un produit masqué (la commande vérifie d'abord le catalogue visible).
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing && (existing.adminEditedAt || existing.source === "ADMIN")) {
    return existing;
  }

  const product = await getProduct(slug);
  if (!product) return null;

  const data = {
    name: product.name,
    shortDescription: product.summary,
    longDescription: product.story.join("\n\n"),
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    coverImageUrl: product.poster?.src ?? null,
    contents: (product.contents ?? []).flatMap((group) =>
      group.items.map((item) => item.name),
    ),
    faq: product.faq.map(({ question, answer }) => ({ question, answer })),
    targetAudience: product.forWho,
    active: true,
    displayOrder: product.order,
  };

  return prisma.product.upsert({
    where: { slug: product.slug },
    update: data,
    create: { slug: product.slug, ...data },
  });
}

/** Ligne `services` (et sa famille) pour ce slug, ou null. */
export async function ensureServiceRow(slug: string) {
  const service = await getService(slug);
  if (!service) return null;
  const family = findFamily(service.family);
  if (!family) return null;

  const category = await prisma.serviceCategory.upsert({
    where: { slug: family.slug },
    update: {
      name: family.name,
      description: family.intro[0],
      iconKey: family.icon,
      displayOrder: family.order,
    },
    create: {
      slug: family.slug,
      name: family.name,
      description: family.intro[0],
      iconKey: family.icon,
      displayOrder: family.order,
    },
  });

  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing?.adminEditedAt) return existing;

  const data = {
    categoryId: category.id,
    name: service.name,
    description: service.summary,
    priceType: service.priceType,
    priceFrom: service.priceFrom ?? null,
    features: service.deliverables.map((item) => item.title),
    active: true,
    displayOrder: service.order,
  };

  return prisma.service.upsert({
    where: { slug: service.slug },
    update: data,
    create: { slug: service.slug, ...data },
  });
}
