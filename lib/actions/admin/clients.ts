"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";

const UUID = /^[0-9a-f-]{36}$/i;

function note(formData: FormData) {
  return String(formData.get("note") ?? "")
    .trim()
    .slice(0, 2000);
}

/** Note interne sur le compte d'un client (jamais visible du client). */
export async function saveClientNoteAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("profileId") ?? "");
  if (!UUID.test(id)) return fail("Client introuvable.");
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) return fail("Client introuvable.");
  await prisma.profile.update({
    where: { id },
    data: { internalNote: note(formData) || null },
  });
  await audit(admin, "client.note", "profile", id, "Note interne du client");
  revalidatePath(`/admin/clients/${id}`);
  return done("Note enregistrée.");
}

/** Note sur une fiche de l'ancien site (groupe RI01). */
export async function saveLegacyNoteAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("legacyId") ?? "");
  if (!UUID.test(id)) return fail("Fiche introuvable.");
  const client = await prisma.legacyClient.findUnique({ where: { id } });
  if (!client) return fail("Fiche introuvable.");
  await prisma.legacyClient.update({
    where: { id },
    data: { adminNote: note(formData) || null },
  });
  await audit(
    admin,
    "legacy.note",
    "legacy_client",
    id,
    `Note sur ${client.code}`,
  );
  revalidatePath(`/admin/clients/ri01/${id}`);
  revalidatePath("/admin/clients");
  return done("Note enregistrée.");
}
