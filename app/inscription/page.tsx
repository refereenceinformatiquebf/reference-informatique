import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { InscriptionForm } from "./inscription-form";

export const metadata: Metadata = {
  alternates: { canonical: "/inscription" },
  title: "Créer un compte",
  robots: { index: false, follow: true },
};

export default function InscriptionPage() {
  return (
    <AuthShell
      title="Créer un compte"
      lead="Gratuit, en une minute. Votre compte vous donne accès à vos achats, à vos commandes et à vos demandes de devis."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="text-brand-text font-medium underline underline-offset-4"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <InscriptionForm />
    </AuthShell>
  );
}
