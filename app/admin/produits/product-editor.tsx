"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  saveProductAction,
  type ProductSaveState,
} from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import {
  COVER_TONES,
  DELIVERY_MODES,
  ICON_KEYS,
  PRODUCT_KIND_VALUES,
} from "@/lib/catalog/types";
import { PRODUCT_KINDS } from "@/lib/catalog/kinds";
import { FACT_ROWS, type ProductFormValues } from "@/lib/catalog/form";
import { formatPrice } from "@/lib/format";
import { Form } from "@/components/ui/form";

export type EditorCommercial = {
  price: number;
  compareAtPrice: number | null;
  /** Valeur pour <input type="datetime-local"> (heure du site) ou "". */
  promoEndsAt: string;
  badge: string;
  active: boolean;
  displayOrder: number;
};

const DELIVERY_LABELS: Record<(typeof DELIVERY_MODES)[number], string> = {
  "cle-physique": "Clé USB livrée chez le client (+ accès plateforme)",
  numerique: "Accès numérique dans l'espace client (PDF, fichiers)",
  manuel: "Remise par l'équipe sur WhatsApp après paiement",
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-line bg-paper shadow-card rounded-xl border p-4 sm:p-5">
      <h2 className="font-display text-ink text-[1.25rem] leading-tight">
        {title}
      </h2>
      {hint ? <p className="text-ink-faint mt-1 text-sm">{hint}</p> : null}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {help ? (
        <p className="text-ink-faint text-xs leading-relaxed">{help}</p>
      ) : null}
      <FieldError message={error} />
    </div>
  );
}

/**
 * Éditeur de produit : prix et visibilité, présentation, affiche, contenu,
 * référencement. Sert à créer un produit (`existingSlug` absent) comme à
 * modifier un produit du catalogue ou de l'administration.
 */
export function ProductEditor({
  existingSlug,
  values,
  commercial,
  source,
  originallyRestricted,
  currentPosterUrl,
  currentPosterAlt,
}: {
  existingSlug?: string;
  values: ProductFormValues;
  commercial: EditorCommercial;
  source: "CODE" | "ADMIN";
  /** Le produit du catalogue est-il réservé à un pays (les clés) ? */
  originallyRestricted: boolean;
  currentPosterUrl?: string;
  currentPosterAlt?: string;
}) {
  const router = useRouter();
  const [state, action] = useActionState<ProductSaveState, FormData>(
    saveProductAction,
    undefined,
  );
  const [restrictedBF, setRestrictedBF] = useState(values.restrictedToBF);
  const [price, setPrice] = useState(String(commercial.price));
  const [compareAt, setCompareAt] = useState(
    commercial.compareAtPrice ? String(commercial.compareAtPrice) : "",
  );
  const [promoEnds, setPromoEnds] = useState(commercial.promoEndsAt);
  const e = state?.errors ?? {};
  const creating = !existingSlug;

  useEffect(() => {
    if (state?.ok && creating && state.slug) {
      router.push(`/admin/produits/${state.slug}`);
    }
  }, [state, creating, router]);

  const priceNumber = Number(price);
  const compareNumber = Number(compareAt);
  const discount =
    compareNumber > priceNumber && priceNumber > 0
      ? Math.round(((compareNumber - priceNumber) / compareNumber) * 100)
      : null;

  return (
    <Form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="existingSlug" value={existingSlug ?? ""} />
      {/* Le témoignage se gère dans « Témoignages » ; on conserve celui du produit tel quel. */}
      <input
        type="hidden"
        name="testimonialQuote"
        value={values.testimonialQuote}
      />
      <input
        type="hidden"
        name="testimonialAuthor"
        value={values.testimonialAuthor}
      />
      <input
        type="hidden"
        name="testimonialCity"
        value={values.testimonialCity}
      />

      {state && !state.ok ? (
        <p
          role="alert"
          className="bg-danger-bg text-danger-text rounded-lg px-4 py-3 text-sm leading-relaxed"
        >
          {state.message}
        </p>
      ) : null}
      {creating ? (
        <Section
          title="Adresse du produit"
          hint="L'adresse de la fiche : reference-informatique.com/boutique/…  Elle ne pourra plus changer."
        >
          <Field
            id="slug"
            label="Adresse (lettres minuscules, chiffres, tirets)"
            error={e.slug}
          >
            <Input
              id="slug"
              name="slug"
              required
              placeholder="mon-nouveau-guide"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              aria-invalid={Boolean(e.slug)}
            />
          </Field>
        </Section>
      ) : null}

      <Section
        title="Prix et visibilité"
        hint="Le prix est entier, en F CFA. Le client paie exactement ce prix : vous prenez les frais de paiement à votre charge."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="price" label="Prix de vente (F CFA)" error={e.price}>
            <Input
              id="price"
              name="price"
              type="number"
              min={100}
              step={1}
              required
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              aria-invalid={Boolean(e.price)}
            />
          </Field>
          <Field
            id="compareAtPrice"
            label="Ancien prix barré (facultatif)"
            help="N'indiquez que le prix réellement pratiqué avant. Laissez vide s'il n'y a pas d'offre."
            error={e.compareAtPrice}
          >
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min={100}
              step={1}
              value={compareAt}
              onChange={(event) => setCompareAt(event.target.value)}
              aria-invalid={Boolean(e.compareAtPrice)}
            />
          </Field>
        </div>

        {compareAt ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="promoEndsAt"
              label="Fin de l'offre (date et heure)"
              help="Passé ce moment, le prix revient automatiquement à l'ancien prix et la remise disparaît. Laissez vide pour une remise permanente."
              error={e.promoEndsAt}
            >
              <Input
                id="promoEndsAt"
                name="promoEndsAt"
                type="datetime-local"
                value={promoEnds}
                onChange={(event) => setPromoEnds(event.target.value)}
              />
            </Field>
            <div className="text-ink-soft self-end text-sm leading-relaxed">
              {discount ? (
                <p>
                  Affichage :{" "}
                  <strong className="text-ink">
                    {formatPrice(priceNumber)}
                  </strong>{" "}
                  au lieu de{" "}
                  <span className="line-through">
                    {formatPrice(compareNumber)}
                  </span>{" "}
                  (−{discount}&nbsp;%).
                </p>
              ) : (
                <p className="text-danger-text">
                  L&apos;ancien prix doit être supérieur au prix de vente.
                </p>
              )}
              {!promoEnds ? (
                <p className="text-warning-text mt-1">
                  Sans date de fin, cette remise est permanente.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <input type="hidden" name="promoEndsAt" value="" />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="badge"
            label="Mention sur la carte (facultatif)"
            help="Courte et vraie : « Nouveau », « Offre la plus complète »…"
            error={e.badge}
          >
            <Input
              id="badge"
              name="badge"
              defaultValue={commercial.badge}
              maxLength={40}
            />
          </Field>
          <Field
            id="displayOrder"
            label="Ordre dans la boutique"
            help="Plus le nombre est petit, plus le produit est haut."
            error={e.displayOrder}
          >
            <Input
              id="displayOrder"
              name="displayOrder"
              type="number"
              min={0}
              defaultValue={commercial.displayOrder}
            />
          </Field>
        </div>

        <label className="text-ink flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            defaultChecked={commercial.active}
            className="accent-brand h-4 w-4"
          />
          Visible sur le site
        </label>
      </Section>

      <Section title="Présentation">
        <Field id="name" label="Nom du produit" error={e.name}>
          <Input
            id="name"
            name="name"
            defaultValue={values.name}
            required
            maxLength={140}
          />
        </Field>
        <Field
          id="tagline"
          label="Promesse (une phrase sous le titre de la fiche)"
          error={e.tagline}
        >
          <Input
            id="tagline"
            name="tagline"
            defaultValue={values.tagline}
            required
            maxLength={240}
          />
        </Field>
        <Field
          id="summary"
          label="Texte de la carte produit"
          help="130 caractères environ."
          error={e.summary}
        >
          <Textarea
            id="summary"
            name="summary"
            rows={2}
            defaultValue={values.summary}
            required
            maxLength={200}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="kind" label="Famille" error={e.kind}>
            <Select id="kind" name="kind" defaultValue={values.kind}>
              {PRODUCT_KIND_VALUES.map((kind) => (
                <option key={kind} value={kind}>
                  {PRODUCT_KINDS[kind].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            id="delivery"
            label="Comment le client le reçoit"
            error={e.delivery}
          >
            <Select
              id="delivery"
              name="delivery"
              defaultValue={values.delivery}
            >
              {DELIVERY_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {DELIVERY_LABELS[mode]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section
        title="Pays"
        hint="Un produit réservé à un pays est invisible, introuvable et impossible à commander depuis les autres pays."
      >
        <label className="text-ink flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="restrictedToBF"
            checked={restrictedBF}
            onChange={(event) => setRestrictedBF(event.target.checked)}
            className="accent-brand h-4 w-4"
          />
          Réservé aux visiteurs du Burkina Faso
        </label>
        <Field
          id="restrictedOther"
          label="Autres pays autorisés (codes à 2 lettres, séparés par des virgules)"
          help="Ex. : CI, SN. Laissez vide si seul le Burkina Faso est concerné ou si le produit est ouvert à tous."
          error={e.restrictedTo}
        >
          <Input
            id="restrictedOther"
            name="restrictedOther"
            defaultValue={values.restrictedOther}
          />
        </Field>
        {originallyRestricted && !restrictedBF ? (
          <label className="bg-warning-bg text-warning-text flex items-start gap-2 rounded-lg px-3 py-3 text-sm leading-snug">
            <input
              type="checkbox"
              name="confirmRestriction"
              className="accent-brand mt-0.5 h-4 w-4 shrink-0"
            />
            Je comprends que ce produit, réservé jusqu&apos;ici au Burkina Faso,
            deviendra visible et achetable dans le monde entier.
          </label>
        ) : null}
      </Section>

      <Section
        title="Affiche et couverture"
        hint="L'affiche est redimensionnée (1 200 px) et convertie en WebP. Sans affiche, une couverture générée aux couleurs de la charte est affichée."
      >
        {currentPosterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentPosterUrl}
            alt={currentPosterAlt ?? ""}
            className="border-line max-h-56 w-auto rounded-lg border object-contain"
          />
        ) : null}
        <Field
          id="poster"
          label={
            currentPosterUrl ? "Remplacer l'affiche" : "Ajouter une affiche"
          }
          help="JPEG, PNG ou WebP, 4 Mo maximum."
          error={e.poster}
        >
          <input
            id="poster"
            name="poster"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="text-ink-soft text-sm"
          />
        </Field>
        <Field
          id="posterAlt"
          label="Description de l'affiche (pour les malvoyants et Google)"
          help="Décrivez ce que l'on voit. Obligatoire pour afficher l'affiche."
        >
          <Input
            id="posterAlt"
            name="posterAlt"
            defaultValue={values.posterAlt}
            maxLength={200}
          />
        </Field>
        {currentPosterUrl ? (
          <label className="text-ink-soft flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="removePoster"
              className="accent-brand h-4 w-4"
            />
            Retirer l&apos;affiche
          </label>
        ) : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="coverTone" label="Teinte de la couverture générée">
            <Select
              id="coverTone"
              name="coverTone"
              defaultValue={values.coverTone}
            >
              {COVER_TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="coverMotif" label="Pictogramme de la couverture">
            <Select
              id="coverMotif"
              name="coverMotif"
              defaultValue={values.coverMotif}
            >
              {ICON_KEYS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section
        title="Contenu de la fiche"
        hint="Écrivez comme vous parleriez à un client. Aucun chiffre, aucune promesse, aucune garantie qui ne soit vrai."
      >
        <Field
          id="story"
          label="Le récit (séparez les paragraphes par une ligne vide)"
          help="Le problème du client, ce que le produit change, comment ça marche."
          error={e.story}
        >
          <Textarea
            id="story"
            name="story"
            rows={9}
            defaultValue={values.story}
            required
          />
        </Field>
        <Field
          id="highlights"
          label="Ce que le client obtient (une ligne par point)"
          error={e.highlights}
        >
          <Textarea
            id="highlights"
            name="highlights"
            rows={7}
            defaultValue={values.highlights}
            required
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <Label>
            Pastilles d&apos;information rapide (jusqu&apos;à {FACT_ROWS})
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {values.facts.map((fact, index) => (
              <div key={index} className="grid grid-cols-[8.5rem_1fr] gap-2">
                <Select
                  name={`factIcon${index}`}
                  defaultValue={fact.icon}
                  aria-label={`Pictogramme de la pastille ${index + 1}`}
                >
                  <option value="">—</option>
                  {ICON_KEYS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </Select>
                <Input
                  name={`factLabel${index}`}
                  defaultValue={fact.label}
                  placeholder="Ex. : Livraison gratuite"
                  aria-label={`Texte de la pastille ${index + 1}`}
                  maxLength={60}
                />
              </div>
            ))}
          </div>
          <FieldError message={e.facts} />
        </div>
        <Field
          id="contents"
          label="Contenu détaillé (facultatif)"
          help={
            "Un groupe par titre « ## Titre », puis un élément par ligne « - Nom | détail facultatif »."
          }
          error={e.contents}
        >
          <Textarea
            id="contents"
            name="contents"
            rows={10}
            defaultValue={values.contents}
            className="font-mono text-[0.8125rem]"
          />
        </Field>
        <Field
          id="forWho"
          label="Pour qui (une ligne par profil)"
          error={e.forWho}
        >
          <Textarea
            id="forWho"
            name="forWho"
            rows={5}
            defaultValue={values.forWho}
            required
          />
        </Field>
        <Field
          id="notForWho"
          label="Pour qui ce n'est pas adapté (facultatif, une ligne par profil)"
          help="Dire à qui le produit ne convient pas rassure, et évite les déçus."
        >
          <Textarea
            id="notForWho"
            name="notForWho"
            rows={3}
            defaultValue={values.notForWho}
          />
        </Field>
        <Field
          id="faq"
          label="Questions fréquentes"
          help={
            "Pour chaque question : une ligne « Q: la question » puis une ligne « R: la réponse ». Séparez les questions par une ligne vide."
          }
          error={e.faq}
        >
          <Textarea
            id="faq"
            name="faq"
            rows={12}
            defaultValue={values.faq}
            className="font-mono text-[0.8125rem]"
          />
        </Field>
      </Section>

      <Section title="Référencement Google et partages">
        <Field
          id="seoTitle"
          label="Titre pour Google"
          help="60 à 70 caractères idéalement."
          error={e["seo.title"]}
        >
          <Input
            id="seoTitle"
            name="seoTitle"
            defaultValue={values.seoTitle}
            required
            maxLength={90}
          />
        </Field>
        <Field
          id="seoDescription"
          label="Description pour Google"
          help="150 à 160 caractères idéalement."
          error={e["seo.description"]}
        >
          <Textarea
            id="seoDescription"
            name="seoDescription"
            rows={3}
            defaultValue={values.seoDescription}
            required
            maxLength={200}
          />
        </Field>
      </Section>

      <div className="bg-paper-raised sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 px-4 py-4 sm:-mx-6 sm:px-6">
        <Submit
          label={
            creating ? "Créer le produit" : "Enregistrer les modifications"
          }
        />
        {source === "CODE" && !state ? (
          <p className="text-ink-faint text-xs leading-relaxed">
            Produit du catalogue : après le premier enregistrement, c&apos;est
            cette page qui fait foi pour lui.
          </p>
        ) : null}
        {state?.ok ? (
          <p role="status" className="text-success-text text-sm">
            {state.message}
          </p>
        ) : null}
      </div>
    </Form>
  );
}
