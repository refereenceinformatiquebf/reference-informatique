-- Commande sans compte : lien personnel de suivi et d'accès, relance de paiement.
--
-- access_token : jeton secret (32 octets aléatoires) envoyé au client PAR EMAIL.
-- Y accéder prouve qu'on lit la boîte de l'acheteur : il ouvre la page de suivi
-- de la commande et permet d'entrer dans son achat sans mot de passe.
-- reminder_sent_at : date de l'unique relance d'une commande jamais payée.
ALTER TABLE "orders" ADD COLUMN "access_token" TEXT;
ALTER TABLE "orders" ADD COLUMN "reminder_sent_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "orders_access_token_key" ON "orders"("access_token");
