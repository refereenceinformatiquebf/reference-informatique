"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { actorLabel, audit } from "@/lib/admin/audit";
import { done, fail, type ActionResult } from "@/lib/admin/action";
import { pullAndStoreLicenceLot } from "@/lib/licences/stock";
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
