-- AlterTable
ALTER TABLE "access" ADD COLUMN "license_key" TEXT;
ALTER TABLE "access" ADD COLUMN "installer_url" TEXT;

-- CreateTable
CREATE TABLE "license_stock" (
    "id" UUID NOT NULL,
    "license_key" TEXT NOT NULL,
    "installer_url" TEXT NOT NULL,
    "assigned_order_id" UUID,
    "assigned_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "license_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_stock_alerts" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "low_notified_at" TIMESTAMP(3),
    "empty_notified_at" TIMESTAMP(3),

    CONSTRAINT "license_stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "license_stock_assigned_order_id_key" ON "license_stock"("assigned_order_id");

-- CreateIndex
CREATE INDEX "license_stock_received_at_idx" ON "license_stock"("received_at");

-- AddForeignKey
ALTER TABLE "license_stock" ADD CONSTRAINT "license_stock_assigned_order_id_fkey" FOREIGN KEY ("assigned_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Consommation ATOMIQUE d'une licence disponible (la plus ancienne reçue d'abord) — FOR UPDATE
-- SKIP LOCKED évite que deux commandes concurrentes ne se disputent la même ligne.
CREATE OR REPLACE FUNCTION claim_license_stock(p_order_id UUID) RETURNS SETOF "license_stock"
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE "license_stock" SET "assigned_order_id" = p_order_id, "assigned_at" = now()
   WHERE "id" = (
     SELECT "id" FROM "license_stock" WHERE "assigned_order_id" IS NULL ORDER BY "received_at" ASC LIMIT 1 FOR UPDATE SKIP LOCKED
   )
  RETURNING *;
$$;
