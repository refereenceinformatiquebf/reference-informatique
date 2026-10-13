import type { Metadata } from "next";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { getAllProducts } from "@/lib/catalog/live";
import { ManualOrderForm } from "./manual-order-form";

export const metadata: Metadata = { title: "Créer une commande" };
export const dynamic = "force-dynamic";

export default async function NewManualOrderPage({
  searchParams,
}: PageProps<"/admin/commandes/nouvelle">) {
  const { email } = await searchParams;
  const products = await getAllProducts();

  return (
    <>
      <AdminHeader
        back={{ href: "/admin/commandes", label: "Commandes" }}
        title="Créer une commande"
        subtitle="Pour un client qui a déjà un compte : paiement reçu en direct, client qui ne voit pas les clés depuis sa connexion, geste commercial."
      />
      <Panel className="max-w-3xl">
        <ManualOrderForm
          defaultEmail={typeof email === "string" ? email : ""}
          products={products.map((product) => ({
            slug: product.slug,
            name: product.name,
            price: product.price,
            physical: product.delivery === "cle-physique",
            restricted: Boolean(product.restrictedTo?.length),
          }))}
        />
      </Panel>
    </>
  );
}
