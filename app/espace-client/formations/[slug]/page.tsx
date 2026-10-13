import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma/client";
import { requireProfile } from "@/lib/auth/dal";
import { getProduct } from "@/lib/catalog/live";
import { Button } from "@/components/ui/button";
import { Container, IconChip } from "@/components/ui/section";
import { IconWhatsapp } from "@/components/icons";
import { SITE, whatsappLink } from "@/lib/site";
import { fr } from "@/lib/typography";
import { LessonItem } from "./lesson-item";

export const metadata: Metadata = {
  title: "Ma formation",
  robots: { index: false, follow: false },
};
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
      <Container className="max-w-md py-24 text-center">
        <IconChip name="cadenas" size={56} className="mx-auto" />
        <h1 className="text-ink mt-5 text-[1.75rem] leading-tight">
          Accès non autorisé
        </h1>
        <p className="text-ink-soft mt-3 text-[0.9375rem] leading-relaxed">
          Vous n&rsquo;avez pas (ou plus) accès à cette formation. Si vous venez
          de payer, patientez quelques instants puis actualisez la page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/boutique">Voir la boutique</Link>
        </Button>
      </Container>
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

  // Message d'attente adapté à la façon dont ce produit est remis.
  const delivery = (await getProduct(product.slug))?.delivery;
  const emptyMessage =
    delivery === "manuel"
      ? "Notre équipe vous contacte sur WhatsApp pour vous remettre votre accès. Si vous n'avez pas été contacté, écrivez-nous."
      : delivery === "cle-physique"
        ? "Votre clé USB vous est livrée gratuitement sous 24 à 48 h. Le contenu en ligne s'affichera ici dès sa mise en place."
        : "Le contenu de ce produit est en cours de mise en place. Si vous ne le voyez pas sous peu, écrivez-nous : nous vous le remettons.";

  return (
    <div className="py-10 sm:py-14">
      <Container className="max-w-3xl">
        <Link
          href="/espace-client"
          className="text-ink-faint hover:text-brand-text text-sm transition-colors"
        >
          ← Mon espace
        </Link>
        <h1 className="text-ink mt-3 text-[1.875rem] leading-[1.1] sm:text-[2.25rem]">
          {product.name}
        </h1>

        {totalLessons > 0 ? (
          <div className="border-line bg-paper mt-6 rounded-lg border p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-ink text-sm font-medium">Votre progression</p>
              <p className="text-ink-soft tabular text-sm">
                {viewedCount} / {totalLessons} leçons vues ({percent}&nbsp;%)
              </p>
            </div>
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progression dans la formation"
              className="bg-paper-raised mt-3 h-2.5 w-full overflow-hidden rounded-full"
            >
              <div
                className="bg-brand h-full rounded-full transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : null}

        {modules.length === 0 ? (
          <div className="border-line bg-paper mt-8 flex flex-col items-start gap-4 rounded-lg border p-6">
            <p className="text-ink-soft text-[0.9375rem] leading-relaxed">
              {fr(emptyMessage)}
            </p>
            <Button asChild variant="whatsapp">
              <a
                href={whatsappLink(
                  `Bonjour, je viens d'acheter « ${product.name} » et j'aimerais accéder à mon contenu.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsapp size={18} />
                Nous écrire sur WhatsApp
              </a>
            </Button>
            <p className="text-ink-faint text-xs">{SITE.phoneDisplay}</p>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-8">
            {modules.map((module) => (
              <section key={module.id}>
                <h2 className="font-display text-ink mb-3 text-[1.375rem] leading-tight">
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
              </section>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
