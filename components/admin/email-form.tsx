"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Envoi…" : label}
    </Button>
  );
}

/** Champ email relié à une action serveur (correction d'adresse d'un client). */
export function EmailForm({
  action,
  hidden,
  label,
  help,
  buttonLabel,
  defaultValue,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  hidden: Record<string, string>;
  label: string;
  help?: string;
  buttonLabel: string;
  defaultValue?: string | null;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    undefined,
  );
  const id = `email-${Object.values(hidden).join("-")}`;
  return (
    <Form action={formAction} className="flex flex-col gap-2">
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name="email"
        type="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={defaultValue ?? ""}
        required
      />
      {help ? <p className="text-ink-faint text-xs">{help}</p> : null}
      <div className="flex items-center gap-3">
        <Submit label={buttonLabel} />
        {state ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={`text-xs ${state.ok ? "text-success-text" : "text-danger-text"}`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </Form>
  );
}
