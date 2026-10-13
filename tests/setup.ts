// Chargé en premier par chaque fichier de test : aucune connexion à la base,
// le catalogue du code fait foi (lib/catalog/live.ts).
process.env.CATALOG_SKIP_DB = "1";
