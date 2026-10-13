"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestDevis, type DevisFormState } from "@/lib/actions/devis";
import { Honeypot } from "@/components/ui/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { IconCoche } from "@/components/icons";

type ServiceOption = { slug: string; name: string };

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
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Envoi en cours…" : "Recevoir mon devis gratuit"}
    </Button>
  );
}

export function DevisForm({
  services,
  defaultServiceSlug,
}: {
  services: ServiceOption[];
  defaultServiceSlug?: string;
}) {
  const [state, action] = useActionState<DevisFormState, FormData>(
    requestDevis,
    undefined,
  );

  if (state?.success) {
    return (
      <div
        role="status"
        className="bg-success-bg text-success-text flex items-start gap-3 rounded-lg px-5 py-4 text-[0.9375rem] leading-relaxed"
      >
        <span className="bg-success mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
          <IconCoche size={14} />
        </span>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-5">
      <Honeypot />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="serviceSlug">Prestation concernée</Label>
        <Select
          id="serviceSlug"
          name="serviceSlug"
          required
          defaultValue={defaultServiceSlug ?? ""}
        >
          <option value="" disabled>
            Choisissez une prestation
          </option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.name}
            </option>
          ))}
        </Select>
        <FieldError message={state?.errors?.serviceSlug?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Votre nom</Label>
          <Input id="name" name="name" autoComplete="name" required />
          <FieldError message={state?.errors?.name?.[0]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Téléphone (WhatsApp si possible)</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+226 XX XX XX XX"
            required
          />
          <FieldError message={state?.errors?.phone?.[0]} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <FieldError message={state?.errors?.email?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="company">Entreprise (facultatif)</Label>
          <Input id="company" name="company" autoComplete="organization" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget">Budget indicatif (facultatif)</Label>
          <Select id="budget" name="budget" defaultValue="">
            <option value="">Je préfère ne pas préciser</option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Décrivez votre besoin</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Ce que vous faites, ce que vous voulez obtenir, ce qui vous pose problème aujourd'hui… Quelques phrases suffisent."
        />
        <FieldError message={state?.errors?.message?.[0]} />
      </div>

      <FieldError message={state?.message} />

      <SubmitButton />
      <p className="text-ink-faint text-xs leading-relaxed">
        Gratuit et sans engagement. Vos informations servent uniquement à vous
        répondre.
      </p>
    </form>
  );
}
