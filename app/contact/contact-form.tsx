"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  sendContactMessage,
  type ContactFormState,
} from "@/lib/actions/contact";
import { Honeypot } from "@/components/ui/honeypot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { IconCoche } from "@/components/icons";
import { Form } from "@/components/ui/form";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Envoi en cours…" : "Envoyer le message"}
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
    <Form action={action} className="relative flex flex-col gap-5">
      <Honeypot />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-name">Votre nom</Label>
        <Input id="contact-name" name="name" autoComplete="name" required />
        <FieldError message={state?.errors?.name?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <FieldError message={state?.errors?.email?.[0]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-phone">Téléphone (facultatif)</Label>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+226 XX XX XX XX"
          />
          <FieldError message={state?.errors?.phone?.[0]} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Votre message</Label>
        <Textarea id="contact-message" name="message" rows={5} required />
        <FieldError message={state?.errors?.message?.[0]} />
      </div>

      <FieldError message={state?.message} />

      <SubmitButton />
    </Form>
  );
}
