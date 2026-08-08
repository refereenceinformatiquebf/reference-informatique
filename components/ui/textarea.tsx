import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "border-line focus:border-brand w-full rounded-md border px-3 py-2 text-sm outline-none",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
