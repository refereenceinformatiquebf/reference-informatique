import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/section";
import { RetrieveForm } from "./retrieve-form";

export const metadata: Metadata = {
  title: "Retrouver ma commande",
  robots: { index: false, follow: false },
};

export default function RetrouverCommandePage() {
  return (
    <Container className="max-w-md py-16 sm:py-24">
      <h1 className="text-ink text-[1.875rem] leading-[1.1] sm:text-[2.25rem]">
        Retrouver ma commande
      </h1>
      <p className="text-ink-soft mt-4 text-[0.9375rem] leading-relaxed">
        Saisissez l&apos;adresse email utilisée pour payer : nous vous envoyons
        le lien de vos commandes récentes. Un clic ouvre votre achat, sans mot
        de passe.
      </p>
      <div className="border-line bg-paper shadow-card mt-8 rounded-xl border p-6">
        <RetrieveForm />
      </div>
      <p className="text-ink-faint mt-6 text-center text-sm">
        Vous avez un compte avec mot de passe ?{" "}
        <Link
          href="/connexion"
          className="text-brand-text underline underline-offset-4"
        >
          Se connecter
        </Link>
      </p>
    </Container>
  );
}
