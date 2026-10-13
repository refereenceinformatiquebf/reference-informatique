"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  createManualOrderAction,
  type ManualOrderState,
} from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { formatPrice } from "@/lib/format";
import { MAX_KEY_QUANTITY } from "@/lib/validations/order";

type ProductOption = {
  slug: string;
  name: string;
  price: number;
  physical: boolean;
  restricted: boolean;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Création…" : "Créer la commande"}
    </Button>
  );
}

export function ManualOrderForm({
  defaultEmail,
  products,
}: {
  defaultEmail: string;
  products: ProductOption[];
}) {
  const router = useRouter();
  const [state, action] = useActionState<ManualOrderState, FormData>(
    createManualOrderAction,
    undefined,
  );
  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const [quantity, setQuantity] = useState(1);
  const [markPaid, setMarkPaid] = useState(false);
  const product = products.find((item) => item.slug === slug);

  useEffect(() => {
    if (state?.ok && state.orderId)
      router.push(`/admin/commandes/${state.orderId}`);
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="clientEmail">
          Email du client (il doit avoir un compte)
        </Label>
        <Input
          id="clientEmail"
          name="clientEmail"
          type="email"
          defaultValue={defaultEmail}
          required
        />
        <FieldError message={state?.errors?.clientEmail?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_8rem]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="productSlug">Produit</Label>
          <Select
            id="productSlug"
            name="productSlug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          >
            {products.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} — {formatPrice(item.price)}
                {item.restricted ? " (réservé Burkina)" : ""}
              </option>
            ))}
          </Select>
          <FieldError message={state?.errors?.productSlug?.[0]} />
        </div>
        {product?.physical ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Nombre de clés</Label>
            <Select
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            >
              {Array.from({ length: MAX_KEY_QUANTITY }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>

      {product ? (
        <p className="text-ink-soft text-sm">
          Total :{" "}
          <strong className="text-ink tabular">
            {formatPrice(product.price * (product.physical ? quantity : 1))}
          </strong>{" "}
          (prix du catalogue).
        </p>
      ) : null}

      {product?.physical ? (
        <fieldset className="border-line flex flex-col gap-4 rounded-lg border p-4">
          <legend className="text-ink px-1 text-sm font-medium">
            Livraison
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" required />
              <FieldError message={state?.errors?.city?.[0]} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Téléphone de livraison</Label>
              <Input id="phone" name="phone" type="tel" required />
              <FieldError message={state?.errors?.phone?.[0]} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">Quartier et repère</Label>
            <Textarea id="address" name="address" rows={3} required />
            <FieldError message={state?.errors?.address?.[0]} />
          </div>
        </fieldset>
      ) : null}

      <label className="text-ink flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="markPaid"
          checked={markPaid}
          onChange={(event) => setMarkPaid(event.target.checked)}
          className="accent-brand h-4 w-4"
        />
        Le paiement a déjà été reçu (valider tout de suite)
      </label>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reason">
          {markPaid
            ? "Comment le paiement a-t-il été reçu ? (obligatoire)"
            : "Pourquoi cette commande ? (facultatif)"}
        </Label>
        <Textarea id="reason" name="reason" rows={2} required={markPaid} />
        <FieldError message={state?.errors?.reason?.[0]} />
      </div>

      {state && !state.ok ? <FieldError message={state.message} /> : null}
      <div>
        <Submit />
      </div>
    </form>
  );
}
