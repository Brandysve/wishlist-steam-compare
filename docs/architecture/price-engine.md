# Moteur de comparaison des offres

## Objectif

Le moteur ne dépend d'aucun revendeur. Chaque source de prix implémente le contrat `PriceProvider` et renvoie des offres brutes normalisées.

## Flux

1. Un `SteamGame` est envoyé aux fournisseurs actifs.
2. Les offres brutes sont classifiées.
3. Les produits incompatibles sont rejetés : DLC, extensions seules, upgrades, monnaies virtuelles, plateformes non-PC et régions incompatibles.
4. Les jeux de base, éditions supérieures et bundles pertinents restent admissibles.
5. L'offre admissible la moins chère est sélectionnée.
6. Le moteur calcule l'économie par rapport au prix de référence Steam.
7. Une offre est marquée intéressante si son prix est inférieur ou égal à 18 EUR ou si l'économie atteint au moins 50 %.

## Principe produit

Une édition Deluxe, Gold, Ultimate ou Complete peut être proposée à la place du jeu de base lorsqu'elle est moins chère. Le moteur ne privilégie donc pas artificiellement l'édition standard.

## Fournisseurs

- `DemoPriceProvider` sert uniquement au développement et ne doit jamais être activé en production.
- Un futur fournisseur Instant Gaming devra utiliser une source de données autorisée et fiable.
- Les autres revendeurs pourront être ajoutés sans modifier le moteur de sélection.
