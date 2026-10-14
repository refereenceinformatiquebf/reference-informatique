"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveServiceAction,
  type ServiceSaveState,
} from "@/lib/actions/admin/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Form } from "@/components/ui/form";

export type ServiceFormValues = {
  slug: string;
  name: string;
  summary: string;
  tagline: string;
  priceType: "FIXED" | "FROM" | "QUOTE";
  priceFrom: number | null;
  priceNote: string;
  timeline: string;
  active: boolean;
  displayOrder: number;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

export function ServiceForm({ values }: { values: ServiceFormValues }) {
  const [state, action] = useActionState<ServiceSaveState, FormData>(
    saveServiceAction,
    undefined,
  );
  const id = values.slug;
  const e = state?.errors ?? {};
  return (
    <Form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={values.slug} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`s-name-${id}`}>Nom du service</Label>
        <Input
          id={`s-name-${id}`}
          name="name"
          defaultValue={values.name}
          required
        />
        <FieldError message={e.name?.[0]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`s-tagline-${id}`}>Promesse (une phrase)</Label>
        <Input
          id={`s-tagline-${id}`}
          name="tagline"
          defaultValue={values.tagline}
          required
        />
        <FieldError message={e.tagline?.[0]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`s-summary-${id}`}>Texte de la carte</Label>
        <Textarea
          id={`s-summary-${id}`}
          name="summary"
          rows={2}
          defaultValue={values.summary}
          required
        />
        <FieldError message={e.summary?.[0]} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`s-type-${id}`}>Type de prix</Label>
          <Select
            id={`s-type-${id}`}
            name="priceType"
            defaultValue={values.priceType}
          >
            <option value="FROM">À partir de…</option>
            <option value="FIXED">Prix fixe</option>
            <option value="QUOTE">Sur devis</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`s-price-${id}`}>Prix (F CFA)</Label>
          <Input
            id={`s-price-${id}`}
            name="priceFrom"
            type="number"
            min={100}
            step={1}
            defaultValue={values.priceFrom ?? ""}
          />
          <FieldError message={e.priceFrom?.[0]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`s-order-${id}`}>Ordre</Label>
          <Input
            id={`s-order-${id}`}
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={values.displayOrder}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`s-note-${id}`}>
          Ce que couvre le prix, ou comment il est établi
        </Label>
        <Textarea
          id={`s-note-${id}`}
          name="priceNote"
          rows={3}
          defaultValue={values.priceNote}
          required
        />
        <FieldError message={e.priceNote?.[0]} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`s-time-${id}`}>
          Délai indicatif (sans promesse ferme)
        </Label>
        <Input
          id={`s-time-${id}`}
          name="timeline"
          defaultValue={values.timeline}
          required
        />
        <FieldError message={e.timeline?.[0]} />
      </div>
      <label className="text-ink flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={values.active}
          className="accent-brand h-4 w-4"
        />
        Proposé sur le site
      </label>
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
