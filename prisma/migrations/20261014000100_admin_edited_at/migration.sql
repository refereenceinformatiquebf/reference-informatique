-- Le code (lib/catalog) fait foi tant que l'équipe n'a pas enregistré un produit
-- ou un service depuis l'administration ; ensuite la base fait foi.
ALTER TABLE "products" ADD COLUMN "admin_edited_at" TIMESTAMP(3);
ALTER TABLE "services" ADD COLUMN "admin_edited_at" TIMESTAMP(3);
