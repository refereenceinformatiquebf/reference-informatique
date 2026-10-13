# Référence Informatique

Site de Référence Informatique : services numériques sur mesure (sites web, agents IA, logiciels et automatisation, maintenance) et boutique de formations et de ressources numériques.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (auth, base, stockage) · Prisma · SasPay (paiement) · Brevo (emails) · Vercel.

## Démarrer

```bash
npm install
cp .env.example .env     # puis renseigner les valeurs
npx prisma migrate deploy
npx prisma db seed       # aligne la base sur le catalogue
npm run dev              # http://localhost:3000
```

Vérifications : `npm run typecheck` · `npm run lint` · `npm test` · `npm run build`.

## Le catalogue vit dans le code

Les produits et les services sont dans [lib/catalog/](lib/catalog/), pas en base :

| Fichier       | Contenu                                                      |
| ------------- | ------------------------------------------------------------ |
| `keys.ts`     | Les 4 clés de formations (réservées au Burkina Faso)         |
| `products.ts` | Les 10 autres produits (formations, livres, modèles, outils) |
| `services.ts` | Les 4 familles et 11 prestations de services                 |
| `index.ts`    | Accès au catalogue, **règle d'accès par pays**               |

Pourquoi : ce sont des textes qui changent rarement, qu'on veut relire en revue de code, et les pages publiques restent disponibles même si la base est injoignable. La base ne garde que les lignes nécessaires aux commandes et aux devis ; elles sont créées à la demande par [lib/catalog/db-sync.ts](lib/catalog/db-sync.ts), qui prend toujours le **prix du catalogue** : un prix modifié dans le code s'applique à la commande suivante, sans re-seed.

Pour modifier un texte ou un prix : éditer le fichier du catalogue, relancer `npm test`, déployer.

## Accès par pays

Les clés de formations ne sont **visibles et achetables qu'au Burkina Faso** (`restrictedTo: ["BF"]`).

- Le pays vient de l'en-tête `x-vercel-ip-country`, posé par Vercel (non falsifiable par le visiteur) — voir [lib/geo.ts](lib/geo.ts).
- **Échec fermé** : pays inconnu = traité comme étranger.
- Pour un visiteur étranger : pas de clé dans la boutique, ses filtres, ses suggestions, l'accueil, la FAQ, les conditions, le plan du site ; sa fiche répond 404 ; la commande est **refusée côté serveur** même si la requête est forgée ([lib/actions/order.ts](lib/actions/order.ts)).
- En local, il n'y a pas d'en-tête : le site simule le Burkina Faso. `DEV_VISITOR_COUNTRY=FR` dans `.env` simule un visiteur étranger.
- Tout nouveau produit réservé à un pays se déclare avec `restrictedTo` ; les tests ([tests/catalog.test.ts](tests/catalog.test.ts)) vérifient la règle.

## Charte graphique

Charte de Boulga AI (`C:\Boulga AI\boulga_ai_charte_graphique.html`) appliquée via des tokens dans [app/globals.css](app/globals.css) : marine `#0B1F3A` et bleu `#1565C0`, DM Serif Display (titres) et DM Sans (texte), rayons 8 / 12 / 16, mouvement 100–500 ms. Ne jamais coder une couleur, un rayon ou une durée en dur : tout passe par les tokens.

Icônes : jeu sur mesure dans [components/icons/icons.tsx](components/icons/icons.tsx) (contour 1,5 px, un point bleu d'accent par icône). Aucune bibliothèque d'icônes, aucun emoji.

Rédaction : vouvoiement, phrases courtes, promesses vérifiables, **aucune statistique, note ou témoignage inventé**. Les textes passent par `fr()` ([lib/typography.ts](lib/typography.ts)) pour la typographie française (espaces insécables, apostrophe typographique).

## Paiement SasPay

[lib/payments/saspay.ts](lib/payments/saspay.ts) (client et signature des webhooks) et [lib/payments/saspay-sync.ts](lib/payments/saspay-sync.ts) (rapprochement paiement/commande). Le webhook SasPay ne contient pas notre numéro de commande : on relie par l'identifiant de session enregistré sur la commande, puis on revérifie le statut auprès de l'API. La page de retour fait la même vérification, donc un webhook perdu ne bloque pas le client.

Variables : `SASPAY_SECRET_KEY` (`sk_test_…` puis `sk_live_…`, portée PAYIN) et `SASPAY_WEBHOOK_SECRET`. Webhook à déclarer dans le tableau de bord SasPay : `https://<domaine>/api/webhooks/saspay`, événement `transaction.success`.

## Livrables numériques

Un produit numérique est livré par l'espace client : `Access` + module/leçon dont le fichier est dans le bucket privé `formations` (URL signée à la demande). Les trois livres numériques se téléversent avec :

```bash
DELIVERABLES_DIR="C:/chemin/vers/les/pdf" npx prisma db seed
```

Les packs de formations se livrent par un guide d'accès aux couleurs de Référence Informatique, à déposer de la même façon. Tant qu'aucun contenu n'est déposé, la page du produit affiche un message d'attente avec un lien WhatsApp.
