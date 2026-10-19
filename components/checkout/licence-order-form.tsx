"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitOrder, type OrderFormState } from "@/lib/actions/order";
import { buyerSchema } from "@/lib/validations/order";
import { suggestEmail } from "@/lib/checkout/rules";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Form } from "@/components/ui/form";
import { Honeypot } from "@/components/ui/honeypot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconCadenas, IconCoche, IconFleche } from "@/components/icons";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "phone";

/** Une adresse trop longue pour la ligne se coupe après le « @ » (espace de largeur
 * nulle), jamais au milieu du nom ou du domaine tant qu'une coupure propre existe. */
const breakableEmail = (email: string) => email.replace(/@/g, "@\u200B");

const STEPS = ["Vos informations", "Paiement"] as const;

function PayButton({ priceLabel }: { priceLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      <IconCadenas size={18} />
      {pending ? "Ouverture du paiement…" : `Payer ${priceLabel}`}
    </Button>
  );
}

function ProductRow({
  name,
  posterSrc,
  priceLabel,
}: {
  name: string;
  posterSrc?: string;
  priceLabel: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="border-line bg-paper-raised relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
        {posterSrc ? (
          <Image
            src={posterSrc}
            alt=""
            fill
            sizes="56px"
            className="object-contain"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-ink text-sm leading-snug font-medium break-words">
          {name}
        </p>
        <p className="font-display text-ink tabular mt-1 text-[1.125rem] leading-none">
          {priceLabel}
        </p>
      </div>
    </div>
  );
}

/**
 * Formulaire de commande d'un accès livré automatiquement (licence), en deux
 * étapes comme celui du pack Windows d'Expert du Numérique : 1) coordonnées,
 * 2) récapitulatif et paiement. Paiement en ligne uniquement : jamais de
 * commande par WhatsApp.
 *
 * Les champs saisis vivent dans l'état du composant ; des champs cachés les
 * portent jusqu'à l'action serveur (submitOrder), quelle que soit l'étape
 * affichée.
 */
export function LicenceOrderForm({
  productSlug,
  productName,
  posterSrc,
  priceLabel,
  buyer,
}: {
  productSlug: string;
  productName: string;
  posterSrc?: string;
  priceLabel: string;
  /** Visiteur connecté : son email n'est pas modifiable ici. */
  buyer: { email?: string; name?: string; phone?: string };
}) {
  const [state, action] = useActionState<OrderFormState, FormData>(
    submitOrder,
    undefined,
  );
  const signedIn = Boolean(buyer.email);
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState(buyer.name ?? "");
  const [email, setEmail] = useState(buyer.email ?? "");
  const [phone, setPhone] = useState(buyer.phone ?? "");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const hint = signedIn ? null : suggestEmail(email);

  // Mêmes règles que le serveur (buyerSchema) : une faute est signalée tout de
  // suite, sans aller-retour réseau.
  const goNext = () => {
    const parsed = buyerSchema.safeParse({ name, email, phone });
    const fields: Partial<Record<Field, string[]>> = parsed.success
      ? {}
      : parsed.error.flatten().fieldErrors;
    // Le numéro est obligatoire ici (assistance WhatsApp) ; buyerSchema le laisse
    // facultatif, il ne contrôle que son format.
    const phoneError =
      fields.phone?.[0] ??
      (phone.trim() === "" ? "Indiquez votre numéro WhatsApp." : undefined);
    if (!parsed.success || phoneError) {
      setErrors({
        name: fields.name?.[0],
        email: fields.email?.[0],
        phone: phoneError,
      });
      return;
    }
    setErrors({});
    setStep(1);
  };

  const serverMessages = [
    ...(state?.error ? [state.error] : []),
    ...Object.values(state?.fieldErrors ?? {}).flat(),
  ];

  return (
    <Form
      action={action}
      onSubmit={(event) => {
        // Entrée dans un champ de l'étape 1 : on passe à l'étape 2, on ne paie pas.
        if (step === 0) {
          event.preventDefault();
          goNext();
        }
      }}
      className="flex min-w-0 flex-col gap-6"
    >
      <input type="hidden" name="productSlug" value={productSlug} />
      <input type="hidden" name="intent" value="online" />
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="phone" value={phone} />
      {signedIn ? null : <input type="hidden" name="email" value={email} />}
      <Honeypot />

      <ol
        className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
        aria-label="Étapes"
      >
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                index < step
                  ? "bg-success text-white"
                  : index === step
                    ? "bg-brand text-brand-contrast"
                    : "bg-line text-ink-soft",
              )}
            >
              {index < step ? <IconCoche size={14} /> : index + 1}
            </span>
            <span
              className={cn(
                index <= step ? "text-ink font-medium" : "text-ink-faint",
              )}
            >
              {label}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "mx-1 h-px w-8 sm:w-12",
                  index < step ? "bg-success" : "bg-line-strong",
                )}
              />
            ) : null}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <>
          <div className="border-line bg-paper shadow-card rounded-xl border p-4 lg:hidden">
            <ProductRow
              name={productName}
              posterSrc={posterSrc}
              priceLabel={priceLabel}
            />
          </div>

          <section className="border-line bg-paper shadow-card min-w-0 rounded-xl border p-5 sm:p-6">
            <h2 className="font-display text-ink text-[1.25rem] leading-tight">
              Vos informations
            </h2>
            <p className="text-ink-soft mt-1 text-sm leading-relaxed">
              {signedIn ? (
                <>
                  Vous commandez avec votre compte{" "}
                  <strong className="text-ink break-all">{buyer.email}</strong>.
                </>
              ) : (
                "Aucun compte à créer."
              )}
            </p>

            <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="co-name">Nom complet</Label>
                <Input
                  id="co-name"
                  autoComplete="name"
                  placeholder="Prénom Nom"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                <FieldError message={errors.name} />
              </div>

              <div className="flex min-w-0 flex-col gap-1.5">
                <Label htmlFor="co-phone">Téléphone (WhatsApp)</Label>
                <Input
                  id="co-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+226 XX XX XX XX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  aria-invalid={Boolean(errors.phone)}
                />
                <FieldError message={errors.phone} />
              </div>

              {signedIn ? null : (
                <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="co-email">Adresse email</Label>
                  <Input
                    id="co-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby="co-email-help"
                  />
                  <FieldError message={errors.email} />
                  {hint ? (
                    <p role="status" className="text-warning-text text-sm">
                      Vouliez-vous écrire{" "}
                      <button
                        type="button"
                        onClick={() => setEmail(hint)}
                        className="font-semibold break-all underline underline-offset-4"
                      >
                        {hint}
                      </button>{" "}
                      ?
                    </p>
                  ) : null}
                  <p id="co-email-help" className="text-ink-faint text-xs">
                    Votre pack est envoyé à cette adresse : vérifiez-la bien.
                  </p>
                </div>
              )}
            </div>

            <Button
              type="button"
              size="lg"
              onClick={goNext}
              className="mt-6 w-full sm:w-auto"
            >
              Continuer
              <IconFleche size={18} />
            </Button>
          </section>
        </>
      ) : (
        <section className="border-line bg-paper shadow-card min-w-0 rounded-xl border p-5 sm:p-6">
          <h2 className="font-display text-ink text-[1.25rem] leading-tight">
            Récapitulatif de votre commande
          </h2>

          <div className="mt-5">
            <ProductRow
              name={productName}
              posterSrc={posterSrc}
              priceLabel={priceLabel}
            />
          </div>

          <dl className="border-line mt-5 flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <dt className="text-ink-soft shrink-0">Nom</dt>
              <dd className="text-ink ml-auto min-w-0 text-right font-medium [overflow-wrap:anywhere]">
                {name}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <dt className="text-ink-soft shrink-0">Email</dt>
              <dd className="text-ink ml-auto min-w-0 text-right font-medium [overflow-wrap:anywhere]">
                {breakableEmail(email)}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <dt className="text-ink-soft shrink-0">WhatsApp</dt>
              <dd className="text-ink ml-auto min-w-0 text-right font-medium [overflow-wrap:anywhere]">
                {phone}
              </dd>
            </div>
          </dl>

          <div className="bg-brand-50 mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg px-4 py-3">
            <span className="text-ink font-semibold whitespace-nowrap">
              Total à payer
            </span>
            <span className="font-display text-brand-700 tabular text-[1.5rem] leading-none">
              {priceLabel}
            </span>
          </div>
          <p className="text-ink-soft mt-3 text-sm leading-relaxed">
            Votre pack est envoyé à{" "}
            <strong className="text-ink [overflow-wrap:anywhere]">
              {breakableEmail(email)}
            </strong>{" "}
            dès la confirmation du paiement.
          </p>

          {serverMessages.length > 0 ? (
            <div
              role="alert"
              className="bg-danger-bg text-danger-text mt-4 flex flex-col gap-1 rounded-lg px-4 py-3 text-sm leading-relaxed"
            >
              {serverMessages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3">
            <PayButton priceLabel={priceLabel} />
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(0)}
              className="w-full"
            >
              Modifier mes informations
            </Button>
          </div>
        </section>
      )}
    </Form>
  );
}
