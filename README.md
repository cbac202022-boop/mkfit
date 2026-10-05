# MKFit — E-commerce sport & fitness

**Une boutique en ligne dédiée aux vêtements, chaussures, accessoires, équipements de musculation et produits de nutrition sportive.**

MKFit réunit un catalogue filtrable, un parcours d’achat complet, un espace client et une interface d’administration. Le projet s’appuie sur Next.js et TypeScript, avec Prisma pour la gestion des données et Stripe Checkout pour le paiement en environnement de test.

> Le projet inclut des données de démonstration et un mode de commande sans paiement réel. Consultez la section [Mise en production](#mise-en-production) avant tout déploiement commercial.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Données de démonstration](#données-de-démonstration)
- [Paiement](#paiement)
- [Commandes disponibles](#commandes-disponibles)
- [Organisation du projet](#organisation-du-projet)
- [Choix techniques](#choix-techniques)
- [Passage à PostgreSQL](#passage-à-postgresql)
- [Mise en production](#mise-en-production)
- [Dépannage](#dépannage)

## Fonctionnalités

### Boutique et catalogue

- Page d’accueil avec catégories principales, produits en vedette, nouveautés, bandeau promotionnel et section newsletter.
- Catalogue avec filtres par catégorie, prix, taille, couleur et marque.
- Tri par popularité, nouveautés ou prix, avec pagination.
- Filtres conservés dans l’URL pour partager une sélection de produits.
- Fiches produit avec galerie, variantes taille/couleur, disponibilité par variante, avis clients et produits similaires.
- Recherche avec suggestions en direct, navigation au clavier et page de résultats dédiée.

### Panier et commande

- Panier persistant dans le navigateur, avec actualisation des prix et des stocks à l’ouverture.
- Application de codes promotionnels et indicateur du montant restant pour bénéficier de la livraison offerte.
- Parcours de commande avec coordonnées, adresse de livraison ou sélection d’une adresse enregistrée.
- Trois modes de livraison et intégration de Stripe Checkout.
- Page de confirmation et suivi des commandes dans l’espace client.

### Espace client

Accessible sur `/compte` : inscription, connexion, historique et détail des commandes, carnet d’adresses et gestion des favoris.

### Administration

Accessible sur `/admin` aux utilisateurs disposant du rôle `ADMIN` :

- Tableau de bord de gestion.
- Création, modification et suppression des produits et catégories.
- Gestion des images et des variantes, avec génération de combinaisons taille × couleur.
- Modification des stocks depuis l’interface.
- Filtrage des commandes et mise à jour de leur statut.
- Remise en stock des articles lors de l’annulation d’une commande payée.

### Pages, référencement et accessibilité

Le site comprend les pages À propos, Contact, FAQ, CGV, Livraison & retours et une page 404. Les messages du formulaire de contact sont enregistrés en base de données.

Le référencement repose sur des métadonnées par page, des URL lisibles en français, un sitemap dynamique, un fichier `robots.txt`, des balises canoniques et des données structurées `Product` et `FAQ`.

Les dispositions d’accessibilité comprennent un lien d’évitement, des indicateurs de focus visibles, des libellés et erreurs associés aux champs, des textes alternatifs, l’attribut `aria-current` et une recherche utilisant le modèle ARIA combobox. Les contrastes visent le niveau AA ; le vert néon n’est pas utilisé comme texte sur fond blanc. Les animations sont désactivées lorsque `prefers-reduced-motion` est actif.

## Stack technique

| Domaine | Technologies |
| --- | --- |
| Application | Next.js 15, App Router, TypeScript |
| Interface | Tailwind CSS |
| Données | Prisma, SQLite par défaut, adaptation possible à PostgreSQL |
| Authentification | NextAuth, connexion par email et mot de passe |
| Paiement | Stripe Checkout, mode test |
| État du panier | Zustand |
| Validation | Zod |
| Polices | Fontsource, hébergement local |

## Installation

### Prérequis

- Node.js 20 ou supérieur.
- npm.
- Un compte Stripe et Stripe CLI pour tester les webhooks, si vous activez le paiement Stripe.

Exécutez les commandes suivantes depuis la racine du projet.

### 1. Installer les dépendances

```bash
npm install
```

L’installation génère également le client Prisma selon la configuration du projet.

### 2. Configurer l’environnement

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Renseignez ensuite les variables décrites dans la section [Configuration](#configuration).

### 3. Initialiser la base de données

```bash
npx prisma migrate dev
```

Lors de l’initialisation, la configuration décrite pour ce projet prévoit également l’exécution du seed. Si les données de démonstration ne sont pas présentes, lancez `npm run db:seed` sur cette base de développement uniquement.

### 4. Démarrer l’application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Configuration

Les variables d’environnement sont définies dans `.env`.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL de connexion à la base. Pour SQLite : `file:./dev.db`. |
| `NEXTAUTH_URL` | URL publique de l’application, par exemple `http://localhost:3000`. |
| `NEXTAUTH_SECRET` | Secret utilisé pour la gestion des sessions. |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe de test, préfixée par `sk_test_`. Laisser vide pour le mode démo. |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook Stripe, préfixé par `whsec_`. |
| `NEXT_PUBLIC_SITE_URL` | URL publique utilisée pour le sitemap, les métadonnées et les redirections Stripe. |
| `SEED_ADMIN_EMAIL` | Adresse email du compte administrateur créé par le seed, facultative. |
| `SEED_ADMIN_PASSWORD` | Mot de passe du compte administrateur créé par le seed, facultatif. |

Pour générer un secret avec OpenSSL :

```bash
openssl rand -base64 32
```

Ne versionnez pas le fichier `.env` ni les clés secrètes.

## Données de démonstration

Le seed fournit **37 produits**, **5 catégories**, des comptes utilisateurs, des avis et des codes promotionnels.

### Comptes

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | `admin@mkfit.fr` | `Admin123!` |
| Client | `client@mkfit.fr` | `Client123!` |

Ces identifiants sont réservés à la démonstration. Le compte administrateur permet d’accéder à `/admin`.

### Codes promotionnels

| Code | Avantage | Condition |
| --- | --- | --- |
| `BIENVENUE10` | Réduction de 10 % | Aucun minimum indiqué |
| `MKFIT20` | Réduction de 20 % | À partir de 100 € d’achat |
| `LIVRAISON5` | Réduction de 5 € | À partir de 30 € d’achat |

## Paiement

### Mode démonstration

En l’absence de `STRIPE_SECRET_KEY`, la validation du panier crée une commande et la marque directement comme payée, **sans transaction financière**.

Ce mode permet de tester le parcours d’achat. Il doit être désactivé ou bloqué avant une ouverture commerciale.

### Stripe en mode test

1. Récupérez la clé secrète de test dans votre tableau de bord Stripe et renseignez `STRIPE_SECRET_KEY`.
2. Installez Stripe CLI, puis redirigez les événements vers l’application locale :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Copiez le secret `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`, puis redémarrez le serveur si nécessaire.
4. Effectuez une commande avec les informations de test suivantes :

| Champ | Valeur |
| --- | --- |
| Numéro de carte | `4242 4242 4242 4242` |
| Date d’expiration | Une date future |
| CVC | Trois chiffres au choix |

Le statut de paiement est actualisé par le webhook. La page de confirmation vérifie également le paiement auprès de Stripe, ce qui permet de finaliser le parcours local lorsque le webhook n’est pas lancé et que le client revient sur cette page.

Le passage au statut « payée » est idempotent : une même commande ne doit décrémenter le stock qu’une seule fois. En production, configurez le webhook pour traiter le paiement indépendamment du retour du client sur le site.

## Commandes disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Démarrer le serveur de développement avec Turbopack. |
| `npm run build` | Générer le build de production. |
| `npm start` | Démarrer l’application à partir du build de production. |
| `npm run lint` | Exécuter ESLint. |
| `npm run typecheck` | Vérifier les types TypeScript. |
| `npm run db:migrate` | Exécuter le script de migration Prisma du projet. |
| `npm run db:seed` | Vider puis alimenter la base avec les données de démonstration. |
| `npm run db:reset` | Réinitialiser complètement la base et relancer le seed. |
| `npm run db:studio` | Ouvrir Prisma Studio pour explorer les données. |

> **Opérations destructives :** `db:seed` et `db:reset` suppriment des données. Réservez-les aux environnements de développement et de démonstration.

## Organisation du projet

| Emplacement | Responsabilité |
| --- | --- |
| `prisma/schema.prisma` | Modèle de données. |
| `prisma/seed.ts` | Données de démonstration. |
| `src/middleware.ts` | Protection des routes `/compte` et `/admin`. |
| `src/actions/` | Server Actions : compte, panier, favoris, avis, formulaires et administration. |
| `src/app/(shop)/` | Pages publiques et espace client, avec en-tête et pied de page. |
| `src/app/admin/` | Interface d’administration et layout dédié. |
| `src/app/api/` | Routes d’authentification, recherche, checkout et webhook Stripe. |
| `src/app/sitemap.ts` | Génération du sitemap. |
| `src/app/robots.ts` | Configuration des directives d’indexation. |
| `src/components/` | Composants d’interface et composants organisés par domaine fonctionnel. |
| `src/lib/` | Configuration, accès aux données et logique métier partagée. |

### Modules principaux

| Module dans `src/lib/` | Rôle |
| --- | --- |
| `auth.ts` | Configuration NextAuth et contrôles `requireUser` / `requireAdmin`. |
| `catalog.ts` | Requêtes Prisma du catalogue. |
| `catalog-params.ts` | Lecture et écriture des filtres dans l’URL. |
| `orders.ts` | Création des commandes et validation idempotente du paiement. |
| `pricing.ts` | Calculs de livraison et codes promotionnels partagés entre client et serveur. |
| `cart-store.ts` | État du panier avec Zustand. |
| `validations.ts` | Schémas de validation Zod. |

Les composants sont répartis dans les dossiers `ui`, `layout`, `product`, `catalog`, `cart`, `checkout`, `account`, `order`, `admin` et `home`.

## Choix techniques

- **Montants en centimes.** Les prix sont stockés et manipulés sous forme d’entiers pour limiter les erreurs d’arrondi.
- **Calculs vérifiés côté serveur.** Au checkout, le serveur recalcule les prix, les remises et les frais de livraison, puis vérifie les stocks. Les données du panier client ne font pas autorité.
- **Traitement idempotent du paiement.** La confirmation d’un paiement peut être reçue plusieurs fois sans provoquer plusieurs décrémentations du stock pour une même commande.
- **Portabilité des données.** Les statuts et rôles sont représentés par des champs `String` plutôt que par des enums Prisma afin de faciliter l’adaptation entre SQLite et PostgreSQL.
- **Polices auto-hébergées.** Fontsource évite les appels à Google Fonts pendant le build et la navigation.
- **Images distantes.** Les images de démonstration proviennent notamment d’Unsplash et de placehold.co. Les domaines autorisés dans `next.config.ts` bénéficient de l’optimisation `next/image` ; les autres images sont affichées sans cette optimisation.

## Passage à PostgreSQL

Cette procédure concerne la création d’une nouvelle base PostgreSQL. Elle ne transfère pas les données d’une base SQLite existante.

1. Sauvegardez les données existantes et conservez l’historique des migrations SQLite dans le contrôle de version.
2. Dans `prisma/schema.prisma`, remplacez le fournisseur `sqlite` par `postgresql`.
3. Mettez à jour `DATABASE_URL` :

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/mkfit"
```

4. Dans une branche dédiée et contre une base de développement vide, remplacez l’historique de migrations SQLite par un historique adapté à PostgreSQL, puis créez la migration initiale :

```bash
npx prisma migrate dev --name init
```

5. Vérifiez le schéma généré et les principaux parcours de l’application avant le déploiement.

Si des données doivent être conservées, prévoyez une opération distincte d’export, de transformation et d’import.

## Mise en production

### Configuration et accès

- [ ] Définir les URL de production et un `NEXTAUTH_SECRET` robuste.
- [ ] Configurer la base de données cible et prévoir ses sauvegardes.
- [ ] Remplacer les identifiants de démonstration et sécuriser le compte administrateur.
- [ ] Vérifier que le mode démo ne peut pas valider des commandes commerciales.

### Paiement et services

- [ ] Configurer les clés Stripe de production.
- [ ] Créer le webhook de production et renseigner son secret de signature.
- [ ] Configurer les événements utilisés par le projet : `checkout.session.completed`, `checkout.session.async_payment_succeeded` et `checkout.session.expired`.
- [ ] Vérifier le parcours de paiement et l’actualisation des commandes et des stocks.
- [ ] Connecter un service d’emails pour les confirmations de commande et les notifications du formulaire de contact.

### Contenus et validation

- [ ] Adapter les CGV et les faire valider avant utilisation commerciale.
- [ ] Remplacer les images de démonstration et le logo texte.
- [ ] Vérifier les informations de livraison, de retour et de contact.
- [ ] Exécuter les contrôles du projet et générer le build :

```bash
npm run lint
npm run typecheck
npm run build
```

Après configuration et génération du build, l’application peut être démarrée avec `npm start` sur un hébergement adapté.

## Dépannage

### Erreur de certificat HTTPS

L’erreur `unable to verify the first certificate` peut apparaître lorsqu’un proxy ou un antivirus inspecte les connexions HTTPS à l’aide d’un certificat racine non reconnu par Node.js.

Vérifiez que le certificat de confiance est correctement installé. Si votre version de Node.js prend en charge l’option `--use-system-ca`, vous pouvez utiliser les certificats du système :

```bash
NODE_OPTIONS=--use-system-ca npm run dev
```

Sous PowerShell :

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm run dev
```

### Erreurs `EPERM` ou `UNKNOWN` dans `.next` sous Windows

Un processus, un antivirus ou un outil de synchronisation peut verrouiller les fichiers de build.

1. Arrêtez le serveur de développement.
2. Fermez les processus qui utilisent les fichiers du projet.
3. Supprimez uniquement le dossier généré `.next`.
4. Relancez `npm run dev`.

Si le problème persiste, identifiez le programme qui verrouille les fichiers et vérifiez sa configuration.
