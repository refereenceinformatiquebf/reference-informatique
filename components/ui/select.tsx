import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * <select> natif stylé, pas un composant Radix : pour une liste déroulante
 * simple (tranche de budget, statut...), le natif est plus léger, accessible
 * par défaut, et se comporte correctement sur mobile — pas besoin de plus.
 */
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "border-line focus:border-brand bg-paper w-full rounded-md border px-3 py-2 text-sm outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";
