import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ConfirmForm } from "./confirm-form";

export const metadata: Metadata = {
  title: "Confirmer",
  robots: { index: false, follow: false },
  // Le jeton est dans l'adresse : on évite qu'elle soit transmise à un site tiers.
  referrer: "no-referrer",
};

const COPY = {
  signup: {
    title: "Confirmer mon adresse",
    lead: "Une dernière étape : un clic pour activer votre compte.",
    button: "Confirmer et accéder à mon espace",
  },
  magiclink: {
    title: "Se connecter",
    lead: "Un clic suffit pour accéder à votre espace.",
    button: "Accéder à mon espace",
  },
  recovery: {
    title: "Nouveau mot de passe",
    lead: "Un clic, puis vous choisissez votre nouveau mot de passe.",
    button: "Continuer",
  },
  email: {
    title: "Confirmer mon adresse",
    lead: "Un clic pour confirmer votre adresse email.",
    button: "Confirmer",
  },
} as const;

/**
 * Page d'arrivée des liens reçus par email. Elle n'utilise PAS le jeton au
 * chargement : il faut cliquer sur le bouton. Les antivirus et aperçus de
 * messagerie qui ouvrent les liens ne peuvent donc pas « consommer » le lien
 * à la place du client.
 */
export default async function AuthConfirmPage({
  searchParams,
}: PageProps<"/auth/confirm">) {
  const params = await searchParams;
  const tokenHash =
    typeof params.token_hash === "string" ? params.token_hash : "";
  const type = typeof params.type === "string" ? params.type : "";
  const next = typeof params.next === "string" ? params.next : "";
  const copy = COPY[type as keyof typeof COPY];

  if (!tokenHash || !copy) {
    return (
      <AuthShell
        title="Lien incomplet"
        lead="Ce lien ne semble pas complet. Demandez-en un nouveau depuis la page de connexion."
      >
        <Link
          href="/connexion"
          className="text-brand-text text-sm font-medium underline underline-offset-4"
        >
          Retour à la connexion
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={copy.title} lead={copy.lead}>
      <ConfirmForm
        tokenHash={tokenHash}
        type={type}
        next={next}
        button={copy.button}
      />
    </AuthShell>
  );
}
