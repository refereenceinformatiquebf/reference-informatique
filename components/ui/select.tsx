import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./input";

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
      className={cn(fieldClasses, "pr-9", className)}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";
