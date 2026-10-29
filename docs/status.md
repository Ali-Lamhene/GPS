# État du projet

Fichier de passation entre sessions. Mis à jour à la fin de chaque tâche, dans le même commit. Lu automatiquement au démarrage de chaque session (hook `SessionStart`).

**Dernière mise à jour** : 2026-10-29

## Où on en est

- Projet Expo SDK 58 initialisé (Expo Router, `src/app/`), repo `Ali-Lamhene/GPS`, travail direct sur `main`, une fonctionnalité = un commit.
- Qualité : CI GitHub Actions (lint, types, format, tests, expo-doctor, bundles, audit), hooks husky, Dependabot.
- Méthode : spec d'abord avec le skill `/feature` (entretien de cadrage, spec dans `docs/specs/`, validation, puis code).
- Outillage Claude : skill `verify-on-device`, sous-agent `ux-sans-texte-reviewer`, règle ESLint « zéro texte », Prettier automatique après chaque édition, hooks de rappel.
- Docs produit : `docs/product/personas.md`, `docs/product/principes.md`, `docs/product/decisions.md`.
- Décisions structurantes (détail dans `decisions.md`) :
  - D1 sécurité : aucun compte, aucune donnée d'identité, aucun serveur à nous (public surveillé par certains États d'origine).
  - D3 le **lieu** est l'objet central : le voyageur a une collection de lieux (photo, pictogramme, couleur) et compose ses trajets en choisissant départ et arrivée. Lieux créés sur son téléphone par une personne qui sait lire, ou envoyés à distance par lien.
  - D4 calcul d'un trajet nouveau en ligne depuis le téléphone du voyageur ; trajets calculés gardés uniquement sur son téléphone, utilisables hors connexion ; suivi GPS en local.
  - D2 à pied, transports en commun, voiture (à pied livré en premier). D6 carte toujours affichée en plus des signaux sans texte. D7 gratuit et libre, sauf compte Apple. D8 partie préparation dans la même app, appui long caché.
- Spec 001 « Lieux : créer, partager, recevoir » **validée** (`docs/specs/001-lieux.md`). Pas encore de code.
- Découpage prévu : 001 lieux, 002 composer un trajet et le garder hors connexion, 003 guidage pendant la marche.

- Conception des écrans préparée dans `docs/design/` : `ecrans.md` (inventaire V1-V7, P1-P5, W1, S1, états), `references.md` (pictogrammes ARASAAC revus, études sourcées, tableau des choix remis en cause), `brief.md` (direction « signalétique », liste noire anti-rendu générique, prompt par écran).

## Prochaine étape

L'utilisateur fait les maquettes avec Claude Design à partir de `docs/design/brief.md`. Ensuite : revue de chaque maquette (agent `ux-sans-texte-reviewer` + liste noire), puis specs 002 et 003 nourries par les maquettes, puis code de la spec 001.

À trancher avec les maquettes (voir `references.md` section 4) : barre de trajet horizontale avec flèche ou verticale ; défilement de la grille (rangée coupée) ou pagination ; aide proactive pendant le guidage ; chiffres pour les numéros de bus.

## Questions produit ouvertes

1. Zone : France seulement ? Une ville pilote ? (Conditionne les données de transports en commun et la taille des cartes hors connexion.)
2. Cartes hors connexion : quelle source de tuiles gratuite autorise le téléchargement ? (Les serveurs de tuiles OSM l'interdisent.) Piste : fichiers Protomaps / PMTiles d'une zone, hébergés en statique.
3. Recalcul quand le voyageur se perd : en ligne via un service public (envoie la position), ou seulement le ramener vers le tracé prévu, sans réseau ?
4. Voix : audios préenregistrés dans les langues des voyageurs, ou seulement sons et vibrations ?
5. Heure du rendez-vous : rappel « pars maintenant » ? Comment montrer une heure sans chiffres ?
6. Bouton d'aide : appel direct à l'accompagnateur (numéro et photo enregistrés sur le téléphone du voyageur) ? Partage de position ponctuel ?
7. Licence du projet : doit être compatible avec ARASAAC (CC BY-NC-SA, partage à l'identique).
8. Distribution : Play Store et App Store, ou aussi APK installé par les associations ?
9. Tests : travailleurs sociaux / voyageurs prêts à tester des maquettes tôt ?
10. Création d'un lieu par le voyageur lui-même (« je suis ici » + photo) : spec ultérieure.

## En attente côté humain

- Pousser les commits : le shell de Claude n'a pas d'identifiants GitHub. Installer `gh` puis `gh auth login`, ou ajouter la clé SSH à GitHub.
- Brancher un téléphone Android (débogage USB) pour les vérifications sur appareil. Pas d'émulateur ni de SDK Android installé sur la machine.
- Choisir une licence pour le projet (le fichier `LICENSE` du template Expo a été supprimé), compatible ARASAAC.
- Créer le dépôt GitHub Pages `ali-lamhene.github.io` (page du lien de partage, fichiers App Links / Universal Links).
- Compte Apple développeur, quand on attaquera l'iPhone.
