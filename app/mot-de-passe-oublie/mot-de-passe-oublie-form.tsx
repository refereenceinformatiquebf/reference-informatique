"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Envoi…" : "Envoyer le lien de réinitialisation"}
    </Button>
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

      <SubmitButton />
    </form>
  );
}
