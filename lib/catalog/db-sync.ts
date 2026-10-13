import { prisma } from "@/lib/prisma/client";
import { findFamily, findProduct, findService } from "@/lib/catalog";

/**
 * Le catalogue vit dans le code (source de vérité des textes ET des prix) ;
 * la base n'a besoin des produits et des services que pour les relations
 * (commande, accès, demande de devis). Ces fonctions créent ou mettent à
 * jour la ligne de base correspondante AU MOMENT où elle devient nécessaire.
 *
 * Conséquence importante : un prix modifié dans le code est pris en compte
 * à la prochaine commande, sans attendre qu'on relance un seed — une
 * commande ne peut donc jamais être facturée à un ancien prix.
 */

/** Ligne `products` à jour pour ce slug, ou null si le slug est inconnu. */
export async function ensureProductRow(slug: string) {
  const product = findProduct(slug);
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

/** Ligne `services` (et sa famille) à jour pour ce slug, ou null. */
export async function ensureServiceRow(slug: string) {
  const service = findService(slug);
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
