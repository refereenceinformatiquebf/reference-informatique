import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/devis", label: "Devis" },
  { href: "/admin/clients", label: "Clients" },
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="bg-paper-raised min-h-screen">
      <header className="border-line bg-paper border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <span className="text-ink text-sm font-bold">Administration</span>
            <nav className="hidden gap-1 sm:flex">
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-ink-soft hover:text-brand hover:bg-brand/5 rounded-md px-3 py-1.5 text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Déconnexion
            </Button>
          </form>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-soft hover:text-brand shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
