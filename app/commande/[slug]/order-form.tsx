"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitOrder, type OrderFormState } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatPrice } from "@/lib/format";
import { MAX_KEY_QUANTITY } from "@/lib/validations/order";
import { suggestEmail } from "@/lib/checkout/rules";
import { FieldError } from "@/components/ui/field-error";
import { IconPaiement, IconWhatsapp } from "@/components/icons";
import { Form } from "@/components/ui/form";
import { Honeypot } from "@/components/ui/honeypot";

function Actions({ allowWhatsapp }: { allowWhatsapp: boolean }) {
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
      {allowWhatsapp ? (
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
      ) : null}
    </div>
  );
}

type Buyer = {
  /** Visiteur connecté : son email n'est pas modifiable ici. */
  email?: string;
  name?: string;
  phone?: string;
};

/**
 * Formulaire de commande, SANS compte obligatoire : nom, email (où part le
 * lien d'accès) et téléphone. Un visiteur connecté voit ses informations
 * déjà remplies. Pour une clé USB, il demande en plus l'adresse de livraison.
 */
export function OrderForm({
  productSlug,
  needsShipping,
  phoneRequired,
  buyer,
  unitPrice,
  allowWhatsapp = true,
}: {
  productSlug: string;
  needsShipping: boolean;
  /** Le téléphone est indispensable (clé, remise manuelle) ou facultatif. */
  phoneRequired: boolean;
  buyer: Buyer;
  /** Prix d'une unité, pour l'affichage du total (le serveur recalcule). */
  unitPrice: number;
  /** Faux : la commande se fait uniquement en ligne (accès livré automatiquement). */
  allowWhatsapp?: boolean;
}) {
  const [state, action] = useActionState<OrderFormState, FormData>(
    submitOrder,
    undefined,
  );
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const signedIn = Boolean(buyer.email);
  const hint = signedIn ? null : suggestEmail(email);
  const errors = state?.fieldErrors;

  return (
    <Form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="productSlug" value={productSlug} />
      <Honeypot />

      <fieldset className="flex flex-col gap-5">
        <legend className="font-display text-ink mb-1 text-[1.25rem] leading-tight">
          Vos coordonnées
        </legend>
        <p className="text-ink-soft text-sm leading-relaxed">
          {signedIn ? (
            <>
              Vous commandez avec votre compte{" "}
              <strong className="text-ink">{buyer.email}</strong>.
            </>
          ) : (
            <>
              <strong className="text-ink">Aucun compte à créer.</strong> Votre
              lien d&apos;accès est envoyé à l&apos;email indiqué ci-dessous,
              dès que le paiement est confirmé.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              defaultValue={buyer.name}
              required
              aria-invalid={Boolean(errors?.name)}
            />
            <FieldError message={errors?.name?.[0]} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">
              Téléphone (WhatsApp)
              {phoneRequired ? "" : " — facultatif"}
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={buyer.phone}
              placeholder="+226 XX XX XX XX"
              required={phoneRequired}
              aria-invalid={Boolean(errors?.phone)}
            />
            <FieldError message={errors?.phone?.[0]} />
          </div>
        </div>

        {signedIn ? null : (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vous@exemple.com"
              required
              aria-invalid={Boolean(errors?.email)}
              aria-describedby="email-help"
            />
            <FieldError message={errors?.email?.[0]} />
            {hint ? (
              <p role="status" className="text-warning-text text-sm">
                Vouliez-vous écrire{" "}
                <button
                  type="button"
                  onClick={() => setEmail(hint)}
                  className="font-semibold underline underline-offset-4"
                >
                  {hint}
                </button>{" "}
                ?
              </p>
            ) : null}
            <p id="email-help" className="text-ink-faint text-xs">
              Vérifiez-la bien : c&apos;est là que vous recevez votre accès et
              votre reçu.
            </p>
          </div>
        )}
      </fieldset>

      {needsShipping ? (
        <fieldset className="flex flex-col gap-5">
          <legend className="font-display text-ink mb-1 text-[1.25rem] leading-tight">
            Où devons-nous vous livrer ?
          </legend>
          <p className="text-ink-soft text-sm leading-relaxed">
            La livraison est gratuite. Ces informations servent uniquement à
            vous remettre votre clé.
          </p>

          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              required
              aria-invalid={Boolean(errors?.city)}
            />
            <FieldError message={errors?.city?.[0]} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Quartier et repère</Label>
            <Textarea
              id="address"
              name="address"
              rows={3}
              required
              placeholder="Quartier, rue, un repère connu (station, école, marché…) ou « au bureau, à tel endroit »."
              aria-invalid={Boolean(errors?.address)}
            />
            <FieldError message={errors?.address?.[0]} />
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor="quantity">Nombre de clés</Label>
            <Select
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              aria-invalid={Boolean(errors?.quantity)}
            >
              {Array.from({ length: MAX_KEY_QUANTITY }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </Select>
            <FieldError message={errors?.quantity?.[0]} />
            <p className="text-ink-soft text-sm">
              Total à payer :{" "}
              <strong className="text-ink tabular">
                {formatPrice(unitPrice * quantity)}
              </strong>
              {quantity > 1 ? " — livrées ensemble, à la même adresse." : ""}
            </p>
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

      <Actions allowWhatsapp={allowWhatsapp} />
    </Form>
  );
}
