import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-line bg-paper-raised rounded-lg border p-6",
        className,
      )}
      {...props}
    />
  );
}
