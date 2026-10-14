"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { TESTIMONIALS_TAG } from "@/lib/testimonials";

const UUID = /^[0-9a-f-]{36}$/i;

function refresh() {
  updateTag(TESTIMONIALS_TAG);
  revalidatePath("/admin/temoignages");
  revalidatePath("/");
}

const schema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, { error: "Indiquez le nom du client." })
    .max(80),
  authorCity: z.string().trim().max(60).optional(),
  quote: z
    .string()
    .trim()
    .min(10, { error: "Le message est trop court." })
    .max(800, { error: "800 caractères maximum." }),
  rating: z.coerce.number().int().min(1).max(5),
  displayOrder: z.coerce.number().int().min(0).max(1000),
  productSlug: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
  consent: z.literal(true, {
    error:
      "Confirmez que ce message est authentique et que le client accepte sa publication.",
  }),
});

export type TestimonialState =
  | { ok: boolean; message: string; errors?: Record<string, string[]> }
  | undefined;

/**
 * Crée ou modifie un témoignage. Le site présente ces messages comme « des
 * messages reçus de clients, publiés tels quels » : la case de confirmation
 * (authenticité + accord du client) est donc obligatoire.
 */
export async function saveTestimonialAction(
  _state: TestimonialState,
  formData: FormData,
): Promise<TestimonialState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({
    authorName: formData.get("authorName"),
    authorCity: formData.get("authorCity") || undefined,
    quote: formData.get("quote"),
    rating: formData.get("rating") ?? 5,
    displayOrder: formData.get("displayOrder") ?? 0,
    productSlug: formData.get("productSlug") || undefined,
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    consent: formData.get("consent") === "on",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez le formulaire.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  let productId: string | null = null;
  if (data.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: data.productSlug },
      select: { id: true },
    });
    if (!product) {
      return {
        ok: false,
        message:
          "Ce produit n'existe pas encore en base : ouvrez sa fiche une fois dans « Produits », puis réessayez.",
      };
    }
    productId = product.id;
  }

  const values = {
    authorName: data.authorName,
    authorCity: data.authorCity || null,
    quote: data.quote,
    rating: data.rating,
    displayOrder: data.displayOrder,
    published: data.published,
    featured: data.featured,
    productId,
  };

  if (id) {
    if (!UUID.test(id))
      return { ok: false, message: "Témoignage introuvable." };
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return { ok: false, message: "Témoignage introuvable." };
    await prisma.testimonial.update({ where: { id }, data: values });
    await audit(
      admin,
      "testimonial.update",
      "testimonial",
      id,
      `Témoignage de ${data.authorName} modifié`,
    );
  } else {
    const created = await prisma.testimonial.create({ data: values });
    await audit(
      admin,
      "testimonial.create",
      "testimonial",
      created.id,
      `Témoignage de ${data.authorName} créé`,
    );
  }
  refresh();
  return {
    ok: true,
    message: id ? "Témoignage enregistré." : "Témoignage ajouté.",
  };
}

export async function toggleTestimonialPublishedAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  if (!UUID.test(id)) return fail("Témoignage introuvable.");
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return fail("Témoignage introuvable.");
  await prisma.testimonial.update({ where: { id }, data: { published } });
  await audit(
    admin,
    published ? "testimonial.publish" : "testimonial.unpublish",
    "testimonial",
    id,
    `Témoignage de ${existing.authorName} ${published ? "publié" : "dépublié"}`,
  );
  refresh();
  return done(published ? "Publié sur le site." : "Retiré du site.");
}

export async function deleteTestimonialAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return fail("Témoignage introuvable.");
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) return fail("Témoignage introuvable.");
  await prisma.testimonial.delete({ where: { id } });
  await audit(
    admin,
    "testimonial.delete",
    "testimonial",
    id,
    `Témoignage de ${existing.authorName} supprimé`,
  );
  refresh();
  return done("Témoignage supprimé.");
}
