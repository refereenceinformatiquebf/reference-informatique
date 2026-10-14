"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { sendAdminReply } from "@/lib/email/send";
import { QUOTE_STATUS_LABELS } from "@/lib/status-labels";

const UUID = /^[0-9a-f-]{36}$/i;
const statusSchema = z.enum([
  "NOUVEAU",
  "EN_DISCUSSION",
  "DEVIS_ENVOYE",
  "ACCEPTE",
  "REFUSE",
]);

function refresh(id: string) {
  revalidatePath("/admin/devis");
  revalidatePath(`/admin/devis/${id}`);
  revalidatePath("/admin");
}

export async function setQuoteStatusAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("quoteId") ?? "");
  const status = statusSchema.safeParse(formData.get("status"));
  if (!UUID.test(id) || !status.success)
    return fail("Demande ou statut inconnu.");
  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) return fail("Demande introuvable.");
  await prisma.quoteRequest.update({
    where: { id },
    data: { status: status.data },
  });
  await audit(
    admin,
    "quote.status",
    "quote",
    id,
    `Statut : ${QUOTE_STATUS_LABELS[quote.status].label} → ${QUOTE_STATUS_LABELS[status.data].label}`,
  );
  refresh(id);
  return done("Statut mis à jour.");
}

export async function saveQuoteNoteAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("quoteId") ?? "");
  if (!UUID.test(id)) return fail("Demande introuvable.");
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 4000);
  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) return fail("Demande introuvable.");
  await prisma.quoteRequest.update({
    where: { id },
    data: { internalNote: note || null },
  });
  await audit(admin, "quote.note", "quote", id, "Note interne mise à jour");
  refresh(id);
  return done("Note enregistrée.");
}

const replySchema = z.object({
  subject: z.string().trim().min(3, { error: "Indiquez un objet." }).max(150),
  body: z
    .string()
    .trim()
    .min(10, { error: "Le message est trop court." })
    .max(8000),
});

/** Répond au client par email depuis l'administration (les réponses du client
 * reviennent dans la boîte de l'équipe). Passe la demande « en discussion ». */
export async function replyToQuoteAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("quoteId") ?? "");
  if (!UUID.test(id)) return fail("Demande introuvable.");
  const parsed = replySchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Message invalide.");

  const quote = await prisma.quoteRequest.findUnique({
    where: { id },
    include: { service: true },
  });
  if (!quote) return fail("Demande introuvable.");

  try {
    await sendAdminReply({
      to: { email: quote.email, name: quote.name },
      subject: parsed.data.subject,
      body: parsed.data.body,
      template: "quote-reply",
    });
  } catch {
    return fail(
      "L'email n'a pas pu partir. Consultez « Emails envoyés » pour le détail.",
    );
  }

  if (quote.status === "NOUVEAU") {
    await prisma.quoteRequest.update({
      where: { id },
      data: { status: "EN_DISCUSSION" },
    });
  }
  await audit(
    admin,
    "quote.reply",
    "quote",
    id,
    `Réponse envoyée : ${parsed.data.subject}`,
  );
  refresh(id);
  return done("Réponse envoyée au client.");
}
