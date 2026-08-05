# Wishlist Steam Compare

Application web légère permettant de comparer une wishlist Steam publique avec les offres disponibles chez des revendeurs tiers.

Le MVP cible d’abord Steam et Instant Gaming, sans authentification ni stockage de données personnelles côté serveur.

## Principes du MVP

- une seule page ;
- wishlist Steam obligatoirement publique ;
- dernière URL mémorisée dans le navigateur ;
- aucune authentification ;
- comparaison Steam / Instant Gaming ;
- distinction entre jeu, édition supérieure, DLC, extension et upgrade ;
- sélection de l’offre d’achat la plus intéressante ;
- architecture extensible à d’autres revendeurs.

## Stack

- Next.js avec App Router ;
- TypeScript strict ;
- Tailwind CSS ;
- ESLint ;
- GitHub Actions.

Node.js 20.9 ou supérieur est requis.

## Développement local

```bash
npm install
npm run dev
```

L’application est ensuite disponible sur `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```

## État du projet

La fondation technique et une page d’accueil non interactive sont en place. La saisie et la validation d’une wishlist seront ajoutées au prochain sprint.
