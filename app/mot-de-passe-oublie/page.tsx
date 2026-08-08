import type { Metadata } from "next";
import { MotDePasseOublieForm } from "./mot-de-passe-oublie-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
      <div>
        <h1 className="text-ink text-lg font-bold">Mot de passe oublié</h1>
        <p className="text-ink-soft mt-1 text-sm">
          Indiquez votre email, nous vous envoyons un lien pour le
          réinitialiser.
        </p>
      </div>

      <MotDePasseOublieForm />
    </div>
  );
}
