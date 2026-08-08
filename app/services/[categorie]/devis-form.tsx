"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestDevis, type DevisFormState } from "@/lib/actions/devis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

type Service = { id: string; name: string };

const BUDGETS = [
  "Moins de 50 000 F",
  "50 000 – 150 000 F",
  "150 000 – 500 000 F",
  "Plus de 500 000 F",
  "Je ne sais pas encore",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Envoi…" : "Demander un devis"}
    </Button>
  );
}

export function DevisForm({ services }: { services: Service[] }) {
  const [state, action] = useActionState<DevisFormState, FormData>(
    requestDevis,
    undefined,
  );

  if (state?.success) {
    return (
      <p className="bg-success/10 text-success rounded-md px-4 py-3 text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="serviceId">Prestation concernée</Label>
        <Select id="serviceId" name="serviceId" required defaultValue="">
          <option value="" disabled>
            Choisissez une prestation
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </Select>
        <FieldError message={state?.errors?.serviceId?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" required />
          <FieldError message={state?.errors?.name?.[0]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" type="tel" required />
          <FieldError message={state?.errors?.phone?.[0]} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError message={state?.errors?.email?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company">Entreprise (optionnel)</Label>
        <Input id="company" name="company" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget">Budget indicatif (optionnel)</Label>
        <Select id="budget" name="budget" defaultValue="">
          <option value="">Préférez ne pas préciser</option>
          {BUDGETS.map((budget) => (
            <option key={budget} value={budget}>
              {budget}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Décrivez votre besoin</Label>
        <Textarea id="message" name="message" rows={4} required />
        <FieldError message={state?.errors?.message?.[0]} />
      </div>

      <FieldError message={state?.message} />

      <SubmitButton />
    </form>
  );
}
