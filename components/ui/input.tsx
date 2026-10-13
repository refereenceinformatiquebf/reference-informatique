import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Champ de la charte : focus = bordure bleue + halo 3 px, erreur = bordure rouge. */
export const fieldClasses =
  "border-line-strong bg-paper text-ink placeholder:text-ink-faint focus:border-brand aria-[invalid=true]:border-danger w-full rounded-md border px-3.5 py-2.5 text-sm transition-[border-color,box-shadow] duration-100 outline-none focus:shadow-[var(--focus-halo)]";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return <input ref={ref} className={cn(fieldClasses, className)} {...props} />;
});
Input.displayName = "Input";
