"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Honeypot } from "@/components/ui/honeypot";
import { Form } from "@/components/ui/form";

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
      <p className="bg-success-bg text-success-text rounded-lg px-4 py-3 text-sm leading-relaxed">
        {state.message}
      </p>
    );
  }

  return (
    <Form action={action} className="relative flex flex-col gap-4">
      <Honeypot />
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
    </Form>
  );
}
