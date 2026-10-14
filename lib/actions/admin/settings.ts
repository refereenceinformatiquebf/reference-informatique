"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import {
  SETTINGS_TAG,
  SETTING_KEYS,
  announcementSchema,
  isSafeBannerHref,
  legalSchema,
} from "@/lib/settings";

export type SettingsState =
  | { ok: boolean; message: string; errors?: Record<string, string[]> }
  | undefined;

async function store(key: string, value: Prisma.InputJsonValue, by: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value, updatedBy: by },
    update: { value, updatedBy: by },
  });
  updateTag(SETTINGS_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin/parametres");
}

export async function saveLegalSettingsAction(
  _state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const admin = await requireAdmin();
  const get = (name: string) => String(formData.get(name) ?? "");
  const parsed = legalSchema.safeParse({
    companyName: get("companyName"),
    legalForm: get("legalForm"),
    address: get("address"),
    registration: get("registration"),
    taxId: get("taxId"),
    publicationDirector: get("publicationDirector"),
    contactEmail: get("contactEmail"),
    hostName: get("hostName"),
    hostAddress: get("hostAddress"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez le formulaire.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  if (
    parsed.data.contactEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.contactEmail)
  ) {
    return {
      ok: false,
      message: "Adresse email invalide.",
      errors: { contactEmail: ["Adresse email invalide."] },
    };
  }
  await store(SETTING_KEYS.legal, parsed.data, admin.email ?? admin.name);
  await audit(
    admin,
    "setting.legal",
    "setting",
    SETTING_KEYS.legal,
    "Informations légales mises à jour",
  );
  revalidatePath("/mentions-legales");
  revalidatePath("/sitemap.xml");
  return { ok: true, message: "Informations enregistrées." };
}

export async function saveAnnouncementAction(
  _state: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const admin = await requireAdmin();
  const parsed = announcementSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    message: String(formData.get("message") ?? ""),
    linkLabel: String(formData.get("linkLabel") ?? ""),
    linkHref: String(formData.get("linkHref") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vérifiez le formulaire.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const value = parsed.data;
  if (value.enabled && !value.message) {
    return {
      ok: false,
      message: "Écrivez le message du bandeau, ou désactivez-le.",
      errors: { message: ["Message obligatoire."] },
    };
  }
  if (!isSafeBannerHref(value.linkHref)) {
    return {
      ok: false,
      message:
        "Le lien doit commencer par « / » (page du site) ou « https:// ».",
      errors: { linkHref: ["Lien non autorisé."] },
    };
  }
  if (value.linkHref && !value.linkLabel) {
    return {
      ok: false,
      message: "Indiquez le texte du lien.",
      errors: { linkLabel: ["Texte obligatoire."] },
    };
  }
  await store(SETTING_KEYS.announcement, value, admin.email ?? admin.name);
  await audit(
    admin,
    "setting.announcement",
    "setting",
    SETTING_KEYS.announcement,
    value.enabled ? "Bandeau d'annonce activé" : "Bandeau d'annonce désactivé",
  );
  return {
    ok: true,
    message: value.enabled
      ? "Bandeau publié sur le site."
      : "Bandeau désactivé.",
  };
}
