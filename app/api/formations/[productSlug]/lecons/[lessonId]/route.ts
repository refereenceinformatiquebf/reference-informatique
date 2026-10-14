import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getCurrentProfile } from "@/lib/auth/dal";
import { createSignedLessonUrl } from "@/lib/storage";

/**
 * Sert le contenu d'une leçon (vidéo/PDF) par redirection vers une URL
 * signée à durée limitée — jamais d'URL de fichier stockée en clair côté
 * client. Vérifie explicitement un Access réel avant de générer quoi que
 * ce soit (voir PLAYBOOK-CONSTRUCTION.md, Étape 15).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productSlug: string; lessonId: string }> },
) {
  const { productSlug, lessonId } = await params;

  // Un identifiant qui n'est pas un UUID ne peut correspondre à aucune leçon :
  // 404 tout de suite, sans interroger la base (qui répondrait par une erreur).
  if (!/^[0-9a-f-]{36}$/i.test(lessonId)) {
    return NextResponse.json({ error: "Leçon introuvable." }, { status: 404 });
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { product: true } } },
  });

  if (!lesson || lesson.module.product.slug !== productSlug) {
    return NextResponse.json({ error: "Leçon introuvable." }, { status: 404 });
  }

  const access = await prisma.access.findUnique({
    where: {
      profileId_productId: {
        profileId: profile.id,
        productId: lesson.module.productId,
      },
    },
  });

  if (!access) {
    return NextResponse.json(
      { error: "Accès non autorisé à cette formation." },
      { status: 403 },
    );
  }

  const signedUrl = await createSignedLessonUrl(lesson.storagePath);
  return NextResponse.redirect(signedUrl);
}
