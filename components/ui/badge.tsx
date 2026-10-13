import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Badges et statuts de la charte : pilule, 11-12 px medium. */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] leading-none font-medium tracking-[0.02em] whitespace-nowrap",
  {
    variants: {
      variant: {
        /** Bleu : information, catégorie. */
        neutral: "bg-brand-50 text-brand-700",
        /** Marine plein : mise en avant forte (Populaire, Nouveau). */
        navy: "bg-brand-900 text-white",
        success: "bg-success-bg text-success-text",
        warning: "bg-warning-bg text-warning-text",
        danger: "bg-danger-bg text-danger-text",
        outline: "border-line-strong text-ink-soft border bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
