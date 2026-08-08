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
export const getCurrentProfile = cache(async () => {
  // Trouvé en testant réellement le projet : sans ce garde, une panne ou
  // une mauvaise configuration de Supabase fait planter (erreur 500) TOUTE
  // page qui vérifie la session — y compris des pages qui devraient
  // simplement traiter le visiteur comme non connecté. Un échec de
  // vérification de session n'est jamais une raison de crasher la page ;
  // au pire, on affiche l'état "non connecté".
  let user;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("[getCurrentProfile] Session Supabase indisponible :", error);
    return null;
  }

  if (!user) {
    return null;
  }

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

/** À appeler dans toute page/action de /admin. Redirige sinon. */
export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "ADMIN") {
    redirect("/espace-client");
  }
  return profile;
}
