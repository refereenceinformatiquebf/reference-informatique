-- Pays du client, deduit de l'indicatif telephone (voir lib/phone.ts) -- permet
-- a l'equipe de savoir d'ou appelle chaque acheteur sans champ separe a remplir.
ALTER TABLE "profiles" ADD COLUMN "country" TEXT;

-- Rapport admin 9h/13h/19h des commandes non finalisees (voir lib/checkout/call-digest.ts)
-- -- une commande n'apparait qu'une seule fois dans ces rapports, jamais reempilee.
ALTER TABLE "orders" ADD COLUMN "admin_digest_sent_at" TIMESTAMP(3);

CREATE INDEX "orders_status_adminDigestSentAt_idx" ON "orders"("status", "admin_digest_sent_at");
