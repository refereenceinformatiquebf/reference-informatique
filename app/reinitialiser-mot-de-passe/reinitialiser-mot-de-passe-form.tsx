"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword, type AuthFormState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
    >
      {pending ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
    </button>
  );
}

export function ReinitialiserMotDePasseForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    updatePassword,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-ink text-sm font-medium">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="border-line focus:border-brand rounded-md border px-3 py-2 text-sm outline-none"
        />
        {state?.errors?.password ? (
          <p className="text-danger text-xs">{state.errors.password[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-ink text-sm font-medium"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="border-line focus:border-brand rounded-md border px-3 py-2 text-sm outline-none"
        />
        {state?.errors?.confirmPassword ? (
          <p className="text-danger text-xs">
            {state.errors.confirmPassword[0]}
          </p>
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
