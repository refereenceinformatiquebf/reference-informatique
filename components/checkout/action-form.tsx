"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { CheckoutActionState } from "@/lib/actions/checkout";

type ButtonLook = {
  variant?: "primary" | "outline" | "ghost" | "whatsapp";
  size?: "sm" | "md" | "lg";
};

function Submit({
  label,
  pendingLabel,
  ...buttonProps
}: {
  label: string;
  pendingLabel: string;
} & ButtonLook) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...buttonProps}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

/**
 * Bouton relié à une action serveur de la commande (ouvrir l'achat, reprendre
 * le paiement, renvoyer le lien). Les identifiants passent en champs cachés ;
 * le résultat (erreur ou confirmation) s'affiche juste en dessous.
 */
export function ActionForm({
  action,
  fields,
  label,
  pendingLabel,
  className,
  ...buttonProps
}: {
  action: (
    state: CheckoutActionState,
    formData: FormData,
  ) => Promise<CheckoutActionState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel: string;
  className?: string;
} & ButtonLook) {
  const [state, formAction] = useActionState<CheckoutActionState, FormData>(
    action,
    undefined,
  );
  return (
    <Form action={formAction} className={className}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Submit label={label} pendingLabel={pendingLabel} {...buttonProps} />
      {state?.error ? (
        <p
          role="alert"
          className="bg-danger-bg text-danger-text mt-3 rounded-lg px-4 py-3 text-left text-sm leading-relaxed"
        >
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p
          role="status"
          className="bg-success-bg text-success-text mt-3 rounded-lg px-4 py-3 text-left text-sm leading-relaxed"
        >
          {state.success}
        </p>
      ) : null}
    </Form>
  );
}
