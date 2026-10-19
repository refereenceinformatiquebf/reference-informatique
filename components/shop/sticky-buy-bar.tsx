"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Barre d'achat collée en bas de l'écran : le bouton de commande reste à
 * portée de pouce pendant toute la lecture. Elle s'efface tant qu'un des
 * boutons de la page (repérés par leur id) est déjà à l'écran, pour ne jamais
 * doubler le même appel à l'action.
 */
export function StickyBuyBar({
  href,
  label,
  name,
  price,
  hideWhileVisible,
}: {
  href: string;
  label: string;
  name: string;
  price: string;
  hideWhileVisible: string[];
}) {
  // null tant que l'état n'est pas connu : la barre reste cachée, sans clignoter.
  const [inView, setInView] = useState<number | null>(null);
  const watched = hideWhileVisible.join(",");

  useEffect(() => {
    const elements = watched
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setInView(0));
      return () => cancelAnimationFrame(frame);
    }
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setInView(visible.size);
    });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [watched]);

  const show = inView === 0;

  return (
    <div
      inert={!show}
      className={cn(
        "border-line bg-paper/95 supports-[backdrop-filter]:bg-paper/85 fixed inset-x-0 bottom-0 z-40 border-t p-3 backdrop-blur transition-transform duration-200 motion-reduce:transition-none",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-ink-soft truncate text-xs">{name}</p>
          <p className="font-display text-ink tabular text-[1.375rem] leading-tight">
            {price}
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={href}>{label}</Link>
        </Button>
      </div>
    </div>
  );
}
