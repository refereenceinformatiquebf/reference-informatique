import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ConnexionForm } from "./connexion-form";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: true },
};

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <AuthShell
      title="Connexion"
      lead="Accédez à votre espace client : vos formations, vos commandes, vos devis."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="text-brand-text font-medium underline underline-offset-4"
          >
            Créer un compte
          </Link>
        </>
      }
    >
      <ConnexionForm nextPath={nextPath} />
    </AuthShell>
  );
}
