import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FORMATIONS_BUCKET = "formations";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 2; // 2 heures

/**
 * Génère une URL signée à durée limitée pour un fichier du bucket privé
 * "formations". Utilise la clé service_role (contourne RLS) — c'est
 * délibéré : le contrôle d'accès réel se fait AVANT cet appel, en
 * vérifiant qu'un Access existe pour l'utilisateur (voir le Route Handler
 * qui appelle cette fonction), pas via les politiques du bucket.
 */
export async function createSignedLessonUrl(storagePath: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(FORMATIONS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error(
      `Impossible de générer l'URL signée pour "${storagePath}" : ${error?.message}`,
    );
  }

  return data.signedUrl;
}
