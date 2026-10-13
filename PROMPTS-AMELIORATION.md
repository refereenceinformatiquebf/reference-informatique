# Prompts d'amélioration — Référence Informatique

Écrit pour : une future session Claude Code qui n'a pas le contexte de l'audit du 13/10/2026.

Chaque prompt ci-dessous est autonome. Collez d'abord le **contexte commun**, puis UN prompt à la fois. Faites valider chaque chantier avant de passer au suivant.

## Ordre recommandé

| Priorité                           | Chantiers | Pourquoi                                              |
| ---------------------------------- | --------- | ----------------------------------------------------- |
| **P0** — avant toute communication | 1 à 6     | Sécurité, argent, livraison des clés, messages perdus |
| **P1** — exploitation au quotidien | 7 à 12    | Rendre l'administration réellement complète           |
| **P2** — conversion et qualité     | 13 à 21   | Ventes, SEO, accessibilité, performance               |
| **P3** — durabilité                | 22 à 26   | Tests, protections, sauvegardes, documentation        |

## Ce que vous devez faire vous-même (Claude ne peut pas le faire à votre place)

1. **Supabase → Authentication → Emails → SMTP Settings** : brancher Brevo (voir chantier 6).
2. **Supabase → Authentication → Emails → Templates** : coller les modèles français (chantier 6).
3. **Tester le site depuis un téléphone avec les données mobiles Orange ou Moov du Burkina**, sans Wi-Fi, et noter le temps de chargement de l'accueil (chantier 26).
4. **Régénérer le mot de passe de la base** dans Supabase (Settings → Database), puis mettre à jour `DATABASE_URL` et `DIRECT_URL` dans `.env` et dans Vercel (chantier 24).
5. Décider côté commerce : qui paie les frais SasPay (chantier 15), et si un client peut commander plusieurs clés (chantier 16).

---

## Contexte commun (à coller en tête de chaque prompt)

```
Projet : site de Référence Informatique (Burkina Faso), dossier C:\reference-informatique\reference-informatique-v2.
Pile : Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4 (jetons dans @theme inline, règles de base dans @layer base),
Prisma 7 + @prisma/adapter-pg, Supabase (Auth, Postgres, Storage), Vercel (déploiement depuis GitHub), Brevo (emails), SasPay (paiement).
Production : https://www.reference-informatique.com (l'adresse sans www redirige vers www).

Règles du projet :
- Tout le texte visible est en français correct (accents, espaces insécables avant : ; ! ? « » via lib/typography.ts : fr()/deepFr()). Prix via lib/format.ts.
- Charte graphique de Boulga AI : marine #0B1F3A, bleu #1565C0, DM Serif Display (titres) + DM Sans. Pas de cercles décoratifs en arrière-plan. Icônes maison dans components/icons.
- Aucun chiffre, témoignage, délai ou garantie inventé. Si une donnée manque, demande-la.
- Catalogue = code (lib/catalog/*). Les prix viennent TOUJOURS du catalogue, jamais du navigateur. Les 4 « clés de formations » sont réservées aux visiteurs du Burkina
  (en-tête x-vercel-ip-country, lib/geo.ts, échec fermé : pays inconnu = étranger). Ne jamais affaiblir cette règle.
- Les écritures en base passent par Prisma (rôle postgres), jamais par l'API publique Supabase. Les actions serveur d'administration appellent requireAdmin().
- Webhook SasPay : signature HMAC-SHA256 « {timestamp}.{corps brut} », tolérance ±5 min ; le statut réel vient de l'API SasPay (lib/payments/saspay-sync.ts).
- Un seul point pour marquer une commande payée : lib/orders.ts → markOrderPaid.
- Ne JAMAIS afficher, journaliser ni écrire dans un fichier suivi par Git une clé ou un mot de passe. .env est ignoré par Git ; .env.example reste vide.
- Ne pas pousser sur GitHub sans demande explicite (un push redéploie la production). Commits : git commit -F fichier (messages longs), avec la ligne Co-Authored-By.
- Environnement Windows : chemins avec / pour node, PowerShell -LiteralPath pour les chemins avec crochets, redémarrer `npm run dev` après un changement de schéma Prisma.
- Avant de dire « terminé » : npm run typecheck, npx eslint, npm test (42 tests au départ), puis un test réel dans le navigateur (puppeteer-core + Chrome installé).
  Les tests qui écrivent en base utilisent des données marquées « TEST AUDIT » et les suppriment ensuite ; la base locale est la base de production.
- Livre un compte rendu honnête : ce qui est vérifié, ce qui ne l'est pas, ce qui reste.
```

---

# P0 — Sécurité, argent, livraison

## 1. Verrouiller l'API publique de la base (faille d'escalade de rôle)

```
Objectif : empêcher tout utilisateur connecté de devenir administrateur, et tout anonyme d'écrire dans la base par l'API publique.

Constat (lu dans la base en ligne le 13/10/2026) :
- Politique « Modifier son propre profil » sur profiles : USING (auth.uid() = id), sans WITH CHECK. Le rôle `authenticated` a UPDATE sur toute la table. Donc
  PATCH /rest/v1/profiles?id=eq.<son id> avec { "role": "ADMIN" } est possible depuis le navigateur avec la clé publique, et le site fait confiance à profiles.role.
- quote_requests et contact_messages acceptent des INSERT anonymes directs (WITH CHECK true), sans rate limit ni validation.
- _prisma_migrations n'a pas de RLS.
La correction est écrite dans supabase/migrations/0003_lock_down_data_api.sql (non appliquée).

À faire :
1. Relire ce fichier SQL, le corriger si besoin (le site n'utilise l'API publique que pour lire SON profil : components/marketing/use-current-profile.ts).
2. L'appliquer dans le SQL Editor de Supabase (ou me donner le SQL à copier si tu n'as pas d'accès), puis lancer les 3 requêtes de vérification en bas du fichier.
3. Vérifier en lecture seule avec la clé publique que : les tables personnelles renvoient 0 ligne ; le catalogue reste lisible ; l'espace client, l'admin, la commande,
   le devis et le contact fonctionnent toujours (tests navigateur).
4. Ajouter à README.md une section « Sécurité de l'API publique » qui explique la règle : le navigateur ne fait que lire son profil.

Critères d'acceptation : aucune requête d'écriture anonyme ou `authenticated` ne passe (testée sur une copie ou par inspection de information_schema.role_table_grants) ;
tous les parcours du site fonctionnent ; le fichier 0003 est commité (sans push).
```

## 2. Mettre à jour Next.js et les dépendances vulnérables

```
Objectif : corriger les vulnérabilités signalées par `npm audit --omit=dev` (8 : 7 élevées, 1 critique).

Constat : next 16.3.0 est dans la plage vulnérable (16.0.0 à 16.3.7) : exécution de code à distance via l'optimisation d'images AVIF et next/og, SSRF dans l'optimisation
d'images, empoisonnement de cache. Correctif disponible : next 16.4.0. Aussi : sharp, fast-uri, source-map-js (correctif sans rupture via `npm audit fix`).
Attention : npm propose de « corriger » prisma en passant à 6.19.3 (version majeure plus ancienne) : NE PAS le faire. Ces alertes (mysql2, deepmerge-ts) concernent l'outil CLI Prisma, pas le site en ligne.

À faire :
1. Mettre next (et eslint-config-next si présent) à la dernière 16.x corrigée ; lancer `npm audit fix` sans --force ; ne pas toucher à la version majeure de Prisma.
2. Vérifier : typecheck, eslint, npm test, `npm run build` (arrêter d'abord `npm run dev`), puis un parcours navigateur : accueil, boutique, fiche produit, commande, admin.
3. Vérifier que les changements de Next 16.x ne cassent pas proxy.ts, les actions serveur, ni lib/geo.ts (test avec l'en-tête x-vercel-ip-country: BF puis FR).
4. Commiter. Ne pas pousser sans accord.

Critères d'acceptation : `npm audit --omit=dev` ne signale plus de vulnérabilité sur next, sharp, fast-uri, source-map-js ; build vert ; parcours navigateur identique.
```

## 3. Rendre l'adresse de livraison visible et suivre la livraison des clés

```
Objectif : l'équipe doit voir où livrer chaque clé USB et suivre l'avancement. Aujourd'hui l'adresse est enregistrée (Order.shippingCity/shippingAddress/shippingPhone)
mais n'apparaît NULLE PART pour une commande payée en ligne (ni dans /admin/commandes, ni dans l'email d'alerte). Seules les commandes WhatsApp la contiennent (dans le message du client).

À faire :
1. Prisma : ajouter à Order un statut de livraison (enum DeliveryStatus : A_PREPARER, EN_LIVRAISON, LIVREE ; null pour les produits non physiques) + date de livraison. Migration + application en base.
   markOrderPaid : pour un produit à livraison « cle-physique », initialiser à A_PREPARER.
2. /admin/commandes : afficher pour chaque commande de clé la ville, l'adresse, le téléphone de livraison, avec un lien WhatsApp vers shippingPhone (pas seulement le téléphone du profil),
   un filtre « À livrer » et des actions « Marquer en livraison » / « Marquer livrée » (requireAdmin, revalidatePath).
3. Email d'alerte à l'équipe : à l'instant du paiement (markOrderPaid, pas seulement à la création), envoyer le récapitulatif de livraison pour les clés
   (produit, montant, nom, téléphone, ville, adresse). Modifier lib/email/templates/new-order-admin.tsx en conséquence.
4. Tableau de bord admin : compteur « Livraisons à faire ».
5. Test navigateur bout en bout : commande de clé (en-tête BF) par WhatsApp puis confirmation admin ; vérifier l'affichage et les changements de statut. Nettoyer les données de test.

Critères d'acceptation : une commande de clé payée apparaît avec son adresse complète dans l'admin et dans l'email ; le statut de livraison se change ; les tests passent.
```

## 4. Messages « Poser une question » : les rendre visibles et notifier l'équipe

```
Objectif : aucun message de client ne doit rester invisible.

Constat : lib/actions/contact.ts enregistre le message dans contact_messages (le champ `handled` existe mais n'est jamais utilisé), mais aucune page admin ne le lit
et aucun email n'est envoyé (le commentaire du code renvoie à une « Étape 12 » jamais faite). Le site répond pourtant « Nous vous répondons rapidement ».

À faire :
1. Email de notification à ADMIN_NOTIFICATION_EMAIL à chaque message (Reply-To = l'email du client pour qu'un « Répondre » lui arrive directement), via lib/email/send.ts + un gabarit
   cohérent avec lib/email/templates/layout.tsx. L'envoi ne doit jamais faire échouer l'enregistrement du message.
2. Page /admin/messages : liste, filtre non traités / traités, bouton « Marquer comme traité » (champ `handled`), lien WhatsApp et mailto, pagination. Ajouter l'entrée au menu (app/admin/layout.tsx).
3. Même chose pour les devis : afficher et permettre d'éditer `QuoteRequest.internalNote` (champ existant, non utilisé) dans /admin/devis, et notifier à l'enregistrement (déjà fait : vérifier).
4. Tableau de bord : compteur « Messages non traités ».
5. Test navigateur : envoi du formulaire, email reçu (Brevo : vérifier la livraison), message visible et traitable en admin. Nettoyer.

Critères d'acceptation : un message de contact déclenche un email à l'équipe et apparaît dans /admin/messages ; marquage traité fonctionnel ; tests passent.
```

## 5. Rendre la confirmation de paiement atomique

```
Objectif : un paiement ne doit jamais rester « enregistré mais commande non payée ».

Constat : lib/orders.ts → markOrderPaid enchaîne payment.create, order.update, access.upsert SANS transaction. Si le processus s'arrête après payment.create, le rejeu
du webhook rencontre la contrainte unique (P2002), répond « déjà traité », et la commande reste EN_ATTENTE : le client a payé mais n'a pas son accès.
Autre point : lib/actions/admin-orders.ts → cancelOrder annule n'importe quelle commande, y compris déjà payée, et ne retire pas l'accès.

À faire :
1. Envelopper payment.create + order.update + access.upsert (+ statut de livraison du chantier 3) dans prisma.$transaction ; gérer P2002 à l'intérieur pour rester idempotent,
   et si le Payment existe déjà mais que la commande n'est pas PAYE, terminer le travail (réparation) au lieu de répondre « déjà traité ».
2. Les emails restent HORS transaction, après validation, et un échec d'email ne doit rien annuler.
3. cancelOrder : refuser si la commande est PAYE (message clair) ; si l'on veut un remboursement, prévoir une action distincte « Rembourser/Annuler après paiement » qui retire l'accès, avec confirmation.
4. Tests unitaires (tests/orders.test.ts) : double appel concurrent, rejeu après échec partiel simulé, annulation d'une commande payée refusée. Pas de test qui écrit en production sans nettoyage.

Critères d'acceptation : les 3 scénarios ci-dessus sont couverts par des tests verts ; un rejeu de webhook sur une commande à moitié traitée la termine.
```

## 6. Emails de connexion Supabase : SMTP Brevo et modèles français

```
Objectif : les emails de confirmation d'inscription et de réinitialisation de mot de passe doivent arriver, en français, à l'image de la marque, depuis hello@reference-informatique.com.

Constat : la confirmation d'email est activée (l'inscription répond « Vérifiez votre boîte mail »). Les emails partent aujourd'hui du service par défaut de Supabase : texte anglais,
expéditeur Supabase, quota très limité. Un compte client (c***@gmail.com) est inscrit mais jamais confirmé : signe probable d'un email non reçu ou classé en spams.

À faire (partie code) :
1. Créer docs/supabase-emails/ avec 4 modèles HTML français, aux couleurs de la charte, compatibles clients mail (tables, styles en ligne) : confirmation d'inscription ({{ .ConfirmationURL }}),
   réinitialisation de mot de passe, changement d'adresse, lien magique. Même habillage que lib/email/templates/layout.tsx. Objets de mail en français.
2. Dans docs/supabase-emails/LISEZ-MOI.md, écrire pas à pas (captures non nécessaires) : Authentication → Emails → SMTP Settings (hôte smtp-relay.brevo.com, port 587,
   identifiant SMTP Brevo, mot de passe = clé SMTP Brevo, expéditeur hello@reference-informatique.com, nom « Référence Informatique »), puis Templates, puis Authentication → URL Configuration
   (Site URL https://www.reference-informatique.com, Redirect URLs incluant /reinitialiser-mot-de-passe).
3. Vérifier que la page /reinitialiser-mot-de-passe gère un lien expiré (message clair + lien vers « Mot de passe oublié »).
Partie manuelle (l'utilisateur) : saisir les réglages dans Supabase et coller les modèles ; puis faire un vrai test : inscription avec une adresse +alias, réception, clic, connexion ;
mot de passe oublié, réception, clic, nouveau mot de passe. Supprimer ensuite le compte de test (API admin, clé service_role dans .env).

Critères d'acceptation : les 2 parcours (inscription, mot de passe oublié) fonctionnent de bout en bout avec des emails français reçus en boîte de réception.
```

---

# P1 — Administration complète

## 7. Layout d'administration dédié

```
Objectif : une vraie interface d'administration, distincte du site public.
Constat : /admin affiche l'en-tête et le pied de page du site public autour d'un menu horizontal minimal ; pas d'indicateur de notifications.
À faire : layout admin propre (barre latérale sur ordinateur, menu repliable sur mobile 320 px), sans en-tête/pied publics (utiliser un groupe de routes ou un layout racine séparé),
entrées : Tableau de bord, Commandes, Devis, Messages, Clients, Accès, Catalogue, Témoignages ; badges de comptage (devis en attente, messages non traités, livraisons à faire).
Charte Boulga AI, accessible au clavier, lien « Voir le site », bouton de déconnexion. Aucun débordement horizontal de 320 à 1440 px (outil : overflow-audit.mjs).
Critères : toutes les pages admin existantes fonctionnent dans le nouveau cadre ; test mobile + ordinateur avec captures.
```

## 8. Commandes v2 : recherche, détail, vérification SasPay

```
Objectif : traiter les commandes sans ouvrir la base.
Constat : /admin/commandes liste 100 commandes max, sans recherche, sans pagination, sans détail ; ni email du client, ni paiements ; les commandes SasPay en attente n'ont aucune action.
À faire :
1. Recherche (nom, téléphone, email, référence), filtres (statut, canal, produit, période), pagination côté serveur (20 par page), tri.
2. Page de détail /admin/commandes/[id] : client (nom, email via Supabase admin, téléphone, WhatsApp), produit, montant, canal, paiements (fournisseur, référence, date, statut brut),
   livraison (chantier 3), historique, notes internes (nouveau champ Order.internalNote).
3. Action « Vérifier auprès de SasPay » pour une commande SASPAY en attente (réutiliser syncSaspayOrder) avec message de résultat ; action « Relancer le client sur WhatsApp » (lien pré-rempli).
4. Export CSV des commandes filtrées (admin uniquement, sans données de carte — il n'y en a pas).
5. Tests : requêtes de filtre, actions refusées pour un non-admin. Test navigateur avec commandes de test supprimées ensuite.
Critères : les 5 points fonctionnent ; la page reste rapide avec 1 000 commandes (pagination serveur).
```

## 9. Gestion manuelle des accès

```
Objectif : accorder ou retirer un accès sans passer par une commande (cas support, clients de l'ancien site).
Constat : aucune interface ; la seule voie est markOrderPaid.
À faire : page /admin/acces et section dans la fiche client : lister les accès d'un client (produit, date), « Donner l'accès » (choix du produit du catalogue visible ou non, motif obligatoire),
« Retirer l'accès » (confirmation). Journaliser (table AccessLog : qui, quand, motif) — créer le modèle + migration. Email « Votre accès est prêt » optionnel (case à cocher).
requireAdmin partout. Les accès aux clés restent soumis à la règle géographique pour l'ACHAT, pas pour l'attribution manuelle par l'admin.
Critères : attribution, retrait et journal fonctionnent ; un client voit immédiatement le produit dans « Mes formations ».
```

## 10. Clients v2 : pagination, fiche, notes, export

```
Objectif : exploiter les 167 clients RI01 (et les futurs comptes) confortablement.
Constat : /admin/clients rend les 167 lignes d'un coup (page de 22 500 px sur mobile), sans pagination, sans fiche, sans notes ; aucun lien entre un client RI01 et un compte du site.
À faire : pagination et recherche côté serveur (nom, téléphone, email, code RI01), fiche client (/admin/clients/[id]) avec achats, notes internes, bouton WhatsApp, historique de commandes du site si le téléphone ou l'email correspond,
export CSV. Ne PAS créer de comptes de connexion pour les clients RI01 ; proposer plutôt un lien d'invitation « Créer mon compte » à leur envoyer par WhatsApp (page d'inscription préremplie, sans mot de passe).
Mobile : cartes empilées au lieu d'un grand tableau. Table legacy_clients : RLS activée sans politique — ne pas l'ouvrir à l'API publique.
Critères : liste fluide, recherche instantanée, fiche, export ; aucun compte créé automatiquement.
```

## 11. Tableau de bord v2

```
Objectif : voir en 10 secondes ce qu'il faut faire aujourd'hui.
Constat : 4 chiffres seulement (commandes du mois, CA, devis en attente, accès actifs) ; pas de liste ni d'alerte.
À faire : « À faire maintenant » (livraisons à faire, devis nouveaux, messages non traités, commandes WhatsApp à confirmer, commandes SasPay en attente depuis plus de 2 h),
« Dernières commandes » (10), « Ventes sur 30 jours » (petit graphique en SVG léger, sans bibliothèque lourde), top produits du mois, alerte si le dernier webhook SasPay date de plus de N jours alors que des
commandes ont été payées (créer un modèle WebhookEvent léger alimenté par app/api/webhooks/saspay/route.ts). Chiffres calculés en base uniquement, jamais inventés ; états vides soignés.
Critères : chaque carte renvoie vers la liste filtrée correspondante ; page rapide (requêtes en parallèle).
```

## 12. Catalogue, prix et témoignages modifiables sans développeur

```
Objectif : changer un prix, un prix barré, la disponibilité ou publier un témoignage sans modifier le code.
Constat : le catalogue est dans le code (lib/catalog/*) ; tout changement de prix exige un déploiement. La table Testimonial existe mais aucune page admin ; Article et CaseStudy existent sans aucune page publique.
Recommandation (à confirmer avant de coder) : conserver les textes longs dans le code, et ajouter une table `ProductOverride` (slug, prix, prix barré, actif, badge) lue par lib/catalog avec repli sur le code ;
la règle géographique des clés reste dans le code et n'est pas modifiable depuis l'admin.
À faire : validation du plan avec l'utilisateur, puis /admin/catalogue (liste, édition des 4 champs, aperçu du prix affiché, historique des changements) et /admin/temoignages (créer, publier, dépublier, supprimer ;
les témoignages publiés alimentent les pages existantes). Décider avec l'utilisateur de la suppression ou de l'activation de Article/CaseStudy (blog et réalisations) : ne pas laisser des modèles morts.
Critères : changement de prix visible sur le site, dans la commande et dans SasPay sans redéploiement ; commandes en attente remises au prix actuel (comportement existant à conserver) ; tests catalogue mis à jour.
```

---

# P2 — Conversion, SEO, accessibilité, performance

## 13. Page 404 et erreurs en français

```
Constat : /page-inconnue et les clés vues par un visiteur étranger affichent la page Next.js par défaut en anglais (« 404: This page could not be found. »). Aucun not-found.tsx ni error.tsx.
À faire : app/not-found.tsx (titre, phrase utile, boutons Accueil / Boutique / WhatsApp), app/error.tsx et app/global-error.tsx (message sobre, bouton « Réessayer », lien WhatsApp), loading.tsx pour boutique et espace client.
Pour une clé demandée par un visiteur hors du Burkina, garder un vrai statut 404 (ne pas révéler l'existence du produit) mais avec le message générique. Tests : statut HTTP 404 conservé, pas d'erreur console.
```

## 14. SEO : canonical, images de partage, mentions légales

```
Constat (exploration de 46 pages en production) : canonical absente sur l'accueil, /connexion, /inscription, /mot-de-passe-oublie ; og:image absente sur TOUTES les fiches produit (le partage WhatsApp/Facebook
n'affiche aucune image) ; pas de page « Mentions légales ».
À faire : alternates.canonical sur chaque page (via une fonction commune), openGraph.images + twitter:card sur fiches produit et services (image de couverture du produit ; image dédiée par famille de service),
mentions légales (raison sociale, adresse, contact, hébergeur Vercel, directeur de publication : DEMANDER les informations réelles à l'utilisateur, ne rien inventer) liée dans le pied de page et le sitemap,
lastmod dans app/sitemap.ts. Vérifier que les clés restent exclues du sitemap et des métadonnées pour les visiteurs étrangers.
Test : relancer l'exploration (crawl.mjs) : 0 remarque ; aperçu du partage vérifié avec un outil de débogage Open Graph.
```

## 15. Frais SasPay : transparence ou prise en charge

```
Constat : sur la page SasPay, un livre à 3 900 F CFA est facturé 4 047 XOF (+147 XOF de frais, environ 3,8 %) au client. Le site n'en parle nulle part : risque de perte de confiance et d'abandon au dernier écran.
Décision commerciale à demander à l'utilisateur : (a) prendre les frais à la charge de l'entreprise, (b) les afficher avant le clic, (c) les intégrer aux prix.
À faire après décision : pour (b), une phrase claire sur la page de commande (« Des frais du réseau de paiement peuvent s'ajouter à l'écran suivant »), dans les CGV et la FAQ ; ne pas inventer de pourcentage :
lire les frais réels dans la configuration SasPay ou dans la doc. Pour (a) ou (c), vérifier la configuration côté SasPay. Mettre à jour les textes et tester une session réelle (annulée ensuite par cancelSaspaySession).
```

## 16. Clés : quantité et recommande

```
Constat : getOrCreatePendingOrder (lib/actions/order.ts) renvoie vers l'espace client si le client a déjà une commande PAYE pour ce produit. Un client ne peut donc pas commander une seconde clé (famille, cadeau).
À faire (après validation commerciale) : champ « Nombre de clés » (1 à 5) pour les produits à livraison physique, montant = prix × quantité calculé côté serveur uniquement, quantité stockée sur Order, affichée dans l'admin
et les emails, une seule livraison par commande. Pour les produits numériques, conserver le comportement actuel. Tests : calcul du montant, refus d'une quantité hors bornes, commande identique relancée.
```

## 17. Emails transactionnels adaptés au mode de livraison

```
Constat : tous les emails disent « votre accès est activé automatiquement », y compris pour une clé USB physique ou un produit remis manuellement.
À faire : adapter order-confirmation, payment-confirmation et access-granted selon delivery ("cle-physique" : livraison gratuite 24 à 48 h, rappel de l'adresse saisie, numéro WhatsApp ; "manuel" : l'équipe contacte le client sur WhatsApp ;
"numerique" : lien direct vers /espace-client). Les textes reprennent exactement les promesses déjà publiées dans components/shop/how-it-works.tsx (24 à 48 h) : ne rien promettre de plus.
Prévisualisation dans /dev/emails (réservée au développement, 404 en production — à conserver). Test : envoi réel d'un exemplaire de chaque gabarit vers l'adresse de l'équipe, réception vérifiée.
```

## 18. Accessibilité (Lighthouse 94 à 100)

```
Constat (Lighthouse mobile, production) : accessibilité 100 sur la plupart des pages, mais :
- le lien du logo a aria-label « Référence Informatique — accueil » alors que le texte visible est « Référence INFORMATIQUE » (nom accessible non conforme) ;
- étiquettes en majuscules de 11 px en text-ink-faint et pastille de compteur bg-white/20 : contraste insuffisant ;
- cartes produit avec h3 sans h2 précédent (ordre des titres) ;
- avertissement Next : ajouter data-scroll-behavior="smooth" sur <html>.
À faire : corriger ces 4 points sans changer la charte (foncer légèrement le gris des petites étiquettes), vérifier le focus visible et la navigation au clavier du menu mobile et du formulaire de commande,
relancer Lighthouse (viser 100 partout). Pour les mesures depuis ce poste, forcer l'IP qui répond (voir chantier 26).
```

## 19. Performance : pages dynamiques et JavaScript

```
Constat : l'accueil est servi en « Cache-Control: private, no-cache, no-store » (X-Vercel-Cache: MISS) : toutes les pages sont rendues à chaque visite parce que le pays du visiteur est lu pour la règle des clés.
Lighthouse mobile (connexion correcte) : accueil 89, service 85 (LCP 3,5 s), fiche produit 95, boutique 99 ; ~81 Kio de JavaScript inutilisé.
À faire : isoler la lecture du pays dans les seules zones qui en dépendent (liste boutique, fiches de clés, sections « clés » de l'accueil/FAQ/CGV) avec un composant dynamique derrière Suspense / Partial Prerendering,
afin que le reste des pages soit statique et mis en cache (ISR) ; ne JAMAIS mettre en cache une page qui montre ou cache les clés selon le pays sans clé de variation fiable.
Réduire le JavaScript chargé (imports dynamiques pour les parties interactives non critiques), optimiser l'image LCP des pages service. Garder la sécurité : en cas de doute, la page reste dynamique.
Mesures avant/après : TTFB, LCP, TBT, X-Vercel-Cache. Tests de non-régression sur la règle géographique (BF / FR / inconnu) sur les routes concernées.
```

## 20. Visiteurs au Burkina mal localisés

```
Constat : la règle des clés repose sur l'adresse IP (échec fermé). Un client réellement au Burkina dont l'IP est mal localisée (réseau mobile, VPN, partage de connexion) ne voit aucune clé et ne sait pas pourquoi.
À faire : sur /boutique et la page d'accueil pour les visiteurs hors Burkina, un encart sobre « Vous êtes au Burkina Faso et vous ne voyez pas les clés de formations ? Écrivez-nous sur WhatsApp » avec message
prérempli ; l'équipe peut alors traiter la commande manuellement (action admin « Créer une commande pour ce client », réservée à l'admin, avec adresse de livraison obligatoire au Burkina).
Ne PAS ajouter de bouton « Je suis au Burkina » côté visiteur (contournable). Garder les clés hors sitemap et hors résultats de recherche pour les étrangers.
Tests : visiteur FR ne voit pas les clés (liste, fiche en 404, commande refusée côté serveur) ; l'encart apparaît ; l'action admin fonctionne.
```

## 21. Livraison du contenu des formations « manuelles »

```
Constat : seuls 3 livres numériques ont du contenu dans la plateforme (3 modules, 3 leçons, fichiers dans le stockage privé « formations »). Les packs et formations vidéo sont remis « manuellement » sur WhatsApp ;
la page de lecture affiche alors un message d'attente.
À faire : formulaire admin d'ajout de contenu (module, leçon, fichier PDF/vidéo envoyé vers le bucket privé « formations », ordre) ; lecteur vidéo sécurisé (URL signée courte, déjà en place pour les PDF : lib/storage.ts) ;
progression des leçons ; pour les très gros volumes (clés USB de plusieurs Go), garder la livraison physique. Ne créer aucun contenu factice : l'utilisateur fournit les fichiers.
Masquer la barre de progression « 0 / 1 leçons vues » pour un livre d'une seule leçon, et marquer la leçon comme vue à l'ouverture.
Tests : accès refusé sans achat (401/403/404 déjà vérifiés), lien signé valide puis expiré.
```

---

# P3 — Durabilité

## 22. Tests automatisés de bout en bout et intégration continue

```
Constat : 42 tests unitaires (catalogue, SasPay, import RI01) ; aucun test automatisé des parcours (devis, commande, confirmation, webhook, règle géographique, admin).
À faire : suite Playwright (ou puppeteer-core déjà utilisé) lancée contre une base de test dédiée (projet Supabase gratuit séparé) — JAMAIS contre la production ; scénarios : devis, question, commande WhatsApp + confirmation admin + accès au livre,
paiement SasPay en mode test (clé sk_test_), webhook signé valide/invalide/périmé, visiteur BF/FR, accès admin refusé à un client, 404 sur clé pour un étranger. GitHub Actions : typecheck, eslint, tests unitaires, build, tests E2E sur les pull requests.
Critères : pipeline vert sur une branche ; guide d'exécution local dans README.md.
```

## 23. Anti-spam et limites de débit fiables

```
Constat : lib/rate-limit.ts garde les compteurs en mémoire de chaque instance serverless : limite non fiable en production (documenté). Aucun anti-robot sur les formulaires.
À faire : compteur partagé (Upstash Redis ou équivalent, plan gratuit) pour connexion, inscription, mot de passe oublié, devis, contact, commande ; Cloudflare Turnstile (gratuit) ou champ piège sur devis, contact et inscription.
Messages d'erreur en français, sans révéler quoi que ce soit sur les comptes existants. Variables d'environnement documentées dans .env.example (vides). Tests : dépassement de limite, jeton anti-robot manquant.
```

## 24. Rotation des secrets et hygiène

```
Constat : le mot de passe de la base a été affiché une fois dans une sortie de console pendant le développement ; des clés (Brevo, SasPay) ont transité par des fichiers locaux et des captures.
À faire (guidé, l'utilisateur agit dans les tableaux de bord) : régénérer le mot de passe de la base (Supabase), mettre à jour DATABASE_URL/DIRECT_URL (.env et Vercel), puis redéployer ;
régénérer la clé API Brevo et la clé SMTP si l'utilisateur le souhaite ; vérifier qu'aucun secret n'est dans l'historique Git (git log -p sur .env*, recherche de sk_live_, xkeysib-, xsmtpsib-, service_role) ;
ajouter un contrôle de secrets en intégration continue (gitleaks). Vérifier dans Vercel que seules les variables nécessaires existent et que SASPAY_* est limité à Production ; supprimer les anciennes variables FEDAPAY_*.
```

## 25. Sauvegardes, surveillance, procédure d'incident

```
Constat : aucune surveillance ni procédure documentée. Le projet Supabase a déjà été mis en pause une fois (le site a alors renvoyé des erreurs 500).
À faire : vérifier le plan Supabase (sauvegardes quotidiennes, risque de pause), export mensuel (script pg_dump documenté, stocké hors du dépôt) ; supervision de disponibilité gratuite (UptimeRobot ou équivalent) sur / , /boutique, /api/webhooks/saspay (405 attendu) ;
alertes Vercel (échecs de déploiement) ; journalisation des erreurs (Sentry gratuit) ; page /admin/etat qui contrôle en direct : base, Supabase Auth, Storage, Brevo (compte), SasPay (lecture), dernier webhook.
Rédiger docs/PROCEDURES.md : site hors ligne, paiement débité sans accès (utiliser « Vérifier auprès de SasPay »), remboursement, perte de mot de passe admin, restauration de la base.
```

## 26. Joignabilité depuis le Burkina et vérification réelle

```
Constat : depuis un réseau marocain, l'adresse 64.29.17.1 (l'une des deux adresses de www.reference-informatique.com chez Vercel) est injoignable (0 connexion sur 6) alors que 216.198.79.1 répond ;
18 points de mesure dans le monde joignent les deux. Une connexion neuve choisissant la mauvaise adresse expire au bout de 21 s avant de basculer. Cela peut toucher certains opérateurs africains.
À faire : (1) l'utilisateur teste le site en 4G Orange puis Moov au Burkina (temps de la première ouverture, plusieurs essais) et transmet les résultats ; (2) si le problème existe, ouvrir un ticket Vercel avec les mesures
et envisager un CDN/DNS devant le site (Cloudflare gratuit, mode DNS ou proxy) en conservant HTTPS, la redirection apex → www et l'en-tête de pays x-vercel-ip-country (attention : derrière un proxy tiers, l'en-tête de
pays Vercel n'est plus fiable : revoir lib/geo.ts avec l'en-tête du CDN, toujours en échec fermé) ; (3) documenter la conclusion. Ne rien changer au DNS sans validation de l'utilisateur.
```
