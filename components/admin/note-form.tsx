"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

/** Zone de texte enregistrée par une action serveur (note interne, réponse…). */
export function NoteForm({
  action,
  hidden,
  name = "note",
  label,
  defaultValue,
  placeholder,
  buttonLabel = "Enregistrer",
  rows = 4,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  hidden: Record<string, string>;
  name?: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  buttonLabel?: string;
  rows?: number;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    undefined,
  );
  const id = `note-${name}-${Object.values(hidden).join("-")}`;
  return (
    <Form action={formAction} className="flex flex-col gap-3">
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Textarea
          id={id}
          name={name}
          rows={rows}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
        />
      </div>
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
