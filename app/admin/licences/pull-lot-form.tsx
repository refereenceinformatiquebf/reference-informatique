"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { pullLicenceLotAction } from "@/lib/actions/admin/licences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import type { ActionResult } from "@/lib/admin/action";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Récupération…" : "Récupérer un nouveau lot"}
    </Button>
  );
}

/** Récupère un lot de licences chez L'Expert du Numérique et l'ajoute au stock local. */
export function PullLotForm() {
  const [state, action] = useActionState<ActionResult, FormData>(
    pullLicenceLotAction,
    undefined,
  );
  return (
    <Form action={action} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="lot-count"
          className="text-ink-soft text-xs font-medium"
        >
          Nombre de licences
        </label>
        <Input
          id="lot-count"
          name="count"
          type="number"
          min={1}
          max={100}
          defaultValue={20}
          required
          className="w-28"
        />
      </div>
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
