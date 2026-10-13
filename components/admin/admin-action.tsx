"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";

type Variant = "primary" | "outline" | "ghost" | "danger" | "whatsapp";

type Confirm = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** Motif à saisir (journalisé). Obligatoire si `reasonRequired`. */
  reasonLabel?: string;
  reasonRequired?: boolean;
  /** Case à cocher « prévenir le client » (envoie `notify=on`). */
  notifyLabel?: string;
};

type Props = {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  /** Champs cachés envoyés à l'action (identifiants). */
  hidden?: Record<string, string>;
  label: string;
  variant?: Variant;
  size?: "sm" | "md";
  confirm?: Confirm;
  className?: string;
};

function Submit({
  label,
  variant,
  size,
  className,
}: {
  label: string;
  variant: Variant;
  size: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      className={className}
    >
      {pending ? "…" : label}
    </Button>
  );
}

function Feedback({ state }: { state: ActionResult }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`mt-2 text-xs leading-relaxed ${
        state.ok ? "text-success-text" : "text-danger-text"
      }`}
    >
      {state.message}
    </p>
  );
}

/**
 * Bouton d'action d'administration : appelle une action serveur, avec une
 * confirmation en fenêtre (et un motif facultatif ou obligatoire) quand
 * l'action est sensible. Le résultat s'affiche juste en dessous.
 */
export function AdminAction({
  action,
  hidden,
  label,
  variant = "outline",
  size = "sm",
  confirm,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  // La fenêtre se ferme quand l'action a réussi (et reste ouverte, avec le
  // message d'erreur, sinon).
  const [state, formAction] = useActionState<ActionResult, FormData>(
    async (previous, formData) => {
      const result = await action(previous, formData);
      if (result?.ok) setOpen(false);
      return result;
    },
    undefined,
  );

  const hiddenInputs = Object.entries(hidden ?? {}).map(([name, value]) => (
    <input key={name} type="hidden" name={name} value={value} />
  ));

  if (!confirm) {
    return (
      <form action={formAction} className="inline-block">
        {hiddenInputs}
        <Submit
          label={label}
          variant={variant}
          size={size}
          className={className}
        />
        <Feedback state={state} />
      </form>
    );
  }

  return (
    <div className="inline-block">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
          >
            {label}
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="bg-paper shadow-lift fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 focus:outline-none">
            <Dialog.Title className="font-display text-ink text-[1.375rem] leading-tight">
              {confirm.title}
            </Dialog.Title>
            <Dialog.Description asChild>
              <div className="text-ink-soft mt-2 text-sm leading-relaxed">
                {confirm.description}
              </div>
            </Dialog.Description>
            <form action={formAction} className="mt-5 flex flex-col gap-4">
              {hiddenInputs}
              {confirm.reasonLabel ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="admin-action-reason">
                    {confirm.reasonLabel}
                  </Label>
                  <Textarea
                    id="admin-action-reason"
                    name="reason"
                    rows={3}
                    required={confirm.reasonRequired}
                    minLength={confirm.reasonRequired ? 5 : undefined}
                  />
                </div>
              ) : null}
              {confirm.notifyLabel ? (
                <label className="text-ink flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="notify"
                    defaultChecked
                    className="accent-brand h-4 w-4"
                  />
                  {confirm.notifyLabel}
                </label>
              ) : null}
              {state && !state.ok ? (
                <p role="alert" className="text-danger-text text-sm">
                  {state.message}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost">
                    Annuler
                  </Button>
                </Dialog.Close>
                <Submit
                  label={confirm.confirmLabel ?? label}
                  variant={variant === "outline" ? "primary" : variant}
                  size="md"
                />
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {state?.ok ? <Feedback state={state} /> : null}
    </div>
  );
}
