"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitOrder, type OrderFormState } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { IconPaiement, IconWhatsapp } from "@/components/icons";

function Actions() {
  const { pending, data } = useFormStatus();
  const intent = data?.get("intent");
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="submit"
        name="intent"
        value="online"
        size="lg"
        disabled={pending}
        className="w-full"
      >
        <IconPaiement size={18} />
        {pending && intent === "online"
          ? "Ouverture du paiement…"
          : "Payer en ligne maintenant"}
      </Button>
      <Button
        type="submit"
        name="intent"
        value="whatsapp"
        size="lg"
        variant="whatsapp"
        disabled={pending}
        className="w-full"
      >
        <IconWhatsapp size={18} />
        {pending && intent === "whatsapp"
          ? "Ouverture de WhatsApp…"
          : "Commander par WhatsApp"}
      </Button>
    </div>
  );
}

/**
 * Formulaire de commande. Pour un produit à livraison physique (clé USB), il
 * demande l'adresse de livraison ; pour un produit numérique, il se réduit
 * aux deux boutons de paiement.
 */
export function OrderForm({
  productSlug,
  needsShipping,
  defaultPhone,
}: {
  productSlug: string;
  needsShipping: boolean;
  defaultPhone?: string;
}) {
  const [state, action] = useActionState<OrderFormState, FormData>(
    submitOrder,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="productSlug" value={productSlug} />

      {needsShipping ? (
        <fieldset className="flex flex-col gap-5">
          <legend className="font-display text-ink mb-1 text-[1.25rem] leading-tight">
            Où devons-nous vous livrer ?
          </legend>
          <p className="text-ink-soft text-sm leading-relaxed">
            La livraison est gratuite. Ces informations servent uniquement à
            vous remettre votre clé.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                required
                aria-invalid={Boolean(state?.fieldErrors?.city)}
              />
              <FieldError message={state?.fieldErrors?.city?.[0]} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">
                Téléphone joignable (WhatsApp si possible)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={defaultPhone}
                placeholder="+226 XX XX XX XX"
                required
                aria-invalid={Boolean(state?.fieldErrors?.phone)}
              />
              <FieldError message={state?.fieldErrors?.phone?.[0]} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Quartier et repère</Label>
            <Textarea
              id="address"
              name="address"
              rows={3}
              required
              placeholder="Quartier, rue, un repère connu (station, école, marché…) ou « au bureau, à tel endroit »."
              aria-invalid={Boolean(state?.fieldErrors?.address)}
            />
            <FieldError message={state?.fieldErrors?.address?.[0]} />
          </div>
        </fieldset>
      ) : null}

      {state?.error ? (
        <p
          role="alert"
          className="bg-danger-bg text-danger-text rounded-lg px-4 py-3 text-sm leading-relaxed"
        >
          {state.error}
        </p>
      ) : null}

      <Actions />
    </form>
  );
}
