"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveTestimonialAction,
  type TestimonialState,
} from "@/lib/actions/admin/testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { Form } from "@/components/ui/form";

type Initial = {
  id?: string;
  authorName: string;
  authorCity: string;
  quote: string;
  rating: number;
  displayOrder: number;
  productSlug: string;
  published: boolean;
  featured: boolean;
};

export const EMPTY_TESTIMONIAL: Initial = {
  authorName: "",
  authorCity: "",
  quote: "",
  rating: 5,
  displayOrder: 0,
  productSlug: "",
  published: false,
  featured: false,
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

export function TestimonialForm({
  initial,
  products,
}: {
  initial: Initial;
  products: { slug: string; name: string }[];
}) {
  const [state, action] = useActionState<TestimonialState, FormData>(
    saveTestimonialAction,
    undefined,
  );
  const key = initial.id ?? "new";
  const fe = state?.errors;
  return (
    <Form
      clearOnSuccess={!initial.id && state?.ok === true}
      action={action}
      className="flex flex-col gap-4"
    >
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`t-author-${key}`}>Nom affiché</Label>
          <Input
            id={`t-author-${key}`}
            name="authorName"
            defaultValue={initial.authorName}
            required
            placeholder="Ex. : Awa K."
          />
          <FieldError message={fe?.authorName?.[0]} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`t-city-${key}`}>Ville (facultatif)</Label>
          <Input
            id={`t-city-${key}`}
            name="authorCity"
            defaultValue={initial.authorCity}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`t-quote-${key}`}>
          Message du client, tel que reçu
        </Label>
        <Textarea
          id={`t-quote-${key}`}
          name="quote"
          rows={4}
          defaultValue={initial.quote}
          required
        />
        <FieldError message={fe?.quote?.[0]} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`t-product-${key}`}>Produit concerné</Label>
          <Select
            id={`t-product-${key}`}
            name="productSlug"
            defaultValue={initial.productSlug}
          >
            <option value="">Aucun (message général)</option>
            {products.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`t-rating-${key}`}>Note</Label>
          <Select
            id={`t-rating-${key}`}
            name="rating"
            defaultValue={String(initial.rating)}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} / 5
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`t-order-${key}`}>Ordre (0 = en premier)</Label>
          <Input
            id={`t-order-${key}`}
            name="displayOrder"
            type="number"
            min={0}
            defaultValue={initial.displayOrder}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="text-ink flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={initial.published}
            className="accent-brand h-4 w-4"
          />
          Publié sur le site
        </label>
        <label className="text-ink flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial.featured}
            className="accent-brand h-4 w-4"
          />
          Mis en avant à l&apos;accueil
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-ink flex items-start gap-2 text-sm leading-snug">
          <input
            type="checkbox"
            name="consent"
            required
            defaultChecked={Boolean(initial.id)}
            className="accent-brand mt-0.5 h-4 w-4 shrink-0"
          />
          Je confirme que ce message est authentique (reçu d&apos;un vrai
          client) et que ce client accepte qu&apos;il soit publié.
        </label>
        <FieldError message={fe?.consent?.[0]} />
      </div>

      <div className="flex items-center gap-3">
        <Submit label={initial.id ? "Enregistrer" : "Ajouter le témoignage"} />
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
