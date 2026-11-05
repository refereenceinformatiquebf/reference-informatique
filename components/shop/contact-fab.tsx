"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { IconCroix, IconWhatsapp } from "@/components/icons";
import { useCurrentProfile } from "@/components/marketing/use-current-profile";
import { META_CURRENCY, trackMeta } from "@/lib/meta-pixel";
import {
  supportPaidFromSalesPageMessage,
  supportPayOnWhatsappMessage,
  supportWhatsappLink,
} from "@/lib/support";
import { cn } from "@/lib/utils";

type Intent = "deja_paye" | "payer_whatsapp";

/**
 * Bouton « Contactez-nous » de la page de vente : une pastille verte fixe, au-dessus
 * de la barre d'achat, qui ouvre un court panneau. Le panneau pousse d'abord à
 * commander ; les deux accès WhatsApp (déjà payé / payer avec nous) ouvrent
 * l'assistance dédiée du pack avec un message prérempli. Il ne s'ouvre jamais
 * tout seul et n'affiche aucun numéro.
 */
export function ContactFab({
  productSlug,
  productName,
  priceLabel,
  value,
  orderHref,
}: {
  productSlug: string;
  productName: string;
  priceLabel: string;
  /** Prix en F CFA, pour le pixel publicitaire. */
  value: number;
  orderHref: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const close = () => {
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const track = (intent: Intent) => {
    trackMeta("Contact", {
      content_name: productName,
      content_ids: [productSlug],
      value,
      currency: META_CURRENCY,
      intent,
    });
    setOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-3 sm:right-6"
    >
      {open ? (
        <ContactPanel
          panelRef={panelRef}
          productName={productName}
          priceLabel={priceLabel}
          orderHref={orderHref}
          onClose={() => {
            setOpen(false);
            buttonRef.current?.focus();
          }}
          onWhatsapp={track}
        />
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="contact-panel"
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex min-h-12 items-center gap-2 rounded-full bg-green-700 px-4 text-sm font-medium text-white shadow-lg",
          "transition-[transform,filter] duration-200 hover:scale-[1.03] hover:brightness-110 active:scale-[0.99]",
          "focus-visible:shadow-[var(--focus-halo)] focus-visible:outline-none motion-reduce:transition-none",
        )}
      >
        <IconWhatsapp size={22} />
        Contactez-nous
      </button>
    </div>
  );
}

/**
 * Contenu du panneau. Séparé du bouton pour que la lecture du compte (nom
 * prérempli) ne se fasse qu'à l'ouverture, jamais au chargement de la page.
 */
function ContactPanel({
  panelRef,
  productName,
  priceLabel,
  orderHref,
  onClose,
  onWhatsapp,
}: {
  panelRef: RefObject<HTMLDivElement | null>;
  productName: string;
  priceLabel: string;
  orderHref: string;
  onClose: () => void;
  onWhatsapp: (intent: Intent) => void;
}) {
  const { profile } = useCurrentProfile();
  const name = profile?.name ?? null;

  return (
    <div
      ref={panelRef}
      id="contact-panel"
      role="dialog"
      aria-label="Contactez-nous"
      tabIndex={-1}
      className="border-line bg-paper shadow-card max-h-[calc(100dvh-12rem)] w-[min(calc(100vw-2rem),22rem)] overflow-y-auto overscroll-contain rounded-xl border p-4 focus:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-ink text-[1.125rem] leading-tight">
          Contactez-nous
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="text-ink-soft hover:text-ink -m-2 flex size-11 shrink-0 items-center justify-center rounded-md focus-visible:shadow-[var(--focus-halo)] focus-visible:outline-none"
        >
          <IconCroix size={18} />
        </button>
      </div>
      <p className="text-ink-soft mt-2 text-sm leading-relaxed">
        Vous n&apos;avez pas encore payé ? Nous vous recommandons de passer
        votre commande : votre pack est livré dès la confirmation du paiement.
        Et si vous avez besoin d&apos;assistance, écrivez-nous.
      </p>
      <div className="mt-4 flex flex-col gap-2.5">
        <Button asChild size="lg" className="w-full">
          <Link href={orderHref}>Commander maintenant</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full justify-start text-left [&_svg]:shrink-0"
        >
          <a
            href={supportWhatsappLink(supportPaidFromSalesPageMessage(name))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWhatsapp("deja_paye")}
          >
            <IconWhatsapp size={18} />
            J&apos;ai payé et j&apos;ai besoin d&apos;assistance
          </a>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="w-full justify-start text-left [&_svg]:shrink-0"
        >
          <a
            href={supportWhatsappLink(
              supportPayOnWhatsappMessage(productName, priceLabel, name),
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWhatsapp("payer_whatsapp")}
          >
            <IconWhatsapp size={18} />
            Je veux payer sur WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
