"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit, diff } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { ALL_PRODUCTS } from "@/lib/catalog";
import { CATALOG_TAG, getAllProducts } from "@/lib/catalog/live";
import {
  productCommercialSchema,
  productContentSchema,
  productSlugSchema,
} from "@/lib/catalog/schema";
import { formToContent, readProductForm } from "@/lib/catalog/form";
import { uploadProductImage } from "@/lib/admin/uploads";

export type ProductSaveState =
  | {
      ok: boolean;
      message: string;
      /** Erreurs par champ : clé = chemin du champ (ex. « seo.title »). */
      errors?: Record<string, string>;
      slug?: string;
    }
  | undefined;

const FIELD_LABELS: Record<string, string> = {
  name: "Nom",
  tagline: "Promesse",
  summary: "Résumé de la carte",
  kind: "Famille",
  delivery: "Mode de remise",
  restrictedTo: "Pays",
  poster: "Affiche",
  cover: "Couverture",
  facts: "Pastilles",
  story: "Récit",
  highlights: "Ce que vous obtenez",
  contents: "Contenu détaillé",
  forWho: "Pour qui",
  notForWho: "Pour qui ce n'est pas",
  faq: "Questions fréquentes",
  testimonial: "Témoignage",
  seo: "Référencement",
  price: "Prix",
  compareAtPrice: "Prix barré",
  promoEndsAt: "Fin de l'offre",
  badge: "Mention",
  displayOrder: "Ordre",
  slug: "Adresse",
};

function collectErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

function summarize(errors: Record<string, string>) {
  const lines = Object.entries(errors).map(([path, message]) => {
    const [head, ...rest] = path.split(".");
    const label = FIELD_LABELS[head] ?? head;
    return `${label}${rest.length ? ` (${rest.join(" › ")})` : ""} : ${message}`;
  });
  return `Le produit n'est pas enregistré. À corriger : ${lines.slice(0, 5).join(" · ")}${lines.length > 5 ? " …" : ""}`;
}

function refreshCatalog(slug?: string) {
  updateTag(CATALOG_TAG);
  revalidatePath("/admin/produits");
  revalidatePath("/boutique", "layout");
  revalidatePath("/commande", "layout");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/admin/produits/${slug}`);
}

/** Colonnes miroir de la table `products` (utilisées par les commandes, les accès, l'espace client). */
function mirrorColumns(content: ReturnType<typeof productContentSchema.parse>) {
  return {
    name: content.name,
    shortDescription: content.summary,
    longDescription: content.story.join("\n\n"),
    contents: (content.contents ?? []).flatMap((group) =>
      group.items.map((item) => item.name),
    ),
    faq: content.faq.map(({ question, answer }) => ({ question, answer })),
    targetAudience: content.forWho,
  };
}

/**
 * Crée un produit (formulaire sans `existingSlug`) ou modifie un produit
 * existant du catalogue ou de l'administration. Tout est validé côté serveur
 * (prix entier, prix barré supérieur au prix, adresse unique, type réel de
 * l'image…) et journalisé avec le détail avant/après des champs commerciaux.
 */
export async function saveProductAction(
  _state: ProductSaveState,
  formData: FormData,
): Promise<ProductSaveState> {
  const admin = await requireAdmin();
  const existingSlug = String(formData.get("existingSlug") ?? "");
  const creating = existingSlug === "";

  // --- Adresse ---
  let slug = existingSlug;
  if (creating) {
    const parsedSlug = productSlugSchema.safeParse(formData.get("slug"));
    if (!parsedSlug.success) {
      const errors = {
        slug: parsedSlug.error.issues[0]?.message ?? "Adresse invalide.",
      };
      return { ok: false, message: summarize(errors), errors };
    }
    slug = parsedSlug.data;
    const taken =
      ALL_PRODUCTS.some((product) => product.slug === slug) ||
      (await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      }));
    if (taken) {
      const errors = {
        slug: "Cette adresse est déjà utilisée par un autre produit.",
      };
      return { ok: false, message: summarize(errors), errors };
    }
  } else {
    const known =
      (await getAllProducts()).some((p) => p.slug === slug) ||
      ALL_PRODUCTS.some((p) => p.slug === slug) ||
      (await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      }));
    if (!known) return { ok: false, message: "Produit introuvable." };
  }

  const current = await prisma.product.findUnique({ where: { slug } });
  const codeProduct = ALL_PRODUCTS.find((product) => product.slug === slug);

  // --- Affiche (facultative) ---
  const file = formData.get("poster");
  let posterUrl: string | null | undefined; // undefined = inchangée
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadProductImage(file, slug);
    if (!uploaded.ok) {
      const errors = { poster: uploaded.error };
      return { ok: false, message: summarize(errors), errors };
    }
    posterUrl = uploaded.url;
  } else if (formData.get("removePoster") === "on") {
    posterUrl = null;
  }
  const posterSrc =
    posterUrl === null
      ? undefined
      : (posterUrl ?? current?.posterUrl ?? codeProduct?.poster?.src);

  // --- Validation ---
  const values = readProductForm(formData);
  const contentResult = productContentSchema.safeParse(
    formToContent(values, posterSrc ? { src: posterSrc } : undefined),
  );
  const commercialResult = productCommercialSchema.safeParse({
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") ?? "",
    promoEndsAt: formData.get("promoEndsAt") ?? "",
    badge: formData.get("badge") ?? "",
    active: formData.get("active") === "on",
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  const errors = {
    ...(contentResult.success ? {} : collectErrors(contentResult.error.issues)),
    ...(commercialResult.success
      ? {}
      : collectErrors(commercialResult.error.issues)),
  };
  if (!contentResult.success || !commercialResult.success) {
    return { ok: false, message: summarize(errors), errors };
  }
  const content = contentResult.data;
  const commercial = commercialResult.data;

  // Un produit réservé à un pays doit avoir au moins une clé USB à livrer
  // ou un autre contenu cohérent : on n'impose rien, mais on prévient si
  // l'équipe retire la restriction d'une clé (elle deviendrait visible partout).
  const wasRestricted = Boolean(codeProduct?.restrictedTo?.length);
  const nowRestricted = Boolean(content.restrictedTo?.length);
  const restrictionLifted = wasRestricted && !nowRestricted;
  if (restrictionLifted && formData.get("confirmRestriction") !== "on") {
    const errors = {
      restrictedTo:
        "Vous retirez la restriction par pays d'une clé : elle deviendrait visible et achetable dans le monde entier. Cochez la confirmation pour continuer.",
    };
    return { ok: false, message: summarize(errors), errors };
  }

  const data: Prisma.ProductUncheckedCreateInput = {
    slug,
    ...mirrorColumns(content),
    price: commercial.price,
    compareAtPrice: commercial.compareAtPrice,
    promoEndsAt: commercial.promoEndsAt,
    badge: commercial.badge,
    active: commercial.active,
    displayOrder: commercial.displayOrder,
    source: current?.source ?? (codeProduct ? "CODE" : "ADMIN"),
    content: content as unknown as Prisma.InputJsonValue,
    posterUrl:
      posterUrl === undefined ? (current?.posterUrl ?? null) : posterUrl,
    adminEditedAt: new Date(),
    coverImageUrl: posterSrc ?? null,
  };

  const saved = await prisma.product.upsert({
    where: { slug },
    create: data,
    update: { ...data, slug: undefined },
  });

  await audit(
    admin,
    creating ? "product.create" : "product.update",
    "product",
    saved.id,
    `${creating ? "Produit créé" : "Produit modifié"} : ${content.name}`,
    current
      ? diff(
          {
            price: current.price,
            compareAtPrice: current.compareAtPrice,
            promoEndsAt: current.promoEndsAt?.toISOString() ?? null,
            badge: current.badge,
            active: current.active,
            name: current.name,
          },
          {
            price: saved.price,
            compareAtPrice: saved.compareAtPrice,
            promoEndsAt: saved.promoEndsAt?.toISOString() ?? null,
            badge: saved.badge,
            active: saved.active,
            name: saved.name,
          },
        )
      : { created: true },
  );

  refreshCatalog(slug);
  return {
    ok: true,
    message: creating
      ? "Produit créé. Il est en ligne si « Visible sur le site » est coché."
      : "Produit enregistré : la modification est déjà visible sur le site.",
    slug,
  };
}

/** Rend la main au code pour un produit du catalogue (annule les modifications de l'équipe). */
export async function restoreProductDefaultsAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");
  const row = await prisma.product.findUnique({ where: { slug } });
  if (!row) return fail("Produit introuvable.");
  if (row.source !== "CODE" || !ALL_PRODUCTS.some((p) => p.slug === slug)) {
    return fail(
      "Seul un produit du catalogue peut revenir à sa version d'origine.",
    );
  }
  const original = ALL_PRODUCTS.find((p) => p.slug === slug)!;
  await prisma.product.update({
    where: { slug },
    data: {
      content: Prisma.DbNull,
      adminEditedAt: null,
      price: original.price,
      compareAtPrice: original.compareAtPrice ?? null,
      promoEndsAt: null,
      badge: null,
      posterUrl: null,
      active: true,
      displayOrder: original.order,
    },
  });
  await audit(
    admin,
    "product.restore",
    "product",
    row.id,
    `Produit « ${row.name} » revenu à sa version d'origine : ${reason}`,
  );
  refreshCatalog(slug);
  // Recharge la page avec un nouvel éditeur (les champs reprennent les valeurs d'origine).
  redirect(`/admin/produits/${slug}?rev=${Date.now()}`);
}

/** Supprime un produit créé en administration, seulement s'il n'a jamais servi. */
export async function deleteProductAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const row = await prisma.product.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          orders: true,
          access: true,
          modules: true,
          testimonials: true,
        },
      },
    },
  });
  if (!row) return fail("Produit introuvable.");
  if (row.source !== "ADMIN") {
    return fail(
      "Un produit du catalogue ne se supprime pas : désactivez-le (décochez « Visible sur le site »).",
    );
  }
  const used =
    row._count.orders +
    row._count.access +
    row._count.modules +
    row._count.testimonials;
  if (used > 0) {
    return fail(
      "Ce produit a déjà des commandes, des accès, des contenus ou des témoignages : désactivez-le plutôt que de le supprimer.",
    );
  }
  await prisma.product.delete({ where: { slug } });
  await audit(
    admin,
    "product.delete",
    "product",
    row.id,
    `Produit supprimé : ${row.name}`,
  );
  refreshCatalog();
  return done("Produit supprimé.");
}

/** Visible / masqué, depuis la liste. */
export async function setProductActiveAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const active = formData.get("active") === "true";
  const product =
    (await getAllProducts()).find((p) => p.slug === slug) ??
    ALL_PRODUCTS.find((p) => p.slug === slug);
  const row = await prisma.product.findUnique({ where: { slug } });
  if (!product && !row) return fail("Produit introuvable.");

  if (row) {
    await prisma.product.update({
      where: { slug },
      data: { active, adminEditedAt: row.adminEditedAt ?? new Date() },
    });
  } else if (product) {
    const { ensureProductRow } = await import("@/lib/catalog/db-sync");
    const created = await ensureProductRow(slug);
    if (!created) return fail("Produit introuvable.");
    await prisma.product.update({
      where: { slug },
      data: { active, adminEditedAt: new Date() },
    });
  }
  await audit(
    admin,
    active ? "product.show" : "product.hide",
    "product",
    slug,
    `Produit ${slug} ${active ? "affiché" : "masqué"} sur le site`,
  );
  refreshCatalog(slug);
  return done(
    active ? "Produit visible sur le site." : "Produit masqué du site.",
  );
}
