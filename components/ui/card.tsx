import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Carte de la charte : surface blanche, bordure fine, rayon 12 px. Avec
 * `interactive`, elle se soulève au survol (translateY -2 px + ombre).
 */
export function Card({
  className,
  interactive,
  ...props
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "border-line bg-paper rounded-lg border p-6",
        interactive &&
          "hover:border-line-strong hover:shadow-lift transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-standard)] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}
