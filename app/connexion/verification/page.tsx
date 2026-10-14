import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { getAdminAssurance, requireProfile } from "@/lib/auth/dal";
import { safeNextPath } from "@/lib/auth/email-links";
import { VerificationForm } from "./verification-form";

export const metadata: Metadata = {
  title: "Vérification",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * Saisie du code de l'application d'authentification, pour un administrateur
 * qui a activé la double vérification. Volontairement hors de /admin.
 */
export default async function VerificationPage({
  searchParams,
}: PageProps<"/connexion/verification">) {
  await requireProfile();
  const { next } = await searchParams;
  const nextPath =
    safeNextPath(typeof next === "string" ? next : undefined) ?? "/admin";

  const assurance = await getAdminAssurance();
  // Rien à vérifier (pas de second facteur, ou déjà vérifié) : on continue.
  if (!assurance.enrolled || assurance.verified) redirect(nextPath);

  return (
    <AuthShell
      title="Vérification"
      lead="Saisissez le code à 6 chiffres affiché par votre application d'authentification."
    >
      <VerificationForm next={nextPath} />
    </AuthShell>
  );
}
