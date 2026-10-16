import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { canonicalProductRedirect } from "@/lib/catalog/paths";

// Décision d'architecture (voir PLAYBOOK-CONSTRUCTION.md, Étape 3) :
// depuis Next.js 16, ce fichier remplace `middleware.ts` — le nom a changé
// ("Proxy") mais le rôle est identique. Un `middleware.ts` n'aurait
// simplement jamais été exécuté.

const CLIENT_PREFIXES = ["/espace-client"];
// La commande est ouverte à tous (aucun compte exigé) : on y rafraîchit
// seulement la session d'un visiteur déjà connecté, sans jamais le rediriger.
const REFRESH_ONLY_PREFIXES = ["/commande"];
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Ancien slug, autre casse, « & » : renvoyé vers l'adresse officielle du
  // produit (voir lib/catalog/paths.ts).
  const canonical = canonicalProductRedirect(path);
  if (canonical) {
    const url = request.nextUrl.clone();
    url.pathname = canonical;
    return NextResponse.redirect(url, 308);
  }

  const isProtected =
    CLIENT_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    path.startsWith(ADMIN_PREFIX);

  const refreshOnly =
    !isProtected &&
    REFRESH_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix));
  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  // Trouvé en testant réellement le projet (pas seulement en le compilant) :
  // interroger Supabase pour CHAQUE page, y compris les pages publiques,
  // rendait tout le site indisponible dès que Supabase était injoignable ou
  // mal configuré — une panne d'un service tiers ne doit jamais faire
  // tomber les pages qui n'en ont pas besoin. On ne touche donc à Supabase
  // que pour les routes qui en ont réellement besoin.
  if (!isProtected && !(refreshOnly && hasSessionCookie)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Vérification optimiste uniquement (lecture du cookie de session) : la
    // vérification réelle a lieu dans le DAL (lib/auth/dal.ts), au plus
    // près de chaque donnée. Ce proxy sert à rafraîchir la session et à
    // rediriger vite, pas à faire office de seule ligne de défense.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (refreshOnly) return response;

    if (!user) {
      const url = new URL("/connexion", request.url);
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    if (path.startsWith(ADMIN_PREFIX)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/espace-client", request.url));
      }
    }

    return response;
  } catch (error) {
    // Supabase injoignable, variables d'environnement absentes, etc. : on
    // refuse par défaut plutôt que de planter — une route protégée dont on
    // ne peut pas vérifier la session redirige vers la connexion, elle ne
    // renvoie jamais une erreur 500 à l'utilisateur.
    console.error("[proxy] Vérification de session impossible :", error);
    // Pages ouvertes à tous : un souci de session ne doit jamais les bloquer.
    if (refreshOnly) return NextResponse.next();
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
