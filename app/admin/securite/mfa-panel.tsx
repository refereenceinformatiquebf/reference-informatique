"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  confirmMfaEnrollAction,
  disableMfaAction,
  startMfaEnrollAction,
  type MfaState,
} from "@/lib/actions/admin/mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Form } from "@/components/ui/form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Vérification…" : label}
    </Button>
  );
}

export function MfaPanel({
  enabledFactorId,
}: {
  /** Identifiant du facteur actif, ou undefined si la double vérification n'est pas activée. */
  enabledFactorId?: string;
}) {
  const [started, setStarted] = useState<MfaState>(undefined);
  const [starting, startTransition] = useTransition();
  const [confirmState, confirmAction] = useActionState<MfaState, FormData>(
    confirmMfaEnrollAction,
    undefined,
  );
  const [disableState, disableAction] = useActionState<MfaState, FormData>(
    disableMfaAction,
    undefined,
  );

  if (confirmState?.ok) {
    return (
      <p
        role="status"
        className="bg-success-bg text-success-text rounded-lg px-4 py-3 text-sm leading-relaxed"
      >
        {confirmState.message}
      </p>
    );
  }

  if (enabledFactorId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="bg-success-bg text-success-text rounded-lg px-4 py-3 text-sm leading-relaxed">
          La double vérification est <strong>activée</strong>. À chaque
          connexion à l&apos;administration, un code de votre application
          d&apos;authentification vous est demandé.
        </p>
        <Form
          action={disableAction}
          className="flex flex-col items-start gap-3"
        >
          <input type="hidden" name="factorId" value={enabledFactorId} />
          <p className="text-ink-soft text-sm leading-relaxed">
            Vous avez perdu votre téléphone ? Un autre administrateur ne peut
            pas désactiver la vérification à votre place : contactez la personne
            qui gère le projet Supabase, qui peut la retirer depuis
            Authentication → Users.
          </p>
          <Button type="submit" variant="ghost" size="sm">
            Désactiver la double vérification
          </Button>
          {disableState?.message ? (
            <p
              role={disableState.ok ? "status" : "alert"}
              className={`text-xs ${disableState.ok ? "text-success-text" : "text-danger-text"}`}
            >
              {disableState.message}
            </p>
          ) : null}
        </Form>
      </div>
    );
  }

  const enroll = confirmState?.enroll ?? started?.enroll;

  if (!enroll) {
    return (
      <div className="flex flex-col items-start gap-3">
        {disableState?.ok ? (
          <p
            role="status"
            className="bg-success-bg text-success-text rounded-lg px-4 py-3 text-sm leading-relaxed"
          >
            {disableState.message}
          </p>
        ) : null}
        <p className="text-ink-soft text-sm leading-relaxed">
          Un mot de passe ou un lien peut être volé : la double vérification
          ajoute un code à 6 chiffres, qui change toutes les 30 secondes et
          n&apos;existe que sur votre téléphone. Elle protège les données de
          tous vos clients. Il vous faut une application d&apos;authentification
          (Google Authenticator, Microsoft Authenticator, Authy…).
        </p>
        <Button
          type="button"
          size="sm"
          disabled={starting}
          onClick={() =>
            startTransition(async () =>
              setStarted(await startMfaEnrollAction()),
            )
          }
        >
          {starting ? "Préparation…" : "Activer la double vérification"}
        </Button>
        {started?.message ? (
          <p role="alert" className="text-danger-text text-sm">
            {started.message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Form action={confirmAction} className="flex max-w-md flex-col gap-4">
      <input type="hidden" name="factorId" value={enroll.factorId} />
      <input type="hidden" name="qr" value={enroll.qr} />
      <input type="hidden" name="secret" value={enroll.secret} />
      <ol className="text-ink-soft list-decimal space-y-2 pl-5 text-sm leading-relaxed">
        <li>Ouvrez votre application d&apos;authentification.</li>
        <li>Scannez ce QR code (ou saisissez la clé ci-dessous).</li>
        <li>Saisissez le code à 6 chiffres qu&apos;elle affiche.</li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={enroll.qr}
        alt="QR code à scanner avec votre application d'authentification"
        width={192}
        height={192}
        className="border-line rounded-lg border bg-white p-2"
      />
      <p className="text-ink-soft text-xs break-all">
        Saisie manuelle : <code className="text-ink">{enroll.secret}</code>
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mfa-code">Code à 6 chiffres</Label>
        <Input
          id="mfa-code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
        />
        <FieldError message={confirmState?.message} />
      </div>
      <div>
        <Submit label="Activer" />
      </div>
    </Form>
  );
}
