-- AlterTable
ALTER TABLE "access" ADD COLUMN "mac_license_key" TEXT;
ALTER TABLE "access" ADD COLUMN "mac_installer_url" TEXT;
ALTER TABLE "access" ADD COLUMN "mac_serializer_url" TEXT;
ALTER TABLE "access" ADD COLUMN "mac_guide_url" TEXT;

-- CreateTable
CREATE TABLE "mac_license_stock" (
    "id" UUID NOT NULL,
    "license_key" TEXT NOT NULL,
    "installer_url" TEXT NOT NULL,
    "serializer_url" TEXT NOT NULL,
    "guide_url" TEXT NOT NULL,
    "assigned_order_id" UUID,
    "assigned_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mac_license_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mac_license_stock_alerts" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "low_notified_at" TIMESTAMP(3),
    "empty_notified_at" TIMESTAMP(3),

    CONSTRAINT "mac_license_stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mac_license_stock_assigned_order_id_key" ON "mac_license_stock"("assigned_order_id");

-- CreateIndex
CREATE INDEX "mac_license_stock_received_at_idx" ON "mac_license_stock"("received_at");

-- AddForeignKey
ALTER TABLE "mac_license_stock" ADD CONSTRAINT "mac_license_stock_assigned_order_id_fkey" FOREIGN KEY ("assigned_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Consommation ATOMIQUE d'une licence Mac disponible (la plus ancienne reçue d'abord) — jumelle
-- de claim_license_stock (20261014010000_licence_edn_stock).
CREATE OR REPLACE FUNCTION claim_mac_license_stock(p_order_id UUID) RETURNS SETOF "mac_license_stock"
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE "mac_license_stock" SET "assigned_order_id" = p_order_id, "assigned_at" = now()
   WHERE "id" = (
     SELECT "id" FROM "mac_license_stock" WHERE "assigned_order_id" IS NULL ORDER BY "received_at" ASC LIMIT 1 FOR UPDATE SKIP LOCKED
   )
  RETURNING *;
$$;
