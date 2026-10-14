"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { sendAdminReply } from "@/lib/email/send";

const UUID = /^[0-9a-f-]{36}$/i;

function refresh() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function setMessageHandledAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("messageId") ?? "");
  const handled = formData.get("handled") === "true";
  if (!UUID.test(id)) return fail("Message introuvable.");
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return fail("Message introuvable.");
  await prisma.contactMessage.update({ where: { id }, data: { handled } });
  await audit(
    admin,
    "message.handled",
    "message",
    id,
    handled ? "Message marqué comme traité" : "Message remis à traiter",
  );
  refresh();
  return done(handled ? "Marqué comme traité." : "Remis à traiter.");
}

const replySchema = z.object({
  subject: z.string().trim().min(3, { error: "Indiquez un objet." }).max(150),
  body: z
    .string()
    .trim()
    .min(10, { error: "Le message est trop court." })
    .max(8000),
});

/** Répond par email à un message de contact et le marque comme traité. */
export async function replyToMessageAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("messageId") ?? "");
  if (!UUID.test(id)) return fail("Message introuvable.");
  const parsed = replySchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success)
    return fail(parsed.error.issues[0]?.message ?? "Message invalide.");
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) return fail("Message introuvable.");

  try {
    await sendAdminReply({
      to: { email: message.email, name: message.name },
      subject: parsed.data.subject,
      body: parsed.data.body,
      template: "message-reply",
    });
  } catch {
    return fail(
      "L'email n'a pas pu partir. Consultez « Emails envoyés » pour le détail.",
    );
  }
  await prisma.contactMessage.update({
    where: { id },
    data: { handled: true },
  });
  await audit(
    admin,
    "message.reply",
    "message",
    id,
    `Réponse envoyée : ${parsed.data.subject}`,
  );
  refresh();
  return done("Réponse envoyée, message marqué comme traité.");
}
