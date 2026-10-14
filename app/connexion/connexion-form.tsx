"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  requestLoginLink,
  signIn,
  type AuthFormState,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Honeypot } from "@/components/ui/honeypot";
import { IconMail } from "@/components/icons";
import { Form } from "@/components/ui/form";

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? pendingLabel : label}
    </Button>
  );
}

/**
 * Connexion à deux voies : par défaut un lien envoyé par email (rien à
 * retenir, et une adresse inconnue crée le compte) ; le mot de passe reste
 * possible pour ceux qui le préfèrent.
 */
export function ConnexionForm({ nextPath }: { nextPath?: string }) {
  const [mode, setMode] = useState<"lien" | "mot-de-passe">("lien");
  const [linkState, linkAction] = useActionState<AuthFormState, FormData>(
    requestLoginLink,
    undefined,
  );
  const [passwordState, passwordAction] = useActionState<
    AuthFormState,
    FormData
  >(signIn, undefined);

  if (mode === "lien") {
    return (
      <div className="flex flex-col gap-5">
        {linkState?.success ? (
          <div
            role="status"
            className="bg-brand-50 text-ink flex items-start gap-3 rounded-lg px-4 py-4 text-sm leading-relaxed"
          >
            <IconMail size={20} className="text-brand mt-0.5 shrink-0" />
            <span>{linkState.message}</span>
          </div>
        ) : null}

        <Form action={linkAction} className="relative flex flex-col gap-4">
          <Honeypot />
          {nextPath ? (
            <input type="hidden" name="next" value={nextPath} />
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Votre adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              required
            />
            <FieldError message={linkState?.errors?.email?.[0]} />
          </div>
          {!linkState?.success ? (
            <FieldError message={linkState?.message} />
          ) : null}
          <SubmitButton
            label={
              linkState?.success
                ? "Renvoyer le lien"
                : "Recevoir mon lien de connexion"
            }
            pendingLabel="Envoi…"
          />
          <p className="text-ink-faint text-xs leading-relaxed">
            Nous vous envoyons un lien : un clic et vous êtes dans votre espace.
            Pas encore de compte ? Il est créé automatiquement.
          </p>
        </Form>

        <button
          type="button"
          onClick={() => setMode("mot-de-passe")}
          className="text-brand-text self-start text-sm font-medium underline underline-offset-4"
        >
          Je préfère utiliser un mot de passe
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Form action={passwordAction} className="flex flex-col gap-4">
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError message={passwordState?.errors?.email?.[0]} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-brand text-xs hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <FieldError message={passwordState?.errors?.password?.[0]} />
        </div>

        <FieldError message={passwordState?.message} />

        <SubmitButton label="Se connecter" pendingLabel="Connexion…" />
      </Form>

      <button
        type="button"
        onClick={() => setMode("lien")}
        className="text-brand-text self-start text-sm font-medium underline underline-offset-4"
      >
        Recevoir plutôt un lien de connexion par email
      </button>
    </div>
  );
}
