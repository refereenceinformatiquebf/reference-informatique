"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  setAccountPassword,
  updateProfile,
  type AuthFormState,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

function Feedback({ state }: { state: AuthFormState }) {
  if (state?.success) {
    return (
      <p
        role="status"
        className="bg-success-bg text-success-text rounded-lg px-3 py-2 text-sm"
      >
        {state.message}
      </p>
    );
  }
  return <FieldError message={state?.message} />;
}

/** Nom et téléphone : servent aux livraisons et à vous joindre sur WhatsApp. */
export function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string;
  phone: string | null;
  email: string | null;
}) {
  const [state, action] = useActionState<AuthFormState, FormData>(
    updateProfile,
    undefined,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          value={email ?? ""}
          readOnly
          disabled
          aria-describedby="profile-email-help"
        />
        <p id="profile-email-help" className="text-ink-faint text-xs">
          C&apos;est avec cette adresse que vous vous connectez.
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">Nom complet</Label>
        <Input
          id="profile-name"
          name="name"
          defaultValue={name}
          autoComplete="name"
          required
        />
        <FieldError message={state?.errors?.name?.[0]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-phone">Téléphone (WhatsApp si possible)</Label>
        <Input
          id="profile-phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          autoComplete="tel"
          placeholder="+226 XX XX XX XX"
        />
        <FieldError message={state?.errors?.phone?.[0]} />
      </div>
      <Feedback state={state} />
      <Submit label="Enregistrer" />
    </form>
  );
}

/** Facultatif : on se connecte déjà par lien envoyé par email. */
export function PasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(
    setAccountPassword,
    undefined,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-ink-soft text-sm leading-relaxed">
        Facultatif : vous pouvez toujours vous connecter avec un lien envoyé par
        email. Un mot de passe vous permet en plus d&apos;entrer directement.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Nouveau mot de passe</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={state?.errors?.password?.[0]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={state?.errors?.confirmPassword?.[0]} />
      </div>
      <Feedback state={state} />
      <Submit label="Enregistrer le mot de passe" />
    </form>
  );
}
