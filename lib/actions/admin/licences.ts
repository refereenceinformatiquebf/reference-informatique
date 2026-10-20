"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { actorLabel, audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { pullAndStoreLicenceLot } from "@/lib/licences/stock";
import { deliverPendingLicences } from "@/lib/licences/fulfil";
import { EdnLicenceError } from "@/lib/licences/edn";

/** Récupère un nouveau lot de licences chez L'Expert du Numérique et l'ajoute au stock local. */
export async function pullLicenceLotAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const count = Number(formData.get("count"));
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    return fail("Indiquez un nombre entre 1 et 100.");
  }

  try {
    const received = await pullAndStoreLicenceLot(count);
    await audit(
      admin,
      "licence.lot_pulled",
      "license_stock",
      null,
      `${received} licences récupérées auprès de L'Expert du Numérique.`,
      { by: actorLabel(admin), count: received },
    );
    revalidatePath("/admin/licences");
    return done(`${received} licences reçues et ajoutées au stock.`);
  } catch (err) {
    if (err instanceof EdnLicenceError) {
      return fail(
        err.quotaReached
          ? "Quota atteint chez L'Expert du Numérique — contactez-le pour en obtenir davantage."
          : "L'Expert du Numérique est momentanément indisponible — réessayez dans un instant.",
      );
    }
    console.error("[licences] récupération de lot échouée :", err);
    return fail("Erreur inattendue — réessayez.");
  }
}

/** Livre leur licence aux clients qui ont payé et attendent encore (stock vide ou EDN injoignable au moment du paiement). */
export async function deliverPendingLicencesAction(): Promise<ActionResult> {
  const admin = await requireAdmin();
  try {
    const { delivered, stillWaiting, failed } = await deliverPendingLicences();
    await audit(
      admin,
      "licence.pending_delivered",
      "license_stock",
      null,
      `Livraison des licences en attente : ${delivered} livrée(s), ${stillWaiting} encore en attente, ${failed} en échec.`,
      { by: actorLabel(admin), delivered, stillWaiting, failed },
    );
    revalidatePath("/admin/licences");
    if (delivered === 0 && stillWaiting === 0 && failed === 0) {
      return done("Aucun client n'attend de licence.");
    }
    const parts = [`${delivered} licence(s) livrée(s)`];
    if (stillWaiting > 0) {
      parts.push(
        `${stillWaiting} encore en attente (stock vide : récupérez un nouveau lot)`,
      );
    }
    if (failed > 0) parts.push(`${failed} en erreur`);
    const message = `${parts.join(", ")}.`;
    return delivered > 0 || stillWaiting === 0 ? done(message) : fail(message);
  } catch (err) {
    console.error(
      "[licences] livraison des licences en attente échouée :",
      err,
    );
    return fail("Erreur inattendue — réessayez.");
  }
}
