"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deliverPendingLicencesAction } from "@/lib/actions/admin/licences";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { ActionResult } from "@/lib/admin/action";

function Submit({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Livraison…" : `Livrer les licences en attente (${count})`}
    </Button>
  );
}

/** Rattache une licence à chaque client qui a payé et attend encore sa clé. */
export function DeliverPendingForm({ count }: { count: number }) {
  const [state, action] = useActionState<ActionResult>(
    deliverPendingLicencesAction,
    undefined,
  );
  return (
    <Form action={action} className="flex flex-wrap items-center gap-3">
      <Submit count={count} />
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
