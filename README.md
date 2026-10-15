# Référence Informatique

Site de Référence Informatique : services numériques sur mesure (sites web, agents IA, logiciels et automatisation, maintenance) et boutique de formations et de ressources numériques, avec espace client et administration.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (auth, base, stockage) · Prisma 7 · SasPay (paiement) · Brevo (emails) · Vercel.

## Démarrer

```bash
npm install
cp .env.example .env     # puis renseigner les valeurs
npx prisma migrate deploy
npx prisma db seed       # aligne la base sur le catalogue
npm run dev              # http://localhost:3000
```

Vérifications : `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`. Un modèle d'intégration continue GitHub est prêt dans [docs/ci-github-actions.yml](docs/ci-github-actions.yml) : il rejoue ces vérifications à chaque envoi et cherche les clés oubliées dans le code. Il n'est **pas encore actif** : GitHub refuse qu'un jeton sans la portée `workflow` publie un fichier de workflow. Pour l'activer : `gh auth refresh -h github.com -s workflow`, puis copier le fichier vers `.github/workflows/ci.yml` et pousser.

Variables d'environnement : voir [.env.example](.env.example). En production (Vercel) : `SASPAY_SECRET_KEY`, `SASPAY_WEBHOOK_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `ADMIN_NOTIFICATION_EMAIL`, plus les clés Supabase et les deux adresses de base de données. `CRON_SECRET` (facultative) active les relances automatiques des paiements non terminés. Aucune autre n'est nécessaire.

## Le catalogue : le code d'abord, l'administration ensuite

Les produits et les services sont décrits dans [lib/catalog/](lib/catalog/) :

| Fichier       | Contenu                                                      |
| ------------- | ------------------------------------------------------------ |
| `keys.ts`     | Les 4 clés de formations (réservées au Burkina Faso)         |
| `products.ts` | Les 10 autres produits (formations, livres, modèles, outils) |
| `services.ts` | Les 4 familles et 11 prestations de services                 |
| `live.ts`     | Catalogue « vivant » : code + modifications de l'équipe      |
| `index.ts`    | Accès au catalogue, **règle d'accès par pays**               |

**Règle de priorité** ([lib/catalog/live.ts](lib/catalog/live.ts)) : tant que l'équipe n'a rien modifié depuis l'administration (`adminEditedAt` vide), le **code fait foi** : une correction du code s'applique au déploiement suivant. Dès qu'un produit est modifié dans l'administration, **la base fait foi** pour ce produit. Les produits créés dans l'administration n'existent qu'en base. Une promotion avec date de fin revient seule au prix normal. Si la base est injoignable, le site retombe sur le code : les pages publiques restent disponibles.

Le **prix facturé** est toujours recalculé côté serveur à partir du catalogue vivant (jamais lu dans la requête du navigateur), y compris pour les quantités. `CATALOG_SKIP_DB=1` coupe la lecture de la base (tests, intégration continue).

## Les affiches des produits

Chaque produit de `products.ts` a une affiche 4:5 (1200 × 1500, WebP) dans `public/produits/affiches/`, à la charte : DM Serif Display et DM Sans, marine et bleu, aucun décor circulaire. Les 4 affiches des clés (`public/produits/cles/`) sont celles du propriétaire.

Règles : **aucun prix sur l'image** (le prix change, l'image non : il vit sur la fiche), aucun chiffre hors catalogue, aucun témoignage, aucun logo tiers.

Elles sont générées par [scripts/affiches/](scripts/affiches/) (illustrations en HTML/CSS, rendues par Chrome) :

```bash
npm i --no-save puppeteer-core
node scripts/affiches/generer.mjs                 # toutes
node scripts/affiches/generer.mjs performance-pc  # une seule
```

Pour changer un texte ou un chiffre d'une affiche : modifier [scripts/affiches/affiches.mjs](scripts/affiches/affiches.mjs), relancer, vérifier. Un produit créé dans l'administration reçoit son affiche depuis le formulaire (envoi d'image) ; sans affiche, la boutique affiche une couverture générée à la charte ([components/shop/product-cover.tsx](components/shop/product-cover.tsx)).

## Accès par pays

Les clés de formations ne sont **visibles et achetables qu'au Burkina Faso** (`restrictedTo: ["BF"]`).

- Le pays vient de l'en-tête `x-vercel-ip-country`, posé par Vercel (non falsifiable par le visiteur) — voir [lib/geo.ts](lib/geo.ts).
- **Échec fermé** : pays inconnu = traité comme étranger.
- Pour un visiteur étranger : pas de clé dans la boutique, ses filtres, ses suggestions, l'accueil, la FAQ, les conditions, le plan du site ; sa fiche répond 404 ; la commande est **refusée côté serveur** même si la requête est forgée ([lib/actions/order.ts](lib/actions/order.ts)).
- En local, il n'y a pas d'en-tête : le site simule le Burkina Faso. `DEV_VISITOR_COUNTRY=FR` dans `.env` simule un visiteur étranger.
- Tout nouveau produit réservé à un pays se déclare avec `restrictedTo` ; les tests ([tests/catalog.test.ts](tests/catalog.test.ts)) vérifient la règle.

## Commander sans compte

Aucun compte n'est exigé pour payer (comme sur Expert du Numérique). Le client indique son nom, son email et son téléphone (facultatif pour un produit 100 % automatique, obligatoire pour une clé ou une remise manuelle) :

1. **Un compte sans mot de passe est préparé en coulisse** à partir de son email (retrouvé s'il existe déjà) — [lib/checkout/buyer.ts](lib/checkout/buyer.ts). Ce compte n'ouvre **aucune session** à ce moment-là.
2. **Chaque commande a un lien personnel secret** (`Order.accessToken`, 32 octets aléatoires), envoyé **uniquement par email**. Le présenter prouve qu'on lit la boîte de l'acheteur. Il ouvre `/commande/suivi/<jeton>` : suivi de la commande, reprise du paiement, et — après paiement — un clic « Accéder à mon achat » qui ouvre la session **sans mot de passe** et emmène sur le contenu ([lib/checkout/access.ts](lib/checkout/access.ts)). Il est valable 90 jours après le paiement ; ensuite le client en demande un nouveau (envoyé à l'adresse du compte).
3. **Sécurité** : le jeton n'est jamais affiché à l'écran (sinon taper l'email d'un autre, payer, puis entrer dans son compte serait possible). La page de retour de paiement ne montre que l'état de la commande et l'adresse **masquée**. Commander avec l'email d'un compte existant n'ouvre aucune session et n'écrase rien.
4. **Retrouver ma commande** (`/commande/suivi`) : l'email suffit, la réponse est toujours la même (personne ne sait quelles adresses ont déjà commandé). La connexion par lien (page Connexion) fonctionne aussi pour qui a commandé sans compte.
5. **Une clé USB se livre, rien à activer** : aucun accès en ligne n'est créé pour une clé. Le client suit la livraison ; s'il se connecte ensuite, il voit sa commande et des **recommandations** ([lib/catalog/recommendations.ts](lib/catalog/recommendations.ts)).
6. **Aides** : faute de domaine d'email signalée (« gmial.com »), email masqué à l'écran, relance **unique** d'une commande jamais payée (manuelle depuis l'administration, ou automatique par la tâche planifiée `/api/cron/relances`, 1 fois par jour, **active seulement si la variable `CRON_SECRET` est définie** sur Vercel), correction d'une adresse fausse par l'équipe (l'ancien lien est invalidé).

## Comptes clients : les emails passent par Brevo

Supabase n'envoie **aucun** email. Inscription, connexion par lien, mot de passe oublié : le serveur demande à Supabase un lien (`auth.admin.generateLink`) et l'envoie lui-même par Brevo, en français, aux couleurs du site ([lib/auth/email-links.ts](lib/auth/email-links.ts), [lib/actions/auth.ts](lib/actions/auth.ts)).

- Le client peut se connecter **avec son adresse seule** : il reçoit un lien de connexion, sans mot de passe à retenir. Le mot de passe reste possible.
- Le lien arrive sur `/auth/confirm`, qui exige un **clic** avant de consommer le jeton : les logiciels de sécurité des messageries qui ouvrent les liens à l'avance ne le grillent pas.
- Un compte jamais confirmé est remplacé par la nouvelle inscription : quelqu'un d'autre n'a pas pu s'y installer avec son propre mot de passe.
- Les clients de l'ancien site (groupe **RI01**) n'ont pas de compte : ils sont visibles dans l'administration uniquement.
- Aucun SMTP n'est à régler dans Supabase.

## Paiement SasPay

[lib/payments/saspay.ts](lib/payments/saspay.ts) (client et signature des webhooks) et [lib/payments/saspay-sync.ts](lib/payments/saspay-sync.ts) (rapprochement paiement/commande). Le webhook SasPay ne contient pas notre numéro de commande : on relie par l'identifiant de session enregistré sur la commande, puis on revérifie le statut auprès de l'API. La page de retour fait la même vérification, donc un webhook perdu ne bloque pas le client. La confirmation est **atomique** (transaction, rejeu sans effet double) ; chaque webhook reçu est journalisé.

Variables : `SASPAY_SECRET_KEY` (`sk_test_…` puis `sk_live_…`, portée PAYIN) et `SASPAY_WEBHOOK_SECRET`. Webhook à déclarer dans le tableau de bord SasPay : `https://<domaine>/api/webhooks/saspay`, événement `transaction.success`.

**Frais SasPay.** Le site n'en parle pas au client : le propriétaire les absorbe. Le code demande `fee_charge_mode: "DEDUCTED"` (frais déduits du montant reçu, le client paie exactement le prix affiché). Pour que SasPay en tienne compte, il faut **activer dans le compte SasPay le choix du mode de frais par l'API** (ou régler le mode par défaut sur « déduits »). Tant que ce n'est pas fait, SasPay ajoute ses frais au montant payé par le client.

## Livrables numériques

Un produit numérique est livré par l'espace client : `Access` + module/leçon dont le fichier est dans le bucket privé `formations` (URL signée à la demande, réservée aux acheteurs). Le contenu s'ajoute **depuis l'administration**, fiche du produit, rubrique « Contenu livré » : PDF ou vidéo (MP4, WebM), 50 Mo au maximum. Le navigateur envoie le fichier directement au stockage avec un jeton limité à ce seul fichier ; le serveur contrôle ensuite le vrai type du fichier (pas seulement son extension) avant de créer la leçon.

Autre voie, pour un lot de livres : `DELIVERABLES_DIR="C:/chemin/vers/les/pdf" npx prisma db seed`.

Tant qu'aucun contenu n'est déposé, la page du produit affiche un message d'attente avec un lien WhatsApp. Pour les produits à remise manuelle (clés USB, outil, formation en direct), l'équipe suit l'état dans la commande : préparation, expédition, remise. Une clé USB n'ouvre aucun accès en ligne.

## Administration

`/admin` (réservée aux comptes administrateurs, avec double authentification TOTP facultative depuis « Sécurité »). Modules :

| Page            | À quoi elle sert                                                                   |
| --------------- | ---------------------------------------------------------------------------------- |
| Tableau de bord | Ventes confirmées sur 30 jours, tâches à faire, dernières commandes                |
| Commandes       | Recherche, filtres, détail, journal d'événements, livraison, remboursement, export |
| Clients         | Fiches, historique, accès ; clients RI01 en lecture                                |
| Accès           | Donner ou retirer l'accès à un produit, avec motif                                 |
| Produits        | Prix, promotions, textes, affiche, visibilité, création, contenu livré             |
| Services        | Textes et prix « à partir de » des prestations                                     |
| Témoignages     | Ajout, modification, masquage                                                      |
| Devis, Messages | Demandes reçues, réponse par email depuis l'administration                         |
| Emails          | Journal des emails envoyés et des échecs                                           |
| Journal         | Qui a fait quoi, quand (toutes les actions sensibles)                              |
| Paramètres      | Informations légales et coordonnées affichées sur le site                          |
| Administrateurs | Ajouter ou retirer un administrateur                                               |
| État du système | Base, stockage, Brevo, SasPay, derniers webhooks                                   |

Chaque action de l'administration revérifie le rôle côté serveur (`requireAdmin`) : masquer un bouton ne protège rien, c'est le serveur qui décide.

## Sécurité et robustesse

- **Base de données** : l'API publique de Supabase est verrouillée (migration `0003`) : aucune écriture anonyme, aucune élévation de rôle possible depuis le navigateur. Tout passe par le serveur.
- **Formulaires publics** : limitation de débit adossée à la base (tient entre les instances de Vercel) et champ piège contre les robots.
- **Emails** : envoyés après la réponse au client (un envoi lent ne ralentit jamais le paiement) ; chaque envoi est journalisé.
- **Erreurs** : pages 404 et erreur propres, sans détail technique ; l'administration affiche l'état du système.

## Charte graphique

Charte de Boulga AI (`C:\Boulga AI\boulga_ai_charte_graphique.html`) appliquée via des tokens dans [app/globals.css](app/globals.css) : marine `#0B1F3A` et bleu `#1565C0`, DM Serif Display (titres) et DM Sans (texte), rayons 8 / 12 / 16, mouvement 100–500 ms. Ne jamais coder une couleur, un rayon ou une durée en dur : tout passe par les tokens.

Icônes : jeu sur mesure dans [components/icons/icons.tsx](components/icons/icons.tsx) (contour 1,5 px, un point bleu d'accent par icône). Aucune bibliothèque d'icônes, aucun emoji, aucun décor circulaire.

Rédaction : vouvoiement, phrases courtes, promesses vérifiables, **aucune statistique, note ou témoignage inventé**. Les textes passent par `fr()` ([lib/typography.ts](lib/typography.ts)) pour la typographie française (espaces insécables, apostrophe typographique).

## Base de données et sauvegardes

Le schéma est dans [prisma/schema.prisma](prisma/schema.prisma) ; les migrations Prisma dans `prisma/migrations/` et celles propres à Supabase (comptes, stockage, verrouillage de l'API) dans `supabase/migrations/`. Appliquer en production : `npx prisma migrate deploy`.

Avant toute migration risquée, faire une sauvegarde depuis le tableau de bord Supabase (Database → Backups). Les sauvegardes quotidiennes automatiques dépendent de l'offre Supabase ; sur l'offre gratuite, exporter la base régulièrement.
