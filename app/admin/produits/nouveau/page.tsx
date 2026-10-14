import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/ui";
import { ProductEditor } from "../product-editor";
import { FACT_ROWS, type ProductFormValues } from "@/lib/catalog/form";

export const metadata: Metadata = { title: "Ajouter un produit" };
export const dynamic = "force-dynamic";

const EMPTY: ProductFormValues = {
  name: "",
  tagline: "",
  summary: "",
  kind: "ebook",
  delivery: "numerique",
  restrictedToBF: false,
  restrictedOther: "",
  posterAlt: "",
  coverTone: "blue",
  coverMotif: "ebook",
  facts: Array.from({ length: FACT_ROWS }, () => ({ icon: "", label: "" })),
  story: "",
  highlights: "",
  contents: "",
  forWho: "",
  notForWho: "",
  faq: "",
  testimonialQuote: "",
  testimonialAuthor: "",
  testimonialCity: "",
  seoTitle: "",
  seoDescription: "",
};

export default function NewProductPage() {
  return (
    <>
      <AdminHeader
        back={{ href: "/admin/produits", label: "Produits" }}
        title="Ajouter un produit"
        subtitle="Une fois créé, le produit apparaît dans la boutique s'il est « visible sur le site ». Pour qu'un client puisse ouvrir un fichier après achat, ajoutez ensuite son contenu."
      />
      <ProductEditor
        values={EMPTY}
        source="ADMIN"
        originallyRestricted={false}
        commercial={{
          price: 5000,
          compareAtPrice: null,
          promoEndsAt: "",
          badge: "",
          active: false,
          displayOrder: 100,
        }}
      />
    </>
  );
}
