import type { Metadata } from "next";
import Link from "next/link";
import { InscriptionForm } from "./inscription-form";

export const metadata: Metadata = {
  title: "Créer un compte",
};

export default function InscriptionPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
      <div>
        <h1 className="text-ink text-lg font-bold">Créer un compte</h1>
        <p className="text-ink-soft mt-1 text-sm">
          Accédez à vos formations et suivez vos commandes.
        </p>
      </div>

      <InscriptionForm />

      <p className="text-ink-soft text-center text-sm">
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="text-brand font-medium hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
