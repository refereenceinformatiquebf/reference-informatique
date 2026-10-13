-- Administration v2 : livraison, historique des commandes, journal d'audit,
-- catalogue modifiable, journal des emails, webhooks, limite de débit partagée,
-- réglages du site. Voir PROMPTS-AMELIORATION.md.
-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('A_PREPARER', 'EN_LIVRAISON', 'LIVREE');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "email" TEXT,
ADD COLUMN     "internal_note" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "content" JSONB,
ADD COLUMN     "poster_url" TEXT,
ADD COLUMN     "promo_ends_at" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'CODE';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "price_note" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "timeline" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "delivery_status" "DeliveryStatus",
ADD COLUMN     "internal_note" TEXT,
ADD COLUMN     "manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "refunded_at" TIMESTAMP(3),
ADD COLUMN     "unit_price" INTEGER;

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "order_events" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actor_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_log" (
    "id" UUID NOT NULL,
    "admin_id" UUID,
    "admin_label" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entity_id" TEXT,
    "summary" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_log" (
    "id" UUID NOT NULL,
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "provider_id" TEXT,
    "related_order_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "detail" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "order_events_order_id_created_at_idx" ON "order_events"("order_id", "created_at");

-- CreateIndex
CREATE INDEX "admin_audit_log_created_at_idx" ON "admin_audit_log"("created_at");

-- CreateIndex
CREATE INDEX "admin_audit_log_entity_entity_id_idx" ON "admin_audit_log"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "admin_audit_log_admin_id_created_at_idx" ON "admin_audit_log"("admin_id", "created_at");

-- CreateIndex
CREATE INDEX "email_log_created_at_idx" ON "email_log"("created_at");

-- CreateIndex
CREATE INDEX "email_log_status_created_at_idx" ON "email_log"("status", "created_at");

-- CreateIndex
CREATE INDEX "webhook_events_provider_received_at_idx" ON "webhook_events"("provider", "received_at");

-- CreateIndex
CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits"("reset_at");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_profile_id_idx" ON "orders"("profile_id");

-- CreateIndex
CREATE INDEX "orders_product_id_idx" ON "orders"("product_id");

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sécurité : aucune de ces tables n'est lisible ni modifiable par l'API
-- publique (clé anon ou comptes connectés). Seule l'application, par sa
-- connexion serveur et derrière le contrôle administrateur, y accède.
ALTER TABLE "order_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_audit_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "order_events", "admin_audit_log", "email_log", "webhook_events", "rate_limits", "site_settings" FROM anon, authenticated;
