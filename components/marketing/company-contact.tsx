"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { hidesCompanyContact } from "@/lib/focus";

/**
 * Les coordonnées de l'entreprise (numéro, WhatsApp) du pied de page, retirées
 * des pages où le client doit joindre l'assistance dédiée (voir lib/focus.ts) :
 * il n'y voit alors qu'UN numéro, le bon.
 */
export function CompanyContact({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return hidesCompanyContact(pathname) ? null : <>{children}</>;
}
