"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError message={state?.errors?.email?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link
            href="/mot-de-passe-oublie"
            className="text-brand text-xs hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError message={state?.errors?.password?.[0]} />
      </div>

      <FieldError message={state?.message} />

      <SubmitButton />
    </form>
  );
}
