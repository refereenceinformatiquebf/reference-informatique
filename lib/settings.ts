import "server-only";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

/**
 * Réglages modifiables depuis l'administration (table site_settings) :
 * informations légales de l'entreprise et bandeau d'annonce. Aucune valeur
 * n'est inventée : tant qu'un champ n'est pas renseigné, il est absent.
 */

export const SETTINGS_TAG = "site-settings";

export const legalSchema = z.object({
  companyName: z.string().trim().max(120).default(""),
  legalForm: z.string().trim().max(80).default(""),
  address: z.string().trim().max(300).default(""),
  registration: z.string().trim().max(160).default(""),
  taxId: z.string().trim().max(80).default(""),
  publicationDirector: z.string().trim().max(120).default(""),
  contactEmail: z.string().trim().max(120).default(""),
  hostName: z.string().trim().max(200).default(""),
  hostAddress: z.string().trim().max(300).default(""),
});
export type LegalSettings = z.infer<typeof legalSchema>;

export const announcementSchema = z.object({
  enabled: z.boolean().default(false),
  message: z.string().trim().max(160).default(""),
  linkLabel: z.string().trim().max(40).default(""),
  linkHref: z.string().trim().max(200).default(""),
});
export type AnnouncementSettings = z.infer<typeof announcementSchema>;

export const SETTING_KEYS = {
  legal: "legal",
  announcement: "announcement",
} as const;

const readRaw = unstable_cache(
  async (key: string): Promise<unknown> => {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? null;
  },
  ["site-setting-v1"],
  { tags: [SETTINGS_TAG], revalidate: 300 },
);

async function read(key: string): Promise<unknown> {
  if (process.env.CATALOG_SKIP_DB === "1") return null;
  try {
    return await readRaw(key);
  } catch (error) {
    console.error(`[settings] lecture de « ${key} » impossible :`, error);
    return null;
  }
}

export async function getLegalSettings(): Promise<LegalSettings> {
  return legalSchema.parse((await read(SETTING_KEYS.legal)) ?? {});
}

/** Les informations indispensables sont-elles renseignées ? Sinon la page
 * « Mentions légales » n'est pas publiée (elle ne montre jamais de blancs). */
export function isLegalComplete(legal: LegalSettings) {
  return Boolean(legal.companyName && legal.address && legal.contactEmail);
}

/** Lien du bandeau : relatif au site, ou une adresse https. Jamais javascript:. */
export function isSafeBannerHref(href: string) {
  return (
    href === "" ||
    (href.startsWith("/") && !href.startsWith("//")) ||
    /^https:\/\/[^\s]+$/.test(href)
  );
}

export async function getAnnouncement(): Promise<AnnouncementSettings | null> {
  const parsed = announcementSchema.safeParse(
    (await read(SETTING_KEYS.announcement)) ?? {},
  );
  if (!parsed.success) return null;
  const value = parsed.data;
  if (!value.enabled || !value.message) return null;
  if (!isSafeBannerHref(value.linkHref))
    return { ...value, linkHref: "", linkLabel: "" };
  return value;
}
