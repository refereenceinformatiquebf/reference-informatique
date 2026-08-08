"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, type AuthFormState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
    >
      {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
    </button>
  );
}

export function MotDePasseOublieForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    undefined,
  );

  if (state?.success) {
    return (
      <p className="bg-success/10 text-success rounded-md px-4 py-3 text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
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

      <SubmitButton />
    </form>
  );
}
