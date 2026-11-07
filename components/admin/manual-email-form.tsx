"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Envoi…" : "Envoyer maintenant"}
    </Button>
  );
}

/**
 * Secours total si Brevo est en panne : tout est déjà prérempli (destinataire, objet, message
 * avec licence/liens déjà connus) — un clic sur « Envoyer maintenant » part réellement, via la
 * boîte mail de secours (MANUAL_SMTP_*), sans passer par Brevo. Le lien d'accès personnel de la
 * commande n'apparaît jamais ici : il est ajouté automatiquement côté serveur à l'envoi.
 */
export function ManualEmailForm({
  action,
  orderId,
  defaultTo,
  defaultSubject,
  defaultText,
  configured,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  orderId: string;
  defaultTo: string;
  defaultSubject: string;
  defaultText: string;
  configured: boolean;
}) {
  const [state, formAction] = useActionState<ActionResult, FormData>(
    action,
    undefined,
  );
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Envoi manuel (secours si Brevo est en panne)
      </Button>
    );
  }

  return (
    <Form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      {!configured ? (
        <p className="text-warning-text border-warning/40 bg-warning-bg rounded-md border px-3 py-2 text-xs">
          Boîte de secours non configurée sur ce serveur (variables
          MANUAL_SMTP_HOST / MANUAL_SMTP_USER / MANUAL_SMTP_PASS manquantes).
          L&apos;envoi ci-dessous échouera tant qu&apos;elles ne sont pas
          définies.
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`manual-to-${orderId}`}>Destinataire</Label>
        <Input
          id={`manual-to-${orderId}`}
          name="to"
          type="email"
          defaultValue={defaultTo}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`manual-subject-${orderId}`}>Objet</Label>
        <Input
          id={`manual-subject-${orderId}`}
          name="subject"
          defaultValue={defaultSubject}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`manual-text-${orderId}`}>Message</Label>
        <Textarea
          id={`manual-text-${orderId}`}
          name="text"
          rows={10}
          defaultValue={defaultText}
          className="font-mono text-[13px]"
          required
        />
      </div>
      <div className="flex items-center gap-3">
        <Submit />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Fermer
        </Button>
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
