"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { addAdminAction } from "@/lib/actions/admin/admins";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="primary" disabled={pending}>
      {pending ? "Ajout…" : "Ajouter comme administrateur"}
    </Button>
  );
}

export function AddAdminForm() {
  const [state, action] = useActionState<ActionResult, FormData>(
    addAdminAction,
    undefined,
  );
  return (
    <Form
      clearOnSuccess={state?.ok === true}
      action={action}
      className="flex max-w-xl flex-col gap-4"
    >
      <p className="text-ink-soft text-sm leading-relaxed">
        La personne doit déjà avoir un compte : demandez-lui de se connecter une
        fois avec son adresse email (un lien lui est envoyé).
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-email">Adresse email du compte</Label>
        <Input id="admin-email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admin-reason">Pourquoi ? (journalisé)</Label>
        <Textarea
          id="admin-reason"
          name="reason"
          rows={2}
          required
          minLength={5}
        />
      </div>
      <div className="flex items-center gap-3">
        <Submit />
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
