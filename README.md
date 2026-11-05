# Yalla

Yalla est une application de navigation pour les personnes qui ne savent pas lire. L'interface du voyageur ne contient ni texte ni chiffres : pictogrammes, photos, couleurs, sons et vibrations. Une personne qui sait lire (accompagnant, travailleur social) prépare les lieux dans la même application.

Aucun compte, aucune donnée d'identité, aucun serveur à nous. Les lieux et les trajets restent sur le téléphone. Quelques services publics tiers reçoivent malgré tout des données, listées plus bas. Détail : `docs/product/decisions.md` (D1) et `docs/engineering/securite.md`.

Projet en développement, Expo / React Native, Android d'abord.

## Développer

```bash
npm install
npm run check        # lint, types, format, tests
npx expo start --web # interface dans le navigateur
```

Documentation produit et technique dans `docs/` (personas, principes, décisions, specs, règles de code).

## Services tiers et ce qu'ils reçoivent

Liste tenue à jour dans `src/services/hosts.ts`.

- [Transitous](https://transitous.org), calcul des trajets à partir de données ouvertes de transport ([sources](https://github.com/public-transport/transitous)) : le point de départ, le point d'arrivée, l'heure, le nom de l'app avec une adresse de contact (condition d'usage), l'adresse IP.
- [OpenFreeMap](https://openfreemap.org), carte (données © les contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright)) : l'adresse IP et les zones affichées.
- [Photon](https://photon.komoot.io), recherche d'adresse, partie accompagnant seulement : le texte tapé, la position arrondie à environ 1 km, l'adresse IP.
- Services Google Play (Android) : la position passe par le système, et Android vérifie les liens de partage auprès de leur domaine.
- GitHub Pages : héberge la page des liens de partage. Elle n'est visitée que si l'app n'est pas installée, et ne reçoit jamais le lieu, qui reste après `#`.

## Licence

GPL-3.0-or-later, voir `LICENSE`. Toute version modifiée et distribuée doit publier son code sous la même licence.
