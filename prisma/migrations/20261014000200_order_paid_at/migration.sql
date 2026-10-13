-- Date du paiement : sert au chiffre d'affaires (et non la derniere modification de la commande).
ALTER TABLE "orders" ADD COLUMN "paid_at" TIMESTAMP(3);
CREATE INDEX "orders_paid_at_idx" ON "orders"("paid_at");
-- Commandes deja payees : on reprend la date de leur premier paiement enregistre.
UPDATE "orders" o SET "paid_at" = p.first_payment
FROM (SELECT "order_id", MIN("created_at") AS first_payment FROM "payments" GROUP BY "order_id") p
WHERE o."id" = p."order_id" AND o."status" = 'PAYE' AND o."paid_at" IS NULL;
