"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Envoi…" : label}
    </Button>
  );
}

/** Réponse par email à un client (devis, message). Les réponses du client
 * reviennent dans la boîte de l'équipe. */
export function ReplyForm({
  action,
  hidden,
  defaultSubject,
  defaultBody,
  to,
  buttonLabel = "Envoyer la réponse",
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  hidden: Record<string, string>;
  defaultSubject: string;
  defaultBody: string;
  to: string;
  buttonLabel?: string;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    undefined,
  );
  const suffix = Object.values(hidden).join("-");
  return (
    <Form action={formAction} className="flex flex-col gap-4">
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <p className="text-ink-soft text-sm">
        Destinataire : <strong className="text-ink break-all">{to}</strong>
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`reply-subject-${suffix}`}>Objet</Label>
        <Input
          id={`reply-subject-${suffix}`}
          name="subject"
          defaultValue={defaultSubject}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`reply-body-${suffix}`}>Message</Label>
        <Textarea
          id={`reply-body-${suffix}`}
          name="body"
          rows={9}
          defaultValue={defaultBody}
          required
        />
        <p className="text-ink-faint text-xs">
          Séparez les paragraphes par une ligne vide. Le message part de
          l&apos;adresse du site ; si le client répond, sa réponse arrive dans
          votre boîte.
        </p>
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
