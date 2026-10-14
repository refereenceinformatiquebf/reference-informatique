"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { grantAccessAction } from "@/lib/actions/admin/access";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/admin/action";
import { Form } from "@/components/ui/form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enregistrement…" : "Donner l'accès"}
    </Button>
  );
}

/**
 * Donne l'accès à un produit sans commande. Sur la fiche d'un client,
 * `profileId` est fourni ; sur la page Accès, on saisit l'email du client.
 */
export function GrantAccessForm({
  products,
  profileId,
}: {
  products: { slug: string; name: string }[];
  profileId?: string;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(
    grantAccessAction,
    undefined,
  );
  const suffix = profileId ?? "page";
  return (
    <Form
      clearOnSuccess={state?.ok === true}
      action={action}
      className="flex flex-col gap-4"
    >
      {profileId ? (
        <input type="hidden" name="profileId" value={profileId} />
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!profileId ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`grant-email-${suffix}`}>Email du client</Label>
            <Input
              id={`grant-email-${suffix}`}
              name="email"
              type="email"
              required
              placeholder="client@exemple.com"
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`grant-product-${suffix}`}>Produit</Label>
          <Select id={`grant-product-${suffix}`} name="productSlug" required>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`grant-reason-${suffix}`}>Motif (journalisé)</Label>
        <Textarea
          id={`grant-reason-${suffix}`}
          name="reason"
          rows={2}
          required
          minLength={5}
          placeholder="Ex. : geste commercial, client de l'ancien site, correction après incident…"
        />
      </div>
      <label className="text-ink flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" className="accent-brand h-4 w-4" />
        Prévenir le client par email
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
