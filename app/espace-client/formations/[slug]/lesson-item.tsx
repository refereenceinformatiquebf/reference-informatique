"use client";

import { useState } from "react";
import { IconVideo, IconPdf } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markLessonViewed } from "@/lib/actions/progress";

export function LessonItem({
  lesson,
  productSlug,
  isViewed,
}: {
  lesson: { id: string; title: string; type: "VIDEO" | "PDF" };
  productSlug: string;
  isViewed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const src = `/api/formations/${productSlug}/lecons/${lesson.id}`;

  return (
    <li className="border-line bg-paper rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-brand-50 text-brand-text flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]">
            {lesson.type === "VIDEO" ? (
              <IconVideo size={18} />
            ) : (
              <IconPdf size={18} />
            )}
          </span>
          <span className="text-ink text-sm font-medium">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {isViewed ? <Badge variant="success">Vu</Badge> : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Fermer" : lesson.type === "VIDEO" ? "Regarder" : "Ouvrir"}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="mt-4">
          {lesson.type === "VIDEO" ? (
            <video
              controls
              preload="metadata"
              src={src}
              className="bg-paper-raised w-full rounded-md"
            />
          ) : (
            <iframe
              src={src}
              title={lesson.title}
              className="h-[70vh] w-full rounded-md border-0"
            />
          )}

          {!isViewed ? (
            <form action={markLessonViewed} className="mt-3">
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="productSlug" value={productSlug} />
              <Button type="submit" size="sm" variant="ghost">
                Marquer comme vu
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
