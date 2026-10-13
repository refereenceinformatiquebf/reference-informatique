import Link from "next/link";
import { Card } from "@/components/ui/card";
import { IconFleche } from "@/components/icons";
import { formatServicePrice } from "@/lib/format";
import type { Service } from "@/lib/catalog/types";

/** Carte d'une prestation : nom, résumé, prix d'entrée et lien vers la fiche. */
export function ServiceCard({
  service,
  index = 0,
}: {
  service: Service;
  index?: number;
}) {
  return (
    <Link
      href={`/services/${service.family}/${service.slug}`}
      className="rise-in group block h-full"
      style={{ "--i": Math.min(index, 8) } as React.CSSProperties}
    >
      <Card interactive className="flex h-full flex-col gap-4 p-6">
        <div>
          <h3 className="font-display text-ink text-[1.375rem] leading-tight">
            {service.name}
          </h3>
          <p className="text-ink-soft mt-2.5 text-[0.9375rem] leading-relaxed">
            {service.summary}
          </p>
        </div>
        <div className="border-line mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <span className="text-ink tabular text-sm font-medium">
            {formatServicePrice(service)}
          </span>
          <span className="text-brand-text flex shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap">
            Voir le détail
            <IconFleche
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        </div>
      </Card>
    </Link>
  );
}
