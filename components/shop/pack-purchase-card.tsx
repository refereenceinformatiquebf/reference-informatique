import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon-by-key";
import { IconFleche } from "@/components/icons";
import { Price } from "@/components/shop/price";
import { fr } from "@/lib/typography";
import type { IconKey } from "@/lib/catalog/types";

/**
 * Carte d'achat de la page de vente du pack : le prix, UN bouton de commande
 * (id « hero-cta », surveillé par la barre d'achat mobile) et quelques lignes
 * de réassurance. Aucun bouton WhatsApp : le client est conduit au formulaire.
 */
export function PackPurchaseCard({
  price,
  orderHref,
  points,
}: {
  price: number;
  orderHref: string;
  points: { icon: IconKey; text: string }[];
}) {
  return (
    <div className="border-line bg-paper shadow-card rounded-xl border p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Price price={price} size="lg" />
        <span className="text-ink-faint text-sm">
          {fr("paiement unique · accès à vie")}
        </span>
      </div>

      <Button
        asChild
        size="lg"
        className="font-display mt-5 min-h-14 w-full text-base"
        id="hero-cta"
      >
        <Link href={orderHref}>
          Commander maintenant
          <IconFleche size={18} />
        </Link>
      </Button>

      <ul className="mt-5 grid gap-3.5 text-[0.9375rem] leading-relaxed">
        {points.map((point) => (
          <li key={point.text} className="flex items-start gap-2.5">
            <span className="text-brand-text mt-px shrink-0">
              <Icon name={point.icon} size={18} />
            </span>
            <span className="text-ink-soft min-w-0">{fr(point.text)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
