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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
