import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Décision d'architecture (voir PLAYBOOK-CONSTRUCTION.md, Étape 3) :
// depuis Next.js 16, ce fichier remplace `middleware.ts` — le nom a changé
// ("Proxy") mais le rôle est identique. Un `middleware.ts` n'aurait
// simplement jamais été exécuté.

const CLIENT_PREFIXES = ["/espace-client", "/commande"];
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
  // vérification réelle a lieu dans le DAL (lib/auth/dal.ts), au plus près
  // de chaque donnée. Ce proxy sert à rafraîchir la session et à rediriger
  // vite, pas à faire office de seule ligne de défense.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected =
    CLIENT_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    path.startsWith(ADMIN_PREFIX);

  if (isProtected && !user) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (path.startsWith(ADMIN_PREFIX) && user) {
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
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
