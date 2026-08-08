"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, type AuthFormState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
    >
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}

export function ConnexionForm({ nextPath }: { nextPath?: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(
    signIn,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-ink text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-line focus:border-brand rounded-md border px-3 py-2 text-sm outline-none"
        />
        {state?.errors?.email ? (
          <p className="text-danger text-xs">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-ink text-sm font-medium">
            Mot de passe
          </label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-brand text-xs hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-line focus:border-brand rounded-md border px-3 py-2 text-sm outline-none"
        />
        {state?.errors?.password ? (
          <p className="text-danger text-xs">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state?.message ? (
        <p className="text-danger text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
