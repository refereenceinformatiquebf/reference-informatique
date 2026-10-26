import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconFleche } from "@/components/icons";
import { Price } from "@/components/shop/price";
import { fr } from "@/lib/typography";

/**
 * Carte d'achat de la page de vente du pack : le prix et UN bouton de commande
 * (id « hero-cta », surveillé par la barre d'achat mobile). Aucun bouton
 * WhatsApp : le client est conduit au formulaire.
 */
export function PackPurchaseCard({
  price,
  orderHref,
}: {
  price: number;
  orderHref: string;
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
    </div>
  );
}
