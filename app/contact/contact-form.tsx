"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  sendContactMessage,
  type ContactFormState,
} from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Envoi…" : "Envoyer le message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<ContactFormState, FormData>(
    sendContactMessage,
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
        <Label htmlFor="name">Nom</Label>
        <Input id="name" name="name" required />
        <FieldError message={state?.errors?.name?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
        <FieldError message={state?.errors?.email?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Téléphone (optionnel)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+226 XX XX XX XX"
        />
        <FieldError message={state?.errors?.phone?.[0]} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={5} required />
        <FieldError message={state?.errors?.message?.[0]} />
      </div>

      <SubmitButton />
    </form>
  );
}
