# État du projet

Fichier de passation entre sessions. Mis à jour à la fin de chaque tâche, dans le même commit. Lu automatiquement au démarrage de chaque session (hook `SessionStart`).

**Dernière mise à jour** : 2026-10-29

## Où on en est

- Projet Expo SDK 58 initialisé (Expo Router, `src/app/`), repo `Ali-Lamhene/GPS`, travail direct sur `main`, une fonctionnalité = un commit.
- Qualité : CI GitHub Actions (lint, types, format, tests, expo-doctor, bundles, audit), hooks husky, Dependabot.
- Méthode : spec d'abord avec le skill `/feature` (entretien de cadrage, spec dans `docs/specs/`, validation, puis code).
- Outillage Claude : skill `verify-on-device`, sous-agent `ux-sans-texte-reviewer`, règle ESLint « zéro texte », Prettier automatique après chaque édition, hooks de rappel.
- Docs produit : `docs/product/personas.md`, `docs/product/principes.md`.
- Aucune fonctionnalité produit encore. L'écran d'accueil est celui du template vide.

## Prochaine étape

Cadrer la première fonctionnalité avec `/feature`. Avant, trancher les questions structurantes ci-dessous : elles conditionnent l'architecture.

## Questions produit ouvertes

1. Mode de déplacement : à pied seulement, ou aussi bus / tram / métro ?
2. Qui saisit la destination ? Hypothèse : le travailleur social prépare le trajet (adresse, photo du lieu, heure) et l'envoie par QR code, lien ou SMS. Une app avec deux modes, ou deux apps ?
3. Zone : France seulement ? Une ville pilote ?
4. Hors-ligne : le voyageur a-t-il des données mobiles ? Sinon, préchargement du trajet et de la carte.
5. Carte ou pas de carte ? Proposition : pas de carte par défaut ; flèche-boussole, photo du prochain repère et de l'arrivée, jauge de progression, vert / rouge, vibrations et sons.
6. Voix : audios préenregistrés dans les langues des voyageurs, ou seulement sons et vibrations ?
7. Heure du rendez-vous : rappel « pars maintenant » ? Comment montrer une heure sans chiffres ?
8. Bouton d'aide : appel direct au travailleur social (avec sa photo) ? Partage de position ponctuel ?
9. Pictogrammes : banque ARASAAC (licence CC BY-NC-SA, non commerciale) acceptable ?
10. API de carte et d'itinéraire : gratuit et libre (OpenStreetMap, MapLibre, OSRM / GraphHopper) ou Google payant ?
11. Distribution : Play Store ou APK installé par les associations ? iOS nécessaire ?
12. Tests : téléphone Android disponible ? Travailleurs sociaux / voyageurs prêts à tester des maquettes tôt ?

## En attente côté humain

- Pousser les commits : le shell de Claude n'a pas d'identifiants GitHub. Installer `gh` puis `gh auth login`, ou ajouter la clé SSH à GitHub.
- Brancher un téléphone Android (débogage USB) pour les vérifications sur appareil. Pas d'émulateur ni de SDK Android installé sur la machine.
- Choisir une licence pour le projet (le fichier `LICENSE` du template Expo a été supprimé).
