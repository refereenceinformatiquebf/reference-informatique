-- Clients de l'ancien site (groupe RI01) : fiches de suivi pour l'administration.
-- Aucun compte de connexion, aucun mot de passe : uniquement nom, contact et achats.
CREATE TABLE "legacy_clients" (
    "id" UUID NOT NULL,
    "batch" TEXT NOT NULL DEFAULT 'RI01',
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "legacy_user_id" INTEGER NOT NULL,
    "signed_up_at" TIMESTAMP(3),
    "purchases" JSONB NOT NULL,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legacy_clients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "legacy_clients_code_key" ON "legacy_clients"("code");
CREATE UNIQUE INDEX "legacy_clients_legacy_user_id_key" ON "legacy_clients"("legacy_user_id");
CREATE INDEX "legacy_clients_batch_idx" ON "legacy_clients"("batch");

-- Données personnelles : Row Level Security activée SANS politique. La clé publique
-- (anon) et les comptes connectés ne peuvent donc rien lire ; seule l'application
-- (connexion serveur) accède à cette table, derrière le contrôle administrateur.
ALTER TABLE "legacy_clients" ENABLE ROW LEVEL SECURITY;
