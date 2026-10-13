import type { ReactNode } from "react";
import { Brand } from "@/components/marketing/logo";

/**
 * Cadre commun des pages de connexion, d'inscription et de récupération :
 * une carte blanche centrée sur le fond neutre, avec la marque et un titre
 * en DM Serif Display.
 */
export function AuthShell({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-14 sm:py-20">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand size={44} />
        </div>
        <div className="border-line bg-paper shadow-card rounded-xl border p-6 sm:p-8">
          <h1 className="text-ink text-[1.75rem] leading-[1.1]">{title}</h1>
          {lead ? (
            <p className="text-ink-soft mt-2 text-[0.9375rem] leading-relaxed">
              {lead}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? (
          <p className="text-ink-soft mt-6 text-center text-sm">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
