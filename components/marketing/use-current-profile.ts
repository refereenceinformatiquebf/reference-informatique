"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Role } from "@/lib/generated/prisma/enums";

type CurrentProfile = { name: string; role: Role } | null;

/**
 * Résout l'état de connexion côté client, pour que les pages restent
 * statiques (voir components/shell.tsx). `loading` distingue "pas encore
 * su" de "visiteur non connecté", pour éviter un flash visible du mauvais
 * état au premier rendu.
 *
 * Le même défaut trouvé côté serveur (lib/auth/dal.ts) existe ici par
 * construction : si Supabase est indisponible ou mal configuré, l'appel
 * échoue. On traite systématiquement cet échec comme "non connecté" plutôt
 * que de laisser une exception non gérée ou un chargement infini.
 */
export function useCurrentProfile() {
  const [profile, setProfile] = useState<CurrentProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile(
      supabase: ReturnType<typeof createClient>,
      userId: string | undefined,
    ) {
      if (!userId) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      try {
        const { data } = await supabase
          .from("profiles")
          .select("name, role")
          .eq("id", userId)
          .single();
        if (active) {
          setProfile(data as CurrentProfile);
          setLoading(false);
        }
      } catch (error) {
        console.error("[useCurrentProfile] Profil introuvable :", error);
        if (active) {
          setProfile(null);
          setLoading(false);
        }
      }
    }

    async function init() {
      let supabase: ReturnType<typeof createClient>;
      try {
        supabase = createClient();
      } catch (error) {
        console.error(
          "[useCurrentProfile] Client Supabase indisponible :",
          error,
        );
        if (active) setLoading(false);
        return () => {};
      }

      try {
        const { data } = await supabase.auth.getUser();
        await loadProfile(supabase, data.user?.id);
      } catch (error) {
        console.error("[useCurrentProfile] Session illisible :", error);
        if (active) {
          setProfile(null);
          setLoading(false);
        }
      }

      const { data: subscription } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          loadProfile(supabase, session?.user?.id);
        },
      );
      return () => subscription.subscription.unsubscribe();
    }

    const cleanupPromise = init();

    return () => {
      active = false;
      cleanupPromise.then((cleanup) => cleanup());
    };
  }, []);

  return { profile, loading };
}
