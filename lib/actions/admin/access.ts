"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { requireAdmin } from "@/lib/auth/dal";
import { actorLabel, audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { getAdminProduct } from "@/lib/catalog/live";
import { ensureProductRow } from "@/lib/catalog/db-sync";
import { getClientEmail } from "@/lib/orders";
import { runAfterResponse } from "@/lib/after-response";
import { sendAccessGranted } from "@/lib/email/send";
import { ensureAccount } from "@/lib/checkout/buyer";

const UUID = /^[0-9a-f-]{36}$/i;

function refresh(profileId?: string) {
  revalidatePath("/admin/acces");
  if (profileId) revalidatePath(`/admin/clients/${profileId}`);
  revalidatePath("/admin");
}

/**
 * Donne l'accès à un produit sans commande (geste commercial, support,
 * client de l'ancien site). Un motif est obligatoire et tout est journalisé.
 * La règle d'accès par pays ne s'applique pas ici : c'est l'équipe qui décide,
 * pour un client réel.
 */
export async function grantAccessAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const profileIdRaw = String(formData.get("profileId") ?? "");
  const slug = String(formData.get("productSlug") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");

  let profile = UUID.test(profileIdRaw)
    ? await prisma.profile.findUnique({ where: { id: profileIdRaw } })
    : email
      ? await prisma.profile.findUnique({ where: { email } })
      : null;
  let createdAccount = false;
  if (!profile) {
    // Une adresse inconnue n'est plus un obstacle : le client reçoit un compte
    // sans mot de passe et se connecte avec son seul email.
    if (!email || !z.email().safeParse(email).success) {
      return fail("Indiquez l'adresse email du client.");
    }
    const created = await ensureAccount({ email });
    profile = created.profile;
    createdAccount = created.createdAccount;
  }

  // Tous les produits, y compris masqués (ancien produit, produit en préparation).
  const product = (await getAdminProduct(slug))?.product;
  if (!product) return fail("Produit introuvable.");
  const row = await ensureProductRow(product.slug);
  if (!row) return fail("Produit indisponible.");

  const existing = await prisma.access.findUnique({
    where: {
      profileId_productId: { profileId: profile.id, productId: row.id },
    },
  });
  if (existing)
    return done(`${profile.name} a déjà accès à « ${product.name} ».`);

  await prisma.access.create({
    data: { profileId: profile.id, productId: row.id },
  });
  await audit(
    admin,
    "access.grant",
    "access",
    `${profile.id}:${row.id}`,
    `Accès « ${product.name} » donné à ${profile.email ?? profile.name} : ${reason}${createdAccount ? " (compte créé)" : ""}`,
    { by: actorLabel(admin), reason },
  );

  if (formData.get("notify") === "on") {
    runAfterResponse(async () => {
      const to = await getClientEmail(profile);
      if (!to) return;
      await sendAccessGranted({
        to,
        clientName: profile.name,
        productName: product.name,
      });
    });
  }

  refresh(profile.id);
  return done(`Accès à « ${product.name} » donné à ${profile.name}.`);
}

/** Retire un accès. Les commandes du client ne sont pas modifiées. */
export async function revokeAccessAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const accessId = String(formData.get("accessId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!UUID.test(accessId)) return fail("Accès introuvable.");
  if (reason.length < 5)
    return fail("Indiquez un motif (5 caractères minimum).");

  const access = await prisma.access.findUnique({
    where: { id: accessId },
    include: { product: true, profile: true },
  });
  if (!access) return fail("Cet accès n'existe plus.");

  await prisma.access.delete({ where: { id: access.id } });
  await audit(
    admin,
    "access.revoke",
    "access",
    `${access.profileId}:${access.productId}`,
    `Accès « ${access.product.name} » retiré à ${access.profile.email ?? access.profile.name} : ${reason}`,
    { by: actorLabel(admin), reason },
  );
  refresh(access.profileId);
  return done("Accès retiré.");
}
