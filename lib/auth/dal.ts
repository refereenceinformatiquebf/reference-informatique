import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

/**
 * Data Access Layer — point d'entrée unique pour vérifier une session côté
 * serveur. `cache()` évite de refaire la vérification plusieurs fois lors
 * d'un même rendu si plusieurs composants l'appellent.
 *
 * Le proxy (Étape 3) fait une vérification optimiste (lecture du cookie de
 * session) pour rediriger rapidement ; ces fonctions font la vérification
 * réelle, au plus près de la donnée, comme recommandé par la documentation
 * Next.js sur l'authentification.
 */

/** Utilisateur authentifié, vérifié auprès de Supabase (jamais seulement lu dans un cookie). */
const getAuthUser = cache(async () => {
  // Trouvé en testant réellement le projet : sans ce garde, une panne ou
  // une mauvaise configuration de Supabase fait planter (erreur 500) TOUTE
  // page qui vérifie la session — y compris des pages qui devraient
  // simplement traiter le visiteur comme non connecté. Un échec de
  // vérification de session n'est jamais une raison de crasher la page ;
  // au pire, on affiche l'état "non connecté".
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("[getCurrentProfile] Session Supabase indisponible :", error);
    return null;
  }
});

export const getCurrentProfile = cache(async () => {
  const user = await getAuthUser();
  if (!user) return null;
  return prisma.profile.findUnique({ where: { id: user.id } });
});

/** À appeler dans toute page/action de /espace-client. Redirige sinon. */
export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/connexion");
  }
  return profile;
}

/**
 * Double vérification (application d'authentification) de l'administrateur.
 *  - enrolled : un second facteur est activé sur le compte ;
 *  - verified : la session actuelle l'a réussi (niveau « aal2 »).
 * En cas de doute (erreur de lecture), on considère le facteur comme activé
 * ET non vérifié : on refuse plutôt que de laisser passer.
 */
export const getAdminAssurance = cache(async () => {
  try {
    const user = await getAuthUser();
    const supabase = await createClient();
    // Le niveau de vérification est lu dans les revendications VÉRIFIÉES du
    // jeton (signature contrôlée), jamais dans le cookie brut.
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data) throw error ?? new Error("jeton illisible");
    const enrolled = (user?.factors ?? []).some(
      (factor) => factor.status === "verified",
    );
    return { enrolled, verified: data.claims.aal === "aal2" };
  } catch (error) {
    console.error("[getAdminAssurance] lecture impossible :", error);
    return { enrolled: true, verified: false };
  }
});

/** Page de saisie du code, hors de /admin (sinon la page de vérification
 * serait elle-même bloquée par la vérification). */
export const MFA_VERIFY_PATH = "/connexion/verification";

/** À appeler dans toute page/action de /admin. Redirige sinon. */
export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "ADMIN") {
    redirect("/espace-client");
  }
  const assurance = await getAdminAssurance();
  if (assurance.enrolled && !assurance.verified) {
    redirect(`${MFA_VERIFY_PATH}?next=/admin`);
  }
  return profile;
}

/**
 * Pour les routes d'API de l'administration (export CSV…) : renvoie
 * l'administrateur vérifié, ou null (la route répond alors par une 404, sans
 * confirmer qu'elle existe).
 */
export async function getVerifiedAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "ADMIN") return null;
  const assurance = await getAdminAssurance();
  if (assurance.enrolled && !assurance.verified) return null;
  return profile;
}
