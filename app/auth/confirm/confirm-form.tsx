"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { confirmAuthLink, type AuthFormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Form } from "@/components/ui/form";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Un instant…" : label}
    </Button>
  );
}

export function ConfirmForm({
  tokenHash,
  type,
  next,
  button,
}: {
  tokenHash: string;
  type: string;
  next: string;
  button: string;
}) {
  const [state, action] = useActionState<AuthFormState, FormData>(
    confirmAuthLink,
    undefined,
  );

  return (
    <Form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={next} />
      <SubmitButton label={button} />
      {state?.message ? (
        <div className="flex flex-col gap-2">
          <FieldError message={state.message} />
          <Link
            href="/connexion"
            className="text-brand-text text-sm font-medium underline underline-offset-4"
          >
            Recevoir un nouveau lien
          </Link>
        </div>
      ) : null}
    </Form>
  );
}
