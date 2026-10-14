"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit, diff } from "@/lib/admin/audit";
import { ALL_SERVICES } from "@/lib/catalog";
import { CATALOG_TAG } from "@/lib/catalog/live";
import { ensureServiceRow } from "@/lib/catalog/db-sync";
import { serviceFormSchema } from "@/lib/catalog/service-schema";

export type ServiceSaveState =
  | { ok: boolean; message: string; errors?: Record<string, string[]> }
  | undefined;

/**
 * Modifie un service. Les prix et les textes de cette page s'appliquent tout
 * de suite sur le site et dans le formulaire de devis ; le détail des pages
 * de service (étapes, questions) reste écrit dans le catalogue du site.
 */
export async function saveServiceAction(
  _state: ServiceSaveState,
  formData: FormData,
): Promise<ServiceSaveState> {
  const admin = await requireAdmin();
  const parsed = serviceFormSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    summary: formData.get("summary"),
    tagline: formData.get("tagline"),
    priceType: formData.get("priceType"),
    priceFrom: formData.get("priceFrom") ?? "",
    priceNote: formData.get("priceNote"),
    timeline: formData.get("timeline"),
    active: formData.get("active") === "on",
    displayOrder: formData.get("displayOrder") ?? 0,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez le formulaire.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;
  if (!ALL_SERVICES.some((service) => service.slug === data.slug)) {
    return { ok: false, message: "Service introuvable." };
  }

  const row = await ensureServiceRow(data.slug);
  if (!row) return { ok: false, message: "Service introuvable." };

  const updated = await prisma.service.update({
    where: { slug: data.slug },
    data: {
      name: data.name,
      description: data.summary,
      tagline: data.tagline,
      priceType: data.priceType,
      priceFrom: data.priceType === "QUOTE" ? null : data.priceFrom,
      priceNote: data.priceNote,
      timeline: data.timeline,
      active: data.active,
      displayOrder: data.displayOrder,
      adminEditedAt: new Date(),
    },
  });

  await audit(
    admin,
    "service.update",
    "service",
    updated.id,
    `Service modifié : ${updated.name}`,
    diff(
      {
        name: row.name,
        priceType: row.priceType,
        priceFrom: row.priceFrom,
        active: row.active,
      },
      {
        name: updated.name,
        priceType: updated.priceType,
        priceFrom: updated.priceFrom,
        active: updated.active,
      },
    ),
  );

  updateTag(CATALOG_TAG);
  // Les pages de services sont générées à l'avance : on les invalide par motif de page.
  revalidatePath("/services", "page");
  revalidatePath("/services/[categorie]", "page");
  revalidatePath("/services/[categorie]/[service]", "page");
  revalidatePath("/contact");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/services");
  return { ok: true, message: "Service enregistré : visible sur le site." };
}
