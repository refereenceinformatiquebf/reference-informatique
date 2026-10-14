"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container, IconChip } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { IconWhatsapp } from "@/components/icons";
import { whatsappLink } from "@/lib/site";

/**
 * Erreur inattendue dans une page : un message clair et un moyen de continuer,
 * jamais un écran technique. Le détail reste dans les journaux du serveur.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[page] erreur :", error.digest ?? error.message);
  }, [error]);

  return (
    <Container className="max-w-xl py-24 text-center sm:py-32">
      <IconChip name="actualisation" size={64} className="mx-auto" />
      <h1 className="text-ink mt-6 text-[2rem] leading-tight sm:text-[2.5rem]">
        Un incident est survenu
      </h1>
      <p className="text-ink-soft mt-3 text-[1rem] leading-relaxed">
        Ce n&rsquo;est pas de votre faute. Réessayez dans un instant ; si le
        problème continue, écrivez-nous sur WhatsApp et nous vous aidons tout de
        suite.
      </p>
      {error.digest ? (
        <p className="text-ink-faint mt-2 text-xs">
          Référence : {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Button size="lg" onClick={() => reset()}>
          Réessayer
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Retour à l&rsquo;accueil</Link>
        </Button>
        <Button asChild size="lg" variant="whatsapp">
          <a
            href={whatsappLink(
              `Bonjour, une page de votre site affiche une erreur${error.digest ? ` (référence ${error.digest})` : ""}.`,
            )}
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
