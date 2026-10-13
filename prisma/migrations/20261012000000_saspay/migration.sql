-- Passage de FedaPay à SasPay.
-- RENAME VALUE conserve les lignes existantes (orders / payments) : aucune
-- donnée à migrer, les anciennes valeurs 'FEDAPAY' deviennent 'SASPAY'.
ALTER TYPE "PaymentProvider" RENAME VALUE 'FEDAPAY' TO 'SASPAY';

-- Session de checkout SasPay liée à la commande (rapprochement des paiements).
ALTER TABLE "orders" ADD COLUMN "provider_session_id" TEXT;

CREATE INDEX "orders_provider_session_id_idx" ON "orders"("provider_session_id");
