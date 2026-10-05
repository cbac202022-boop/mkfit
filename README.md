# MKFit — Boutique e-commerce de sport

Site e-commerce complet pour **MKFit** : vêtements, chaussures, accessoires, matériel de musculation et nutrition.

**Stack** : Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma (SQLite, compatible PostgreSQL) · NextAuth (email / mot de passe) · Stripe Checkout (mode test) · Zustand · Zod

---

## Démarrage rapide

Prérequis : **Node.js 20 ou plus** et npm.

```bash
npm install                 # installe les dépendances et génère le client Prisma
cp .env.example .env        # puis éditez .env (voir ci-dessous)
npx prisma migrate dev      # crée la base SQLite et lance automatiquement le seed
npm run dev                 # http://localhost:3000
```

> Sous Windows (PowerShell), remplacez `cp` par `Copy-Item .env.example .env`.

### Comptes de démonstration (créés par le seed)

| Rôle    | Email             | Mot de passe |
| ------- | ----------------- | ------------ |
| Admin   | `admin@mkfit.fr`  | `Admin123!`  |
| Client  | `client@mkfit.fr` | `Client123!` |

L'espace d'administration est accessible sur `/admin` avec le compte admin.

### Codes promo de démonstration

| Code          | Effet                               |
| ------------- | ----------------------------------- |
| `BIENVENUE10` | -10 %                               |
| `MKFIT20`     | -20 % dès 100 € d'achat             |
| `LIVRAISON5`  | -5 € dès 30 € d'achat               |

---

## Variables d'environnement

| Variable                 | Rôle                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL`           | Connexion à la base. `file:./dev.db` pour SQLite.                                          |
| `NEXTAUTH_URL`           | URL publique du site (ex. `http://localhost:3000`).                                        |
| `NEXTAUTH_SECRET`        | Secret de signature des sessions. Générez-le avec `openssl rand -base64 32`.               |
| `STRIPE_SECRET_KEY`      | Clé secrète Stripe **de test** (`sk_test_…`). Vide = mode démo, voir plus bas.             |
| `STRIPE_WEBHOOK_SECRET`  | Secret du webhook Stripe (`whsec_…`).                                                      |
| `NEXT_PUBLIC_SITE_URL`   | URL publique, utilisée pour le sitemap, les métadonnées et les redirections Stripe.        |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Identifiants du compte admin créé par le seed (facultatif).              |

### Paiement : mode démo ou Stripe

- **Sans `STRIPE_SECRET_KEY`** : le site fonctionne en **mode démo**. Le bouton « Valider la commande » crée la commande et la marque payée directement, sans paiement réel. Pratique pour tester le parcours complet.
- **Avec Stripe (mode test)** :
  1. Récupérez votre clé `sk_test_…` sur <https://dashboard.stripe.com/test/apikeys> et placez-la dans `STRIPE_SECRET_KEY`.
  2. Installez la [CLI Stripe](https://stripe.com/docs/stripe-cli), puis lancez :
     ```bash
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
     et copiez le secret `whsec_…` affiché dans `STRIPE_WEBHOOK_SECRET`.
  3. Payez avec la carte de test `4242 4242 4242 4242` (date future, CVC quelconque).

  La commande passe en « payée » via le webhook, et aussi via la page de confirmation, qui interroge Stripe directement. Le parcours fonctionne donc même si le webhook n'est pas lancé. Le stock n'est décrémenté qu'une seule fois.

---

## Scripts

| Commande              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | Serveur de développement (Turbopack)                          |
| `npm run build`       | Build de production                                           |
| `npm start`           | Démarre le build de production                                |
| `npm run lint`        | ESLint                                                        |
| `npm run typecheck`   | Vérification TypeScript                                       |
| `npm run db:migrate`  | Applique les migrations Prisma                                |
| `npm run db:seed`     | Relance le seed (vide puis remplit la base)                   |
| `npm run db:reset`    | Réinitialise complètement la base puis relance le seed        |
| `npm run db:studio`   | Interface Prisma Studio pour explorer les données             |

---

## Fonctionnalités

**Boutique**
- Accueil : hero, catégories phares, produits en vedette, bandeau promo, nouveautés, newsletter
- Catalogue `/boutique` et `/boutique/[categorie]` : filtres (catégorie, prix, taille, couleur, marque), tri (popularité, nouveautés, prix), pagination. Les filtres sont dans l'URL, donc partageables.
- Fiche produit `/produit/[slug]` : galerie, choix taille/couleur avec stock par variante, avis clients (note et commentaire), produits similaires, données structurées schema.org
- Recherche avec suggestions en direct (navigable au clavier) et page `/recherche`
- Panier persistant (localStorage), resynchronisé avec la base (prix, stock) à l'ouverture, code promo, barre de progression vers la livraison offerte
- Checkout : contact, adresse (ou adresse enregistrée), 3 modes de livraison, paiement Stripe, page de confirmation

**Compte client** (`/compte`) : inscription, connexion, historique et détail des commandes, carnet d'adresses, favoris

**Administration** (`/admin`, rôle ADMIN) : tableau de bord, CRUD produits (images, variantes, générateur de combinaisons taille × couleur), gestion des stocks en ligne, CRUD catégories, commandes avec filtre et changement de statut. L'annulation d'une commande payée remet les articles en stock.

**Pages** : À propos, Contact (formulaire enregistré en base), FAQ, CGV, Livraison & retours, 404

**SEO** : métadonnées par page, URLs lisibles en français, `sitemap.xml` dynamique, `robots.txt`, données structurées Product et FAQ, balises canoniques

**Accessibilité** : lien d'évitement, focus visible, labels et messages d'erreur reliés aux champs, attributs `alt`, `aria-current`, combobox ARIA pour la recherche, contrastes AA. Le vert néon n'est jamais utilisé comme couleur de texte sur fond blanc. Les animations sont désactivées si `prefers-reduced-motion` est actif.

---

## Structure du projet

```
prisma/
  schema.prisma          Modèle de données
  seed.ts                37 produits, 5 catégories, comptes, avis, codes promo
src/
  middleware.ts          Protège /compte et /admin
  actions/               Server Actions (compte, panier, favoris, avis, formulaires, admin)
  app/
    (shop)/              Pages publiques et espace client (avec header et footer)
    admin/               Back-office (layout dédié)
    api/                 auth, search, checkout, webhooks/stripe
    sitemap.ts, robots.ts
  components/
    ui/                  Boutons, champs, badges, images…
    layout/              Header, footer, recherche, menu mobile
    product/ catalog/ cart/ checkout/ account/ order/ admin/ home/
  lib/
    auth.ts              Configuration NextAuth et helpers requireUser / requireAdmin
    catalog.ts           Requêtes catalogue (Prisma)
    catalog-params.ts    Lecture et écriture des filtres dans l'URL
    orders.ts            Création de commande et passage en « payée » (idempotent)
    pricing.ts           Livraison et codes promo (partagé client / serveur)
    cart-store.ts        Panier (Zustand)
    validations.ts       Schémas Zod
```

### Choix techniques

- **Prix en centimes** (entiers) partout, pour éviter les erreurs d'arrondi.
- **Le serveur recalcule tout** au checkout (prix, stock, remise, livraison) : le contenu du panier côté client n'est jamais considéré comme fiable.
- **Statuts et rôles en `String`** plutôt qu'en enum Prisma, pour rester portable entre SQLite et PostgreSQL.
- **Polices auto-hébergées** (Fontsource) : aucun appel à Google Fonts, ni au build ni chez le visiteur.
- **Les images produit** sont des URL (Unsplash, placehold.co). Les domaines déclarés dans `next.config.ts` sont optimisés par `next/image`, les autres sont affichés tels quels.

---

## Passer à PostgreSQL

1. Dans `prisma/schema.prisma`, remplacez `provider = "sqlite"` par `provider = "postgresql"`.
2. Mettez à jour `DATABASE_URL` (ex. `postgresql://user:password@localhost:5432/mkfit`).
3. Supprimez le dossier `prisma/migrations` (spécifique à SQLite), puis lancez :
   ```bash
   npx prisma migrate dev --name init
   ```

Aucune autre modification de code n'est nécessaire.

---

## Mise en production : checklist

- [ ] Générer un `NEXTAUTH_SECRET` robuste et définir les URL de production
- [ ] Changer le mot de passe du compte admin (ou définir `SEED_ADMIN_PASSWORD` avant le seed)
- [ ] Passer aux clés Stripe live et créer le webhook dans le tableau de bord Stripe (événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`)
- [ ] Brancher un service d'emails (confirmation de commande, formulaire de contact)
- [ ] Faire valider les CGV par un juriste (le texte fourni est un modèle)
- [ ] Remplacer les images de démonstration et le logo texte

---

## Dépannage

**`unable to verify the first certificate` / images ou polices qui ne se chargent pas en local**
Votre réseau (proxy d'entreprise, antivirus) inspecte le HTTPS avec un certificat racine que Node.js ne connaît pas. Avec Node.js 22.15 ou plus, demandez-lui d'utiliser les certificats du système :

```bash
NODE_OPTIONS=--use-system-ca npm run dev
```

(PowerShell : `$env:NODE_OPTIONS="--use-system-ca"; npm run dev`)

**Erreurs `EPERM` / `UNKNOWN` sur des fichiers de `.next` sous Windows**
Un antivirus ou un outil de synchronisation verrouille le dossier de build. Arrêtez le serveur, supprimez `.next`, puis relancez. Exclure le dossier du projet de l'analyse en temps réel règle généralement le problème.
#   m k f i t  
 