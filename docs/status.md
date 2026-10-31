# État du projet

Fichier de passation entre sessions. Mis à jour à la fin de chaque tâche, dans le même commit. Lu automatiquement au démarrage de chaque session (hook `SessionStart`).

**Dernière mise à jour** : 2026-10-31

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

- Première maquette Claude Design (V1) jugée « jouet » par l'utilisateur. Nouvelle direction « signalétique » sobre et adulte, portée par un design system Claude Design « GPS sans texte » (https://claude.ai/artifact/T8sKnYwYLZy4rM5vR8ZdXF) : tokens, règles, vraies photos Wikimedia Commons, pictogrammes ARASAAC noir et blanc, composants CarteLieu, BarreTrajet, Confirmation, BoutonAide, EcranAccueil. `brief.md` réécrit écran par écran (mesures, états, wireframes) ; `guide-claude-design.md` explique l'outil.

- Règles d'ingénierie écrites (2026-10-31) : `docs/engineering/code.md` (dossiers `src/app|features|domain|services|ui`, composants, TypeScript, erreurs, tests, glossaire) et `docs/engineering/securite.md` (menaces, réseau, lien de partage, stockage, logs, permissions, dépendances). ESLint interdit `console.*`, `any`, `!`, `eval` et les SDK de suivi (`eslint/forbidden-packages.js`, aussi vérifié sur `package.json` par un test). Agent `security-reviewer`. `android.allowBackup` à `false`.

## Prochaine étape

Implémentation de la maquette v7 (D11) en interface statique fidèle, données factices, sans GPS (option A). Un commit par sous-tâche, sur `main`, chacun avec ses tests :

1. [x] Décisions D9 (exceptions de texte), D10 (pas de bouton d'appel), D11 (maquette v7 de référence), plan.
2. [ ] Thème (tokens v7), polices Roboto Flex et Material Symbols Rounded, composant `Icon`.
3. [ ] Domaine : lieux, trajets, étapes, cadrans de durée, progression, message d'aide ; données factices.
4. [ ] Composants partagés : boutons, cadrans, badge de ligne, anneau pulsé, tuile de lieu, poignée.
5. [ ] État du trajet en préparation + accueil E01-E05 (chemin, feuille des lieux, appui long accompagnant).
6. [ ] E06 choix du transport.
7. [ ] E07-E08 récapitulatif et détail des étapes (photos des arrêts).
8. [ ] E09-E20, E22, E23, E17 guidage (consigne, carte ou photo, progression).
9. [ ] E21 métro hors connexion, E25 problème de connexion, E26 arrivée.
10. [ ] E24 carte d'aide contextuelle.
11. [ ] E27-E29 nouveau lieu (voyageur) et E30 adresse (accompagnant).
12. [ ] Sons, vibrations, lecture des noms (`expo-audio`, `expo-speech`).
13. [ ] Planche de développement des écrans, test fonctionnel dans le navigateur.

Ensuite : specs 002 et 003 avant de brancher GPS et itinéraires réels, puis code de la spec 001.

## Questions produit ouvertes

1. Zone : France seulement ? Une ville pilote ? (Conditionne les données de transports en commun et la taille des cartes hors connexion.)
2. Cartes hors connexion : quelle source de tuiles gratuite autorise le téléchargement ? (Les serveurs de tuiles OSM l'interdisent.) Piste : fichiers Protomaps / PMTiles d'une zone, hébergés en statique.
3. Recalcul quand le voyageur se perd : en ligne via un service public (envoie la position), ou seulement le ramener vers le tracé prévu, sans réseau ?
4. Voix : audios préenregistrés dans les langues des voyageurs, ou seulement sons et vibrations ?
5. Heure du rendez-vous : rappel « pars maintenant » ? Comment montrer une heure sans chiffres ?
6. Licence du projet : la maquette v7 utilise Material Symbols (Apache 2.0) ; si des pictogrammes ARASAAC reviennent, licence compatible CC BY-NC-SA.
7. Distribution : Play Store et App Store, ou aussi APK installé par les associations ?
8. Tests : travailleurs sociaux / voyageurs prêts à tester des maquettes tôt ?
9. Création d'un lieu par le voyageur lui-même (« je suis ici » + photo) : spec ultérieure.
10. Sécurité (détail dans `docs/engineering/securite.md`) : chiffrer lieux et trajets au repos ? moyen rapide d'effacer ou cacher les lieux si le téléphone est fouillé ? bloquer les captures d'écran de la partie préparation ?
11. Tuile « Accompagnant · appui 3 s » de la feuille des lieux (E02, E04) : texte visible par le voyageur, hors exceptions D9. Codée comme composant de la partie accompagnant (`src/features/social-worker/`), fidèle à la maquette ; à confirmer.

## En attente côté humain

- Pousser les commits : le shell de Claude n'a pas d'identifiants GitHub. Installer `gh` puis `gh auth login`, ou ajouter la clé SSH à GitHub.
- Brancher un téléphone Android (débogage USB) pour les vérifications sur appareil. Pas d'émulateur ni de SDK Android installé sur la machine.
- Choisir une licence pour le projet (le fichier `LICENSE` du template Expo a été supprimé), compatible ARASAAC.
- Créer le dépôt GitHub Pages `ali-lamhene.github.io` (page du lien de partage, fichiers App Links / Universal Links).
- Compte Apple développeur, quand on attaquera l'iPhone.
