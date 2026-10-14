"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveAnnouncementAction,
  saveLegalSettingsAction,
  type SettingsState,
} from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import type { AnnouncementSettings, LegalSettings } from "@/lib/settings";
import { Form } from "@/components/ui/form";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

function Feedback({ state }: { state: SettingsState }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`text-xs ${state.ok ? "text-success-text" : "text-danger-text"}`}
    >
      {state.message}
    </p>
  );
}

function Row({
  id,
  label,
  error,
  help,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {help ? <p className="text-ink-faint text-xs">{help}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

export function LegalForm({ values }: { values: LegalSettings }) {
  const [state, action] = useActionState<SettingsState, FormData>(
    saveLegalSettingsAction,
    undefined,
  );
  const e = state?.errors ?? {};
  return (
    <Form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row
          id="companyName"
          label="Nom de l'entreprise"
          error={e.companyName?.[0]}
        >
          <Input
            id="companyName"
            name="companyName"
            defaultValue={values.companyName}
          />
        </Row>
        <Row
          id="legalForm"
          label="Forme juridique"
          help="Ex. : entreprise individuelle, SARL…"
        >
          <Input
            id="legalForm"
            name="legalForm"
            defaultValue={values.legalForm}
          />
        </Row>
      </div>
      <Row id="address" label="Adresse du siège" error={e.address?.[0]}>
        <Textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={values.address}
        />
      </Row>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row id="registration" label="Immatriculation (RCCM)">
          <Input
            id="registration"
            name="registration"
            defaultValue={values.registration}
          />
        </Row>
        <Row id="taxId" label="Identifiant fiscal (IFU)">
          <Input id="taxId" name="taxId" defaultValue={values.taxId} />
        </Row>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row id="publicationDirector" label="Directeur de la publication">
          <Input
            id="publicationDirector"
            name="publicationDirector"
            defaultValue={values.publicationDirector}
          />
        </Row>
        <Row
          id="contactEmail"
          label="Email de contact public"
          error={e.contactEmail?.[0]}
        >
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={values.contactEmail}
          />
        </Row>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row id="hostName" label="Hébergeur du site (nom)">
          <Input
            id="hostName"
            name="hostName"
            defaultValue={values.hostName}
            placeholder="Nom de la société d'hébergement"
          />
        </Row>
        <Row id="hostAddress" label="Hébergeur du site (adresse)">
          <Input
            id="hostAddress"
            name="hostAddress"
            defaultValue={values.hostAddress}
          />
        </Row>
      </div>
      <div className="flex items-center gap-3">
        <Submit label="Enregistrer" />
        <Feedback state={state} />
      </div>
    </Form>
  );
}

export function AnnouncementForm({ values }: { values: AnnouncementSettings }) {
  const [state, action] = useActionState<SettingsState, FormData>(
    saveAnnouncementAction,
    undefined,
  );
  const e = state?.errors ?? {};
  return (
    <Form action={action} className="flex flex-col gap-4">
      <label className="text-ink flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={values.enabled}
          className="accent-brand h-4 w-4"
        />
        Afficher le bandeau en haut du site
      </label>
      <Row
        id="message"
        label="Message (160 caractères maximum)"
        error={e.message?.[0]}
      >
        <Input
          id="message"
          name="message"
          defaultValue={values.message}
          maxLength={160}
          placeholder="Ex. : Livraison offerte sur toutes les clés cette semaine."
        />
      </Row>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Row
          id="linkLabel"
          label="Texte du lien (facultatif)"
          error={e.linkLabel?.[0]}
        >
          <Input
            id="linkLabel"
            name="linkLabel"
            defaultValue={values.linkLabel}
            maxLength={40}
          />
        </Row>
        <Row
          id="linkHref"
          label="Adresse du lien (facultatif)"
          error={e.linkHref?.[0]}
          help="Une page du site (/boutique) ou une adresse https://."
        >
          <Input id="linkHref" name="linkHref" defaultValue={values.linkHref} />
        </Row>
      </div>
      <div className="flex items-center gap-3">
        <Submit label="Enregistrer" />
        <Feedback state={state} />
      </div>
    </Form>
  );
}
