"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "…" : "Enregistrer"}
    </Button>
  );
}

/** Liste déroulante + bouton, pour changer un statut avec retour visible. */
export function SelectAction({
  action,
  hidden,
  name,
  label,
  options,
  value,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  hidden: Record<string, string>;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    undefined,
  );
  return (
    <Form action={formAction} className="flex flex-wrap items-center gap-2">
      {Object.entries(hidden).map(([key, v]) => (
        <input key={key} type="hidden" name={key} value={v} />
      ))}
      <Select
        name={name}
        aria-label={label}
        defaultValue={value}
        className="w-auto min-w-40 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Submit />
      {state ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={`text-xs ${state.ok ? "text-success-text" : "text-danger-text"}`}
        >
          {state.message}
        </p>
      ) : null}
    </Form>
  );
}
