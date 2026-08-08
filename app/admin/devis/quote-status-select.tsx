"use client";

import { useRef } from "react";
import { Select } from "@/components/ui/select";
import { updateQuoteStatus } from "@/lib/actions/admin-devis";
import { QUOTE_STATUS_LABELS } from "@/lib/status-labels";
import type { QuoteStatus } from "@/lib/generated/prisma/enums";

export function QuoteStatusSelect({
  quoteId,
  status,
}: {
  quoteId: string;
  status: QuoteStatus;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={updateQuoteStatus}>
      <input type="hidden" name="quoteId" value={quoteId} />
      <Select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="w-auto text-xs"
      >
        {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((value) => (
          <option key={value} value={value}>
            {QUOTE_STATUS_LABELS[value].label}
          </option>
        ))}
      </Select>
    </form>
  );
}
