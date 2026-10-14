"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Donne le rôle d'administrateur à une personne qui a déjà un compte. Un
 * administrateur voit les données de tous les clients : l'ajout demande un
 * motif et est journalisé.
 */
export async function addAdminAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const reason = String(formData.get("reason") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail("Adresse email invalide.");
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");

  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile) {
    return fail(
      "Aucun compte avec cette adresse. Demandez à la personne de se connecter une première fois avec son email (un lien lui est envoyé), puis recommencez.",
    );
  }
  if (profile.role === "ADMIN")
    return done(`${profile.name} est déjà administrateur.`);

  await prisma.profile.update({
    where: { id: profile.id },
    data: { role: "ADMIN" },
  });
  await audit(
    admin,
    "admin.add",
    "admin",
    profile.id,
    `${email} devient administrateur : ${reason}`,
  );
  revalidatePath("/admin/administrateurs");
  return done(`${profile.name} est maintenant administrateur.`);
}

/** Retire le rôle d'administrateur. Il en reste toujours au moins un, et on ne se retire pas soi-même. */
export async function removeAdminAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("profileId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!UUID.test(id)) return fail("Administrateur introuvable.");
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");
  if (id === admin.id) {
    return fail(
      "Vous ne pouvez pas vous retirer vous-même : demandez à un autre administrateur.",
    );
  }
  const target = await prisma.profile.findUnique({ where: { id } });
  if (!target || target.role !== "ADMIN")
    return fail("Cette personne n'est pas administrateur.");

  const count = await prisma.profile.count({ where: { role: "ADMIN" } });
  if (count <= 1)
    return fail("Il doit toujours rester au moins un administrateur.");

  await prisma.profile.update({ where: { id }, data: { role: "CLIENT" } });
  await audit(
    admin,
    "admin.remove",
    "admin",
    id,
    `${target.email ?? target.name} n'est plus administrateur : ${reason}`,
  );
  revalidatePath("/admin/administrateurs");
  return done("Administrateur retiré. Il garde son compte client.");
}
