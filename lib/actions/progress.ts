"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";

export async function markLessonViewed(formData: FormData) {
  const profile = await requireProfile();
  const lessonId = String(formData.get("lessonId") ?? "");
  const productSlug = String(formData.get("productSlug") ?? "");

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true },
  });
  if (!lesson) return;

  const access = await prisma.access.findUnique({
    where: {
      profileId_productId: {
        profileId: profile.id,
        productId: lesson.module.productId,
      },
    },
  });
  if (!access) return;

  await prisma.progress.upsert({
    where: { profileId_lessonId: { profileId: profile.id, lessonId } },
    update: {},
    create: { profileId: profile.id, lessonId },
  });

  revalidatePath(`/espace-client/formations/${productSlug}`);
}
