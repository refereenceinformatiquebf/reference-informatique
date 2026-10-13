import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Boutons de la charte Boulga AI : rayon 8 px, DM Sans medium, survol
 * scale(1.02) + légère hausse de luminosité (200 ms standard).
 *  - primary   : bleu Boulga plein — l'action principale d'une vue
 *  - outline   : contour bleu — action secondaire
 *  - ghost     : contour neutre — action tertiaire (Annuler…)
 *  - danger    : rouge — action destructive
 *  - whatsapp  : vert WhatsApp — réservé aux actions WhatsApp
 *  - inverse   : blanc plein — sur fond marine/bleu (héros, bandeaux)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[transform,filter,background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-standard)] hover:scale-[1.02] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55 focus-visible:shadow-[var(--focus-halo)] focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-contrast hover:brightness-110",
        outline:
          "border-brand text-brand-text hover:bg-brand-50 border bg-transparent",
        ghost:
          "border-line text-ink-soft hover:text-ink hover:bg-paper border bg-transparent",
        danger: "bg-danger text-white hover:brightness-110",
        whatsapp: "bg-green-600 text-white hover:brightness-110",
        inverse: "text-brand-900 bg-white hover:bg-brand-50",
      },
      size: {
        sm: "h-9 px-3.5 text-[0.8125rem]",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Rend le style du bouton sur son enfant direct (ex. un <Link>) au
     * lieu d'un <button> — évite d'imbriquer un <a> dans un <button>. */
    asChild?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
