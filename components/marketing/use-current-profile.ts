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
 */
export function useCurrentProfile() {
  const [profile, setProfile] = useState<CurrentProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile(userId: string | undefined) {
      if (!userId) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", userId)
        .single();
      if (active) {
        setProfile(data as CurrentProfile);
        setLoading(false);
      }
    }

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user?.id));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadProfile(session?.user?.id);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { profile, loading };
}
