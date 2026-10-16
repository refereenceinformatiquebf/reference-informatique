import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { discountPercent, type Product } from "@/lib/catalog";
import { productPath } from "@/lib/catalog/paths";
import { Badge } from "@/components/ui/badge";
import { IconFleche } from "@/components/icons";
import { ProductCover, coverTitle } from "./product-cover";
import { Price } from "./price";

/**
 * Carte produit (composant signature de la boutique) : visuel 4:5, famille,
 * titre sur deux lignes, résumé, prix et appel à l'action. Toute la carte est
 * un lien vers la fiche.
 *
 * Le visuel est l'affiche réelle quand elle existe (clés de formations), la
 * couverture générée à la charte sinon.
 */
export function ProductCard({
  product,
  index = 0,
  priority = false,
  className,
}: {
  product: Product;
  /** Rang dans la grille : décale l'apparition (60 ms par carte). */
  index?: number;
  priority?: boolean;
  className?: string;
}) {
  const percent = discountPercent(product);

  return (
    <Link
      href={productPath(product.slug)}
      className={cn(
        "rise-in group border-line bg-paper hover:border-line-strong hover:shadow-lift flex h-full flex-col overflow-hidden rounded-lg border transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-standard)] hover:-translate-y-1 focus-visible:shadow-[var(--focus-halo)] focus-visible:outline-none",
        className,
      )}
      style={{ "--i": Math.min(index, 8) } as React.CSSProperties}
    >
      <div className="bg-paper-raised relative">
        {product.poster ? (
          <div className="relative aspect-[4/5] w-full">
            <Image
              src={product.poster.src}
              alt={product.poster.alt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 92vw"
              className="object-contain"
            />
          </div>
        ) : (
          <ProductCover product={product} />
        )}

        {/* La remise se pose sur la couverture générée ; sur une affiche, qui
            est déjà pleine de texte, elle passe dans le corps de la carte. */}
        {!product.poster && percent ? (
          <Badge
            variant="navy"
            className="absolute top-3 right-3 shadow-sm"
          >{`-${percent} %`}</Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {product.badge || (product.poster && percent) ? (
          <div className="flex flex-wrap items-center gap-2">
            {product.badge ? (
              <Badge variant="success">{product.badge}</Badge>
            ) : null}
            {product.poster && percent ? (
              <Badge variant="navy">{`-${percent} %`}</Badge>
            ) : null}
          </div>
        ) : null}
        <h3 className="font-display text-ink line-clamp-2 min-h-[2.4em] text-[1.25rem] leading-[1.2]">
          {coverTitle(product.name)}
        </h3>
        <p className="text-ink-soft line-clamp-4 text-[0.9375rem] leading-relaxed">
          {product.summary}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
          />
          <span
            aria-hidden
            className="text-brand-text bg-brand-50 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <IconFleche size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
