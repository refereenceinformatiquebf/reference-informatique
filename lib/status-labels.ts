import type { OrderStatus, QuoteStatus } from "@/lib/generated/prisma/enums";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

export const ORDER_STATUS_LABELS: Record<
  OrderStatus,
  { label: string; variant: BadgeVariant }
> = {
  EN_ATTENTE: { label: "En attente", variant: "warning" },
  PAYE: { label: "Payé", variant: "success" },
  ECHOUE: { label: "Échoué", variant: "danger" },
  ANNULE: { label: "Annulé", variant: "danger" },
  REMBOURSE: { label: "Remboursé", variant: "neutral" },
};

export const QUOTE_STATUS_LABELS: Record<
  QuoteStatus,
  { label: string; variant: BadgeVariant }
> = {
  NOUVEAU: { label: "Nouveau", variant: "neutral" },
  EN_DISCUSSION: { label: "En discussion", variant: "warning" },
  DEVIS_ENVOYE: { label: "Devis envoyé", variant: "neutral" },
  ACCEPTE: { label: "Accepté", variant: "success" },
  REFUSE: { label: "Refusé", variant: "danger" },
};
