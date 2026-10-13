import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { discountPercent } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";

/** Prix d'un produit : montant en DM Serif Display, prix de référence barré,
 * et pourcentage de remise quand il y en a une. */
export function Price({
  price,
  compareAtPrice,
  size = "md",
  showDiscount = false,
  className,
}: {
  price: number;
  compareAtPrice?: number;
  size?: "md" | "lg";
  showDiscount?: boolean;
  className?: string;
}) {
  const percent = discountPercent({ price, compareAtPrice });
  return (
    <div
      className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}
    >
      <span
        className={cn(
          "font-display text-ink tabular leading-none",
          size === "lg" ? "text-[2.25rem]" : "text-[1.5rem]",
        )}
      >
        {formatPrice(price)}
      </span>
      {compareAtPrice && percent ? (
        <>
          <span
            className={cn(
              "text-ink-faint tabular line-through",
              size === "lg" ? "text-base" : "text-sm",
            )}
          >
            <span className="sr-only">Prix habituel : </span>
            {formatPrice(compareAtPrice)}
          </span>
          {showDiscount ? (
            <Badge variant="navy">{`-${percent}\u00A0%`}</Badge>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
