"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureProductRow } from "@/lib/catalog/db-sync";

const BUCKET = "formations";
/** Plafond du plan gratuit de Supabase Storage : au-delà, l'envoi serait refusé. */
const MAX_LESSON_BYTES = 50 * 1024 * 1024;

const EXTENSIONS = {
  PDF: ["pdf"],
  VIDEO: ["mp4", "webm"],
} as const;

const UUID = /^[0-9a-f-]{36}$/i;

function refresh(slug: string) {
  revalidatePath(`/admin/produits/${slug}`);
  revalidatePath(`/espace-client/formations/${slug}`);
}

const prepareSchema = z.object({
  productSlug: z.string().min(1),
  fileName: z.string().min(1).max(200),
  size: z.number().int().positive(),
  type: z.enum(["PDF", "VIDEO"]),
});

export type PrepareUploadResult =
  { ok: true; path: string; token: string } | { ok: false; message: string };

/**
 * Étape 1 : prépare un envoi direct vers le stockage privé. Le fichier ne
 * passe pas par ce serveur (limite de taille des actions) : le navigateur
 * l'envoie lui-même, avec un jeton valable pour CE chemin uniquement.
 */
export async function prepareLessonUploadAction(
  input: z.infer<typeof prepareSchema>,
): Promise<PrepareUploadResult> {
  await requireAdmin();
  const parsed = prepareSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Demande invalide." };
  const { productSlug, fileName, size, type } = parsed.data;

  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!(EXTENSIONS[type] as readonly string[]).includes(extension)) {
    return {
      ok: false,
      message:
        type === "PDF"
          ? "Un livre doit être un fichier PDF."
          : "Une vidéo doit être au format MP4 ou WebM.",
    };
  }
  if (size > MAX_LESSON_BYTES) {
    return {
      ok: false,
      message: `Fichier trop lourd (${Math.round(size / 1024 / 1024)} Mo). Maximum : 50 Mo.`,
    };
  }
  const product = await ensureProductRow(productSlug);
  if (!product) return { ok: false, message: "Produit introuvable." };

  const path = `${product.id}/contenu/${randomUUID()}.${extension}`;
  const { data, error } = await createAdminClient()
    .storage.from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    console.error("[lessons] jeton d'envoi impossible :", error?.message);
    return { ok: false, message: "Impossible de préparer l'envoi. Réessayez." };
  }
  return { ok: true, path, token: data.token };
}

const saveSchema = z.object({
  productSlug: z.string().min(1),
  title: z.string().trim().min(3, { error: "Donnez un titre." }).max(160),
  type: z.enum(["PDF", "VIDEO"]),
  path: z.string().min(10).max(300),
  moduleId: z.string().optional(),
  newModuleTitle: z.string().trim().max(120).optional(),
});

/** Premiers octets du fichier envoyé : le type annoncé ne prouve rien. */
async function sniffFile(path: string, type: "PDF" | "VIDEO") {
  const { data } = await createAdminClient()
    .storage.from(BUCKET)
    .createSignedUrl(path, 60);
  if (!data) return false;
  const response = await fetch(data.signedUrl, {
    headers: { Range: "bytes=0-15" },
    cache: "no-store",
  });
  if (!response.ok && response.status !== 206) return false;
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (type === "PDF") {
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  const mp4 = String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  const webm =
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3;
  return mp4 || webm;
}

/** Étape 2 : le fichier est envoyé, on le contrôle puis on crée la leçon. */
export async function saveLessonAction(
  input: z.infer<typeof saveSchema>,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Demande invalide.");
  }
  const data = parsed.data;
  const product = await ensureProductRow(data.productSlug);
  if (!product) return fail("Produit introuvable.");

  // Le chemin doit appartenir à CE produit : on n'accepte jamais un chemin libre.
  if (!data.path.startsWith(`${product.id}/contenu/`)) {
    return fail("Chemin de fichier non autorisé.");
  }
  const storage = createAdminClient().storage.from(BUCKET);
  const removeFile = () => storage.remove([data.path]);

  if (!(await sniffFile(data.path, data.type))) {
    await removeFile();
    return fail(
      data.type === "PDF"
        ? "Ce fichier n'est pas un vrai PDF : il a été refusé et supprimé."
        : "Ce fichier n'est pas une vraie vidéo MP4 ou WebM : il a été refusé et supprimé.",
    );
  }

  let moduleId =
    data.moduleId && UUID.test(data.moduleId) ? data.moduleId : undefined;
  if (moduleId) {
    const existing = await prisma.module.findFirst({
      where: { id: moduleId, productId: product.id },
    });
    if (!existing) moduleId = undefined;
  }
  if (!moduleId) {
    const order = await prisma.module.count({
      where: { productId: product.id },
    });
    const created = await prisma.module.create({
      data: {
        productId: product.id,
        title: data.newModuleTitle || "Votre contenu",
        displayOrder: order,
      },
    });
    moduleId = created.id;
  }
  const lessonOrder = await prisma.lesson.count({ where: { moduleId } });
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      type: data.type,
      storagePath: data.path,
      displayOrder: lessonOrder,
    },
  });
  await audit(
    admin,
    "lesson.create",
    "product",
    product.id,
    `Contenu ajouté à « ${product.name} » : ${data.title}`,
    {
      lessonId: lesson.id,
      type: data.type,
    },
  );
  refresh(data.productSlug);
  return done(
    "Contenu ajouté : les clients ayant accès le voient tout de suite.",
  );
}

/** Supprime une leçon et son fichier. Les clients perdent l'accès à ce contenu. */
export async function deleteLessonAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("lessonId") ?? "");
  if (!UUID.test(id)) return fail("Contenu introuvable.");
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { include: { product: true } } },
  });
  if (!lesson) return fail("Contenu introuvable.");

  await prisma.progress.deleteMany({ where: { lessonId: id } });
  await prisma.lesson.delete({ where: { id } });
  // Le fichier n'est supprimé que s'il n'est plus utilisé ailleurs.
  const stillUsed = await prisma.lesson.count({
    where: { storagePath: lesson.storagePath },
  });
  if (stillUsed === 0) {
    await createAdminClient().storage.from(BUCKET).remove([lesson.storagePath]);
  }
  // Un module vide n'a plus lieu d'être.
  const left = await prisma.lesson.count({
    where: { moduleId: lesson.moduleId },
  });
  if (left === 0)
    await prisma.module.delete({ where: { id: lesson.moduleId } });

  await audit(
    admin,
    "lesson.delete",
    "product",
    lesson.module.productId,
    `Contenu supprimé de « ${lesson.module.product.name} » : ${lesson.title}`,
  );
  refresh(lesson.module.product.slug);
  return done("Contenu supprimé.");
}
