"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestOrderLinks,
  type CheckoutActionState,
} from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Honeypot } from "@/components/ui/honeypot";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Envoi en cours…" : "Recevoir mes liens"}
    </Button>
  );
}

export function RetrieveForm() {
  const [state, action] = useActionState<CheckoutActionState, FormData>(
    requestOrderLinks,
    undefined,
  );
  return (
    <Form action={action} className="flex flex-col gap-4">
      <Honeypot />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="retrieve-email">Adresse email</Label>
        <Input
          id="retrieve-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="vous@exemple.com"
          required
        />
      </div>
      {state?.error ? (
        <p
          role="alert"
          className="bg-danger-bg text-danger-text rounded-lg px-4 py-3 text-sm leading-relaxed"
        >
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          role="status"
          className="bg-success-bg text-success-text rounded-lg px-4 py-3 text-sm leading-relaxed"
        >
          {state.success}
        </p>
      ) : null}
      <Submit />
    </Form>
  );
}
