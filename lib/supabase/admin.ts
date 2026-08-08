import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé `service_role` — contourne RLS entièrement.
 * Réservé aux opérations serveur qui doivent légitimement voir/modifier
 * toutes les données (tâches admin, webhooks, scripts de migration).
 *
 * L'import de "server-only" fait échouer le build si ce fichier est un jour
 * importé, même indirectement, depuis un Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
