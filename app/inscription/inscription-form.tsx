"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUp, type AuthFormState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
    >
      {pending ? "Création…" : "Créer mon compte"}
    </button>
  );
}

export function InscriptionForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    signUp,
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
        <label htmlFor="name" className="text-ink text-sm font-medium">
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="border-line focus:border-brand rounded-md border px-3 py-2 text-sm outline-none"
        />
        {state?.errors?.name ? (
          <p className="text-danger text-xs">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-ink text-sm font-medium">
          Téléphone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+226 XX XX XX XX"
          required
          className="border-line focus:border-brand rounded-md border px-3 py-2 text-sm outline-none"
        />
        {state?.errors?.phone ? (
          <p className="text-danger text-xs">{state.errors.phone[0]}</p>
        ) : null}
      </div>

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
        <label htmlFor="password" className="text-ink text-sm font-medium">
          Mot de passe
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

      {state?.message ? (
        <p className="text-danger text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
