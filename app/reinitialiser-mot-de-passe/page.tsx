import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ReinitialiserMotDePasseForm } from "./reinitialiser-mot-de-passe-form";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false, follow: false },
};

export default function ReinitialiserMotDePassePage() {
  return (
    <AuthShell title="Choisissez un nouveau mot de passe">
      <ReinitialiserMotDePasseForm />
    </AuthShell>
  );
}
