-- Signaux captes cote serveur a la creation/mise a jour de la commande (voir
-- lib/actions/order.ts, getOrCreatePendingOrder), pour l'API Conversions Meta
-- (lib/meta-capi.ts) -- sans eux, un achat remonte a Meta sans pouvoir etre relie
-- de facon fiable au clic publicitaire qui l'a reellement genere.
ALTER TABLE "orders" ADD COLUMN "client_ip" TEXT;
ALTER TABLE "orders" ADD COLUMN "user_agent" TEXT;
ALTER TABLE "orders" ADD COLUMN "fbp" TEXT;
ALTER TABLE "orders" ADD COLUMN "fbc" TEXT;
