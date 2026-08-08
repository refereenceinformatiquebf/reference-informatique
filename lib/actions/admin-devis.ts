"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { prisma } from "@/lib/prisma/client";
import type { QuoteStatus } from "@/lib/generated/prisma/enums";

export async function updateQuoteStatus(formData: FormData) {
  await requireAdmin();
  const quoteId = String(formData.get("quoteId") ?? "");
  const status = String(formData.get("status") ?? "") as QuoteStatus;

  await prisma.quoteRequest.update({
    where: { id: quoteId },
    data: { status },
  });

  revalidatePath("/admin/devis");
  revalidatePath("/admin");
}
