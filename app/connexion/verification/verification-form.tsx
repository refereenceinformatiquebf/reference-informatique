"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { verifyMfaAction, type MfaState } from "@/lib/actions/admin/mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Form } from "@/components/ui/form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Vérification…" : "Continuer"}
    </Button>
  );
}

export function VerificationForm({ next }: { next: string }) {
  const [state, action] = useActionState<MfaState, FormData>(
    verifyMfaAction,
    undefined,
  );
  return (
    <Form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code">Code à 6 chiffres</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          autoFocus
          required
        />
        <FieldError message={state?.message} />
      </div>
      <Submit />
    </Form>
  );
}
