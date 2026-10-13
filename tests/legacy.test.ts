/**
 * Tests de l'import des clients de l'ancien site (groupe RI01), sur un export
 * SQL FICTIF — aucune donnée réelle dans ce fichier.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLegacyClients,
  legacyClientCode,
  normalizePhone,
  parseSqlInserts,
} from "../lib/legacy/parse-dump";

const BS = String.fromCharCode(92);

const SQL = `
INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`role\`, \`telephone\`, \`ville\`, \`password\`, \`created_at\`) VALUES
(1, 'Awa Test', 'Awa@Exemple.com', 'client', '70123456', 'Ouagadougou', 'HASH-SECRET-1', '2026-03-20 10:00:00'),
(2, 'Moussa D''Test', 'moussa.test@ri-client.bf', 'client', '+22671000000', NULL, 'HASH-SECRET-2', '2026-03-21 10:00:00'),
(3, 'Admin', 'admin@exemple.com', 'admin', NULL, NULL, 'HASH-SECRET-3', '2026-03-19 10:00:00'),
(4, 'Sans Achat', 'sans@exemple.com', 'client', '70999999', NULL, 'HASH-SECRET-4', '2026-03-22 10:00:00'),
(5, 'Fanta ${BS}'Echappee', 'fanta@exemple.com', 'client', '+226 72 00 00 00', 'Bobo-Dioulasso', 'HASH-SECRET-5', '2026-03-19 12:00:00');
INSERT INTO \`produits\` (\`id\`, \`nom\`) VALUES
(1, 'Cle de Formations Completes'),
(4, 'CLE COMPLETE Tout-en-Un (64 Go)');
INSERT INTO \`commandes\` (\`id\`, \`user_id\`, \`produit_id\`, \`montant\`, \`statut\`, \`note_admin\`, \`created_at\`) VALUES
(1, 1, 1, 12000, 'acces_active', NULL, '2026-03-20 11:00:00'),
(2, 2, 4, 16000, 'paiement_recu', 'Client ayant achete une cle P12, virgule ; (parenthese) - Import automatique', '2026-03-21 11:00:00'),
(3, 4, 1, 12000, 'en_attente', NULL, '2026-03-22 11:00:00'),
(4, 5, 1, 12000, 'acces_active', NULL, '2026-03-19 13:00:00'),
(5, 5, 4, 16000, 'acces_active', NULL, '2026-03-25 13:00:00');
INSERT INTO \`acces_formations\` (\`id\`, \`user_id\`, \`produit_id\`) VALUES (1, 1, 1), (2, 5, 1), (3, 5, 4);
`;

describe("lecture de l'export SQL", () => {
  const tables = parseSqlInserts(SQL);

  it("lit toutes les tables et toutes les lignes", () => {
    assert.equal(tables.users.length, 5);
    assert.equal(tables.commandes.length, 5);
    assert.equal(tables.acces_formations.length, 3);
    assert.equal(tables.produits.length, 2);
  });

  it("gère les guillemets doublés, échappés, NULL et les nombres", () => {
    assert.equal(tables.users[1].name, "Moussa D'Test");
    assert.equal(tables.users[4].name, "Fanta 'Echappee");
    assert.equal(tables.users[1].ville, null);
    assert.equal(tables.commandes[0].montant, 12000);
  });

  it("garde intactes les virgules et parenthèses à l'intérieur d'un texte", () => {
    assert.equal(
      tables.commandes[1].note_admin,
      "Client ayant achete une cle P12, virgule ; (parenthese) - Import automatique",
    );
  });
});

describe("fiches clients RI01", () => {
  const clients = buildLegacyClients(parseSqlInserts(SQL));

  it("ne reprend que les clients qui ont acheté (ni admin, ni compte sans achat)", () => {
    assert.deepEqual(
      clients.map((c) => c.legacyUserId),
      [5, 1, 2],
    );
  });

  it("trie par date d'inscription : c'est l'ordre des codes RI01-001, 002…", () => {
    assert.equal(legacyClientCode("RI01", 1), "RI01-001");
    assert.equal(legacyClientCode("RI01", 167), "RI01-167");
    assert.equal(clients[0].name, "Fanta 'Echappee");
  });

  it("n'importe JAMAIS les mots de passe", () => {
    const text = JSON.stringify(clients);
    assert.equal(text.includes("HASH-SECRET"), false);
    assert.equal("password" in clients[0], false);
  });

  it("écarte les adresses fictives @ri-client.bf et met les vraies en minuscules", () => {
    assert.equal(clients.find((c) => c.legacyUserId === 2)?.email, null);
    assert.equal(
      clients.find((c) => c.legacyUserId === 1)?.email,
      "awa@exemple.com",
    );
  });

  it("normalise les téléphones au format international", () => {
    assert.equal(normalizePhone("70123456"), "+22670123456");
    assert.equal(normalizePhone("+22671000000"), "+22671000000");
    assert.equal(normalizePhone("+226 72 00 00 00"), "+22672000000");
    assert.equal(normalizePhone("22673000000"), "+22673000000");
    assert.equal(normalizePhone(""), null);
    assert.equal(normalizePhone(null), null);
  });

  it("relie les achats au catalogue actuel et garde statut, montant et date", () => {
    const fanta = clients[0];
    assert.equal(fanta.purchases.length, 2);
    assert.equal(fanta.purchases[0].productSlug, "cle-formations-completes");
    assert.equal(fanta.purchases[1].productSlug, "cle-tout-en-un");
    assert.equal(fanta.purchases[1].amount, 16000);
    assert.equal(fanta.purchases[1].status, "ACCES_ACTIVE");
    assert.ok(fanta.purchases[1].date.startsWith("2026-03-25"));
    assert.equal(
      clients.find((c) => c.legacyUserId === 2)?.purchases[0].status,
      "PAIEMENT_RECU",
    );
  });

  it("ignore les commandes en attente et garde la note de l'administrateur", () => {
    assert.equal(
      clients.some((c) => c.legacyUserId === 4),
      false,
    );
    assert.match(
      clients.find((c) => c.legacyUserId === 2)?.adminNote ?? "",
      /Import automatique/,
    );
  });
});
