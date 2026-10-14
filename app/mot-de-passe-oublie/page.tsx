import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { MotDePasseOublieForm } from "./mot-de-passe-oublie-form";

export const metadata: Metadata = {
  alternates: { canonical: "/mot-de-passe-oublie" },
  title: "Mot de passe oublié",
  robots: { index: false, follow: true },
};

export default function MotDePasseOubliePage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      lead="Indiquez votre email : nous vous envoyons un lien pour choisir un nouveau mot de passe."
      footer={
        <Link
          href="/connexion"
          className="text-brand-text font-medium underline underline-offset-4"
        >
          Retour à la connexion
        </Link>
      }
    >
      <MotDePasseOublieForm />
    </AuthShell>
  );
}
