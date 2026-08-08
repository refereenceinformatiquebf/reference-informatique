import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Client Components. Clé anonyme uniquement — la
 * sécurité réelle vient des politiques RLS (voir
 * supabase/migrations/0001_profiles_auth_link.sql), pas de la
 * confidentialité de cette clé.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
