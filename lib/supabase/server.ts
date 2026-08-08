import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase pour les Server Components, Route Handlers et Server
 * Actions. Respecte la session de l'utilisateur via les cookies de la
 * requête. À créer à nouveau à chaque rendu serveur — ne jamais le
 * mémoriser ni le partager entre requêtes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `cookies().set()` échoue dans un Server Component pur (lecture
            // seule) — sans conséquence tant que le middleware (Étape 3)
            // rafraîchit déjà la session sur chaque requête.
          }
        },
      },
    },
  );
}
