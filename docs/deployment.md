# Déploiement

## Hébergeur recommandé pour le MVP

Vercel est retenu pour le premier déploiement : prise en charge native de Next.js, routes serveur incluses et offre gratuite suffisante pour les essais du MVP.

## Configuration

- Framework détecté : Next.js
- Commande de build : `npm run build`
- Version Node.js : 22
- Variable optionnelle : `NEXT_PUBLIC_ENABLE_DEMO_PROVIDER=false`

Aucun secret n'est requis pour Steam ou Instant Gaming dans la version actuelle.

## Contrôles après déploiement

1. Ouvrir la page d'accueil.
2. Charger une wishlist Steam publique.
3. Vérifier le diagnostic Instant Gaming : `/api/health/providers/instant-gaming`.
4. Attendre un statut `ok` et au moins une offre.
5. Tester les recherches `Resident Evil 4` et `Baldur's Gate 3` depuis une wishlist contenant ces jeux.
6. Vérifier les liens, devises, plateformes, éditions et rejets de DLC.

## Interprétation du diagnostic

- `ok` : le site Instant Gaming est joignable et le parser trouve des offres.
- `degraded` : la requête aboutit, mais aucune carte produit compatible n'est extraite.
- `unavailable` : timeout, blocage réseau ou réponse invalide.

Le diagnostic ne doit pas être interrogé fréquemment. Les recherches normales utilisent un cache en mémoire de 30 minutes par instance serveur.
