import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        fieldClasses,
        "min-h-28 resize-y leading-relaxed",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
