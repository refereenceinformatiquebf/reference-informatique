import Link from "next/link";
import type { Metadata } from "next";
import { Container, IconChip } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { IconWhatsapp } from "@/components/icons";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

/**
 * Page « introuvable » du site. Elle sert aussi pour un produit réservé à un
 * autre pays : le message ne dit rien de ce qui aurait pu s'y trouver.
 */
export default function NotFound() {
  return (
    <Container className="max-w-xl py-24 text-center sm:py-32">
      <IconChip name="recherche" size={64} className="mx-auto" />
      <h1 className="text-ink mt-6 text-[2rem] leading-tight sm:text-[2.5rem]">
        Cette page n&rsquo;existe pas
      </h1>
      <p className="text-ink-soft mt-3 text-[1rem] leading-relaxed">
        L&rsquo;adresse est peut-être mal écrite, ou la page a été déplacée.
        Retournez à l&rsquo;accueil, ou dites-nous ce que vous cherchez : nous
        vous répondons sur WhatsApp.
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Button asChild size="lg">
          <Link href="/">Retour à l&rsquo;accueil</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/boutique">Voir la boutique</Link>
        </Button>
        <Button asChild size="lg" variant="whatsapp">
          <a
            href={whatsappLink("Bonjour, je cherche une page de votre site.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsapp size={18} />
            Nous écrire
          </a>
        </Button>
      </div>
    </Container>
  );
}
