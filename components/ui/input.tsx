import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "border-line focus:border-brand w-full rounded-md border px-3 py-2 text-sm outline-none",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
