import type { Metadata } from "next";
import Link from "next/link";
import { ConnexionForm } from "./connexion-form";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-24">
      <div>
        <h1 className="text-ink text-lg font-bold">Connexion</h1>
        <p className="text-ink-soft mt-1 text-sm">
          Accédez à votre espace client.
        </p>
      </div>

      <ConnexionForm nextPath={nextPath} />

      <p className="text-ink-soft text-center text-sm">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="text-brand font-medium hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
