import type { Metadata } from "next";
import { ReinitialiserMotDePasseForm } from "./reinitialiser-mot-de-passe-form";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
};

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
      <div>
        <h1 className="text-ink text-lg font-bold">
          Choisissez un nouveau mot de passe
        </h1>
      </div>

      <ReinitialiserMotDePasseForm />
    </div>
  );
}
