import "server-only";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";

/** Bucket public de la plateforme (images produits). Voir supabase/migrations/0002. */
const MEDIA_BUCKET = "medias";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/**
 * Type RÉEL d'une image d'après ses premiers octets : le type annoncé par le
 * navigateur (et l'extension du fichier) ne prouvent rien.
 */
export function detectImageType(
  bytes: Uint8Array,
): "jpeg" | "png" | "webp" | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export type UploadResult =
  { ok: true; url: string } | { ok: false; error: string };

/**
 * Envoie une affiche de produit : contrôle du type réel, taille maximale,
 * redimensionnement (1200 px de large au plus) et conversion en WebP, sans
 * métadonnées (position GPS, appareil…). Le nom du fichier est généré : rien
 * de ce qu'a saisi l'utilisateur n'entre dans le chemin.
 */
export async function uploadProductImage(
  file: File,
  slug: string,
): Promise<UploadResult> {
  if (file.size === 0) return { ok: false, error: "Le fichier est vide." };
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image trop lourde (4 Mo maximum)." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!detectImageType(bytes)) {
    return {
      ok: false,
      error: "Format non reconnu : utilisez une image JPEG, PNG ou WebP.",
    };
  }

  let output: Buffer;
  try {
    output = await sharp(bytes)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { ok: false, error: "Cette image est illisible ou corrompue." };
  }

  const safeSlug = slug.replace(/[^a-z0-9-]/g, "").slice(0, 60) || "produit";
  const path = `produits/${safeSlug}-${Date.now()}.webp`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, output, { contentType: "image/webp", upsert: false });
  if (error) {
    console.error("[uploads] envoi impossible :", error.message);
    return { ok: false, error: "L'envoi de l'image a échoué. Réessayez." };
  }
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
