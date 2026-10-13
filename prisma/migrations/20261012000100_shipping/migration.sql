-- Adresse de livraison des clés USB (produits à livraison physique).
-- Nulle pour les produits numériques : aucune donnée existante à migrer.
ALTER TABLE "orders" ADD COLUMN "shipping_city" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipping_address" TEXT;
ALTER TABLE "orders" ADD COLUMN "shipping_phone" TEXT;
