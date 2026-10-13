import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons/icon-by-key";
import { PRODUCT_KINDS } from "@/lib/catalog/kinds";
import type { CoverTone, Product } from "@/lib/catalog/types";

/**
 * Couverture générée d'un produit, à la charte : dégradé marine -> bleu uni
 * (la « zone d'illustration » de Boulga AI), titre en DM Serif Display. Elle remplace les visuels d'origine, qui avaient leur
 * propre style et des prix incrustés dans l'image (donc faux dès qu'un prix
 * change). Tout est en CSS : net à toute taille, aucun poids d'image.
 *
 * Les tailles de texte sont en `cqw` (unités de conteneur) : la couverture
 * se met à l'échelle seule, en carte comme en grande galerie.
 */

const GRADIENTS: Record<CoverTone, string> = {
  navy: "linear-gradient(150deg, #0b1f3a 0%, #0d4fa0 100%)",
  blue: "linear-gradient(150deg, #063a80 0%, #1565c0 100%)",
  deep: "linear-gradient(150deg, #032660 0%, #0b1f3a 100%)",
  sky: "linear-gradient(150deg, #0d4fa0 0%, #2a7bdc 100%)",
};

/** « Pack de Formations Complètes : Excel… » -> « Pack de Formations Complètes ». */
export function coverTitle(name: string) {
  return name.split(/\s*[:—]\s*/)[0];
}

export function ProductCover({
  product,
  className,
}: {
  product: Pick<Product, "name" | "kind" | "cover">;
  className?: string;
}) {
  const kind = PRODUCT_KINDS[product.kind];
  return (
    <div
      className={cn(
        "[container-type:inline-size] relative isolate aspect-[4/5] w-full overflow-hidden text-white",
        className,
      )}
      style={{ background: GRADIENTS[product.cover.tone] }}
    >
      {/* Motif du produit : grand, très discret */}
      <span
        aria-hidden
        className="absolute top-[14cqw] right-[8cqw] -z-10 text-white/[0.16]"
      >
        <Icon
          name={product.cover.motif}
          size={170}
          className="h-[46cqw] w-[46cqw]"
        />
      </span>

      <div className="absolute inset-0 flex flex-col justify-between p-[8cqw]">
        <span
          className="inline-flex w-fit items-center gap-[2cqw] rounded-full bg-white/14 px-[3.4cqw] py-[1.6cqw] font-medium tracking-[0.04em] ring-1 ring-white/20"
          style={{ fontSize: "3.6cqw" }}
        >
          <Icon name={kind.icon} size={16} className="h-[4.4cqw] w-[4.4cqw]" />
          {kind.label}
        </span>

        <div>
          <p
            className="font-display leading-[1.08] tracking-[-0.015em] text-balance"
            style={{ fontSize: "10.2cqw" }}
          >
            {coverTitle(product.name)}
          </p>
          <p
            className="mt-[4cqw] font-medium tracking-[0.15em] text-white/70 uppercase"
            style={{ fontSize: "2.9cqw" }}
          >
            Référence Informatique
          </p>
        </div>
      </div>
    </div>
  );
}
