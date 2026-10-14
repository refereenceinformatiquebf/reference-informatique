"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
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
      {pending ? "Création…" : "Créer mon compte"}
    </Button>
  );
}

export function InscriptionForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    signUp,
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
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required />
        <FieldError message={state?.errors?.name?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+226 XX XX XX XX"
          required
        />
        <FieldError message={state?.errors?.phone?.[0]} />
      </div>

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
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={state?.errors?.password?.[0]} />
      </div>

      <FieldError message={state?.message} />

      <SubmitButton />
    </Form>
  );
}
