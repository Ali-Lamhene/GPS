# État du projet

Fichier de passation entre sessions. Mis à jour à la fin de chaque tâche, dans le même commit. Lu automatiquement au démarrage de chaque session (hook `SessionStart`).

**Dernière mise à jour** : 2026-10-29

## Où on en est

- Projet Expo SDK 58 initialisé (Expo Router, `src/app/`), repo `Ali-Lamhene/GPS`, travail direct sur `main`, une fonctionnalité = un commit.
- Qualité : CI GitHub Actions (lint, types, format, tests, expo-doctor, bundles, audit), hooks husky, Dependabot.
- Méthode : spec d'abord avec le skill `/feature` (entretien de cadrage, spec dans `docs/specs/`, validation, puis code).
- Outillage Claude : skill `verify-on-device`, sous-agent `ux-sans-texte-reviewer`, règle ESLint « zéro texte », Prettier automatique après chaque édition, hooks de rappel.
- Docs produit : `docs/product/personas.md`, `docs/product/principes.md`, `docs/product/decisions.md`.
- Décisions structurantes prises (détail dans `decisions.md`) : aucune donnée d'identité ni compte ni serveur à nous (sécurité, public surveillé) ; à pied, transports en commun et voiture ; trajets préparés par un tiers et transmis dans un lien ou QR code qui contient tout le trajet ; itinéraire calculé à la préparation, suivi GPS en local chez le voyageur ; trajets stockés sur le téléphone, utilisables hors connexion ; carte toujours affichée en plus des signaux sans texte ; services gratuits et libres uniquement.
- Aucune fonctionnalité produit encore. L'écran d'accueil est celui du template vide.

## Prochaine étape

Trancher la question 1 ci-dessous (une app ou deux), puis cadrer la première fonctionnalité avec `/feature`. Candidate : recevoir un trajet par lien et le suivre à pied.

## Questions produit ouvertes

1. Interface de préparation des trajets : un mode dans la même app, ou une app / page web séparée ? Une page web statique (sans serveur de données) permettrait de préparer un trajet depuis un ordinateur.
2. Zone : France seulement ? Une ville pilote ? (Conditionne les données de transports en commun et la taille des cartes hors connexion.)
3. Cartes hors connexion : quelle source de tuiles gratuite autorise le téléchargement ? (Les serveurs de tuiles OSM l'interdisent.) Piste : fichiers Protomaps / PMTiles d'une zone, hébergés en statique.
4. Recalcul quand le voyageur se perd : en ligne via un service public (envoie la position), ou seulement le ramener vers le tracé prévu, sans réseau ?
5. Voix : audios préenregistrés dans les langues des voyageurs, ou seulement sons et vibrations ?
6. Heure du rendez-vous : rappel « pars maintenant » ? Comment montrer une heure sans chiffres ?
7. Bouton d'aide : appel direct à la personne qui a préparé le trajet (numéro et photo transmis dans le lien) ? Partage de position ponctuel ?
8. Pictogrammes : banque ARASAAC (CC BY-NC-SA) acceptable ? Le projet est non commercial, mais la clause « partage à l'identique » pèse sur le choix de licence.
9. Distribution : Play Store ou APK installé par les associations ? iOS nécessaire ?
10. Tests : travailleurs sociaux / voyageurs prêts à tester des maquettes tôt ?

## En attente côté humain

- Pousser les commits : le shell de Claude n'a pas d'identifiants GitHub. Installer `gh` puis `gh auth login`, ou ajouter la clé SSH à GitHub.
- Brancher un téléphone Android (débogage USB) pour les vérifications sur appareil. Pas d'émulateur ni de SDK Android installé sur la machine.
- Choisir une licence pour le projet (le fichier `LICENSE` du template Expo a été supprimé).
