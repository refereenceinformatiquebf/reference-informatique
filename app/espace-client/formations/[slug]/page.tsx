import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { LessonItem } from "./lesson-item";

export const metadata: Metadata = { title: "Ma formation" };
export const dynamic = "force-dynamic";

export default async function FormationPlayerPage({
  params,
}: PageProps<"/espace-client/formations/[slug]">) {
  const { slug } = await params;
  const profile = await requireProfile();

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const access = await prisma.access.findUnique({
    where: {
      profileId_productId: { profileId: profile.id, productId: product.id },
    },
  });

  if (!access) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-ink text-lg font-bold">Accès non autorisé</h1>
        <p className="text-ink-soft mt-2 text-sm">
          Vous n&apos;avez pas (ou plus) accès à cette formation.
        </p>
        <Link
          href="/boutique"
          className="text-brand mt-4 inline-block text-sm font-semibold hover:underline"
        >
          Voir la boutique →
        </Link>
      </div>
    );
  }

  const modules = await prisma.module.findMany({
    where: { productId: product.id },
    include: { lessons: { orderBy: { displayOrder: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });

  const progress = await prisma.progress.findMany({
    where: {
      profileId: profile.id,
      lesson: { module: { productId: product.id } },
    },
    select: { lessonId: true },
  });
  const viewedLessonIds = new Set(progress.map((p) => p.lessonId));

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const viewedCount = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => viewedLessonIds.has(l.id)).length,
    0,
  );
  const percent =
    totalLessons > 0 ? Math.round((viewedCount / totalLessons) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href="/espace-client"
        className="text-ink-soft text-xs hover:underline"
      >
        ← Mon espace
      </Link>
      <h1 className="text-ink mt-2 text-xl font-bold">{product.name}</h1>

      <div className="mt-4">
        <div className="bg-paper-raised h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-brand h-full rounded-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-ink-faint mt-1.5 text-xs">
          {viewedCount} / {totalLessons} leçons vues ({percent}%)
        </p>
      </div>

      {modules.length === 0 ? (
        <p className="text-ink-soft mt-8 text-sm">
          Le contenu de cette formation est en cours d&apos;ajout.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          {modules.map((module) => (
            <div key={module.id}>
              <h2 className="text-ink mb-3 text-sm font-bold">
                {module.title}
              </h2>
              <ul className="flex flex-col gap-2">
                {module.lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    productSlug={product.slug}
                    isViewed={viewedLessonIds.has(lesson.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
