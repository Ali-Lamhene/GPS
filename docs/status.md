# État du projet

Fichier de passation entre sessions. Mis à jour à la fin de chaque tâche, dans le même commit. Lu automatiquement au démarrage de chaque session (hook `SessionStart`).

**Dernière mise à jour** : 2026-11-01

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

- Maquette v7 implémentée (2026-10-31), voir « Prochaine étape ».
- Première maquette Claude Design (V1) jugée « jouet » par l'utilisateur. Nouvelle direction « signalétique » sobre et adulte, portée par un design system Claude Design « GPS sans texte » (https://claude.ai/artifact/T8sKnYwYLZy4rM5vR8ZdXF) : tokens, règles, vraies photos Wikimedia Commons, pictogrammes ARASAAC noir et blanc, composants CarteLieu, BarreTrajet, Confirmation, BoutonAide, EcranAccueil. `brief.md` réécrit écran par écran (mesures, états, wireframes) ; `guide-claude-design.md` explique l'outil.

- Règles d'ingénierie écrites (2026-10-31) : `docs/engineering/code.md` (dossiers `src/app|features|domain|services|ui`, composants, TypeScript, erreurs, tests, glossaire) et `docs/engineering/securite.md` (menaces, réseau, lien de partage, stockage, logs, permissions, dépendances). ESLint interdit `console.*`, `any`, `!`, `eval` et les SDK de suivi (`eslint/forbidden-packages.js`, aussi vérifié sur `package.json` par un test). Agent `security-reviewer`. `android.allowBackup` à `false`.

- Dépendances ajoutées pour la maquette v7 (relues par `security-reviewer`) : `@expo-google-fonts/roboto` et `@expo-google-fonts/material-symbols-rounded` (polices embarquées, aucun appel réseau) ; `react-native-svg` (code natif, aucune permission, réseau seulement via `SvgUri` et composants proches, interdits par ESLint) ; `expo-audio` (sons embarqués seulement, micro et lecture en arrière-plan désactivés, `RECORD_AUDIO` et stockage externe bloqués ; import réservé à `src/services/feedback.ts`) ; `expo-speech` (texte envoyé au moteur de synthèse du système, voix locale seulement ; import réservé à `src/services/speech.ts`).

## Prochaine étape

Implémentation de la maquette v7 (D11) en interface statique fidèle, données factices, sans GPS (option A). Un commit par sous-tâche, sur `main`, chacun avec ses tests :

1. [x] Décisions D9 (exceptions de texte), D10 (pas de bouton d'appel), D11 (maquette v7 de référence), plan.
2. [x] Thème (tokens v7), polices Roboto (Roboto Flex n'existe qu'en un seul poids dans `@expo-google-fonts`) et Material Symbols Rounded, composant `Icon`.
3. [x] Domaine : lieux, trajets, étapes, cadrans de durée, progression, message d'aide ; données factices.
4. [x] Composants partagés : boutons, cadrans, badge de ligne, anneau pulsé, tuile de lieu, poignée.
5. [x] État du trajet en préparation + accueil E01-E05 (chemin, feuille des lieux, appui long accompagnant).
6. [x] E06 choix du transport.
7. [x] Sons, vibrations, lecture des noms (`expo-audio`, `expo-speech`), avancé pour que les écrans les branchent directement.
8. [x] E07-E08 récapitulatif et détail des étapes (photos des arrêts).
9. [x] E09-E23 et E17 guidage (consigne, carte ou photo, progression), E21 métro hors connexion compris.
10. [x] E25 problème de connexion, E26 arrivée.
11. [x] E24 carte d'aide contextuelle.
12. [x] E27-E29 nouveau lieu (voyageur) et E30 adresse (accompagnant).
13. [x] Planche de développement des écrans, test fonctionnel dans le navigateur.

Les 30 écrans de la maquette v7 sont codés en interface statique (données factices, guidage simulé : toucher la carte de consigne fait avancer). Test fonctionnel complet dans le navigateur réussi (accueil → transport → récapitulatif → 14 étapes de guidage dont E21 → arrivée ; aide contextuelle ; création d'un lieu). Planche de développement : `/dev/screens` (en développement seulement). Lancer : `npx expo start --web` (sans `CI=1`, qui coupe le rechargement).

Spec 002 « carte d'abord » : témoins validés par l'utilisateur (2026-10-31), puis style généralisé à toute l'app dans le navigateur (2026-11-01). La carte embarquée sert de fond à l'accueil, au choix du transport (E06), au récapitulatif (E07-E08, une étape ouverte cadre la carte dessus), au guidage, à l'arrivée (E26), au problème de connexion (E25), à la position et au pictogramme d'un nouveau lieu (E27-E28) ; la carte d'aide (E24) montre une petite carte de la situation ; le métro hors connexion (E21) dessine la ligne avec ses vraies stations. Interface flottante commune : en-tête (`MapHeader`), panneau blanc (`FloatingSheet`), barre d'action pleine largeur. Test fonctionnel complet dans le navigateur réussi, aucune requête hors de l'app.

Spec 005 « accueil sur la carte, formes plus sobres » (2026-11-01) : l'accueil est une carte vive centrée sur le voyageur, ses lieux en épingles à toucher (sauf ceux marqués « ne pas montrer sur la carte », dont la maison par défaut), une colonne verticale départ → arrivée à gauche ; le départ est la position actuelle par défaut. Partout : arrondis de 4, 8 et 16 dp, barre d'action pleine largeur au lieu du disque à halo, icônes réduites, tuiles de lieux blanches. Les épingles n'existent que dans le navigateur tant que MapLibre natif n'est pas branché.

Prochaine étape : carte sur téléphone (MapLibre natif, `@maplibre/maplibre-react-native`) dès qu'un téléphone Android est branché : build de développement, revue sécurité dédiée, puis spec 002 au statut `livré`. Ensuite specs 003 (composer un trajet) et 004 (guidage).

Aide (D13, 2026-11-01) : bouton d'aide en haut à droite sur tous les écrans, guidage, métro hors connexion et feuille des lieux compris. La petite carte de l'aide ne montre au passant que le reste du tronçon en cours et l'arrêt ou le lieu à trouver ; avant le départ, ni photo du lieu d'arrivée, ni carte si le départ n'est pas la position actuelle ; le message demande l'arrêt à prendre (en transport), puis suit l'étape. Sur les écrans sombres (E21, E29), le disque d'aide garde un contraste adapté au fond (validé). Au guidage, les noms de station passent sous le pictogramme, sur toute la largeur du bandeau ; le bouton écouter rejoint la rangée des cadrans, le panneau garde une hauteur fixe.

Points laissés ouverts par les relectures de la spec 002 :

- Métro sans GPS (spec 004) : décidé le 2026-11-01, position hybride (arrêts comptés à l'accéléromètre, contrôlés par le temps prévu, recalés au GPS), alerte une station avant, prochaine station plutôt qu'un point qui glisse, bouton « je suis descendu » gardé. Recherche et détails : `docs/recherche/metro-sans-gps.md`.
- Lieux sur la carte d'accueil (relecture sécurité, spec 005) : seuls « maison » et « famille » sont cachés par défaut ; un lieu sensible avec un autre pictogramme (« favori » chez un proche, adresse sans pictogramme) reste visible au lancement. Cacher tout par défaut, au moins les lieux reçus par lien ? Le lien de partage (spec 001) ne doit transporter ni `hiddenOnMap` (recalculé chez le voyageur) ni photo.
- Sens de lecture (lecteurs de droite à gauche) : deux séquences restent horizontales, `TripEnds` (départ → arrivée avec une flèche, en-têtes de E06 et E07) et la barre de progression du guidage (`ProgressStrip`). À passer à la verticale ou à rendre neutres.
- UX : jauge d'approche du virage dans le bandeau (aujourd'hui flèche sur la carte) ; cône relié à la boussole et état « mauvais sens » (spec 004) ; barre d'action désactivée qui ne dit pas pourquoi (E28) ; pour les tests avec des voyageurs, un autre déclencheur que le bandeau pour faire avancer la démo.
- Sécurité : la version web restera-t-elle un outil de développement (sinon l'hôte verrait qui charge la carte) ? Modèle de carte hors de la zone embarquée (archive par ville, téléchargement par zone ou tuiles à la demande : chaque tuile demandée révèle la zone du voyageur) ; `postinstall` (copie du worker MapLibre) empêche `ignore-scripts=true` dans `.npmrc` ; MapLibre natif à relire avant installation.

Écarts relevés par `ux-sans-texte-reviewer`, non appliqués car la maquette v7 prévaut (D11), à trancher :

- Signaux : « tout droit », « arrivé à l'arrêt », « à bord » et « marche finale » n'ont ni son ni vibration ; l'attente du véhicule et le hors connexion n'ont pas de vibration ; gauche et droite ont le même son et la même vibration.
- Monter / descendre dessinés avec `login` / `logout` (métaphore informatique) ; « aller à l'arrêt », « attendre » et « à bord » partagent le même grand pictogramme.
- Orange de l'alerte (#E8710A) : contraste d'environ 3,1:1 avec le texte blanc, faible en plein soleil.
- Mise en page de droite à gauche (téléphones en arabe, persan, pachto) : flèches non inversées ; décider de forcer la gauche-à-droite ou d'inverser les glyphes.
- Pas de retour ni d'accueil sur l'écran de guidage ; la feuille des lieux masque l'aide.
- Déjà corrigé sans changer le rendu : zones tactiles à 64 dp, retour Android qui ferme la feuille, badges de ligne insensibles à la taille de police système.

## Questions produit ouvertes

1. Zone : France au lancement (D14). Reste à choisir la ou les villes pilotes (conditionne les données de transports en commun et la taille des cartes hors connexion).
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
12. Photos de démonstration générées par ChatGPT : elles portent sans doute un filigrane invisible OpenAI, qui résiste au réencodage. À remplacer par des photos libres ou faites par l'équipe avant toute diffusion publique ?
13. Lecture à voix haute (relue par `security-reviewer`) : aujourd'hui, l'app ne lit qu'avec une voix française installée sur le téléphone (Android : voix Google « -local » seulement), sinon elle se tait. Reste à trancher :
    - durcir en natif (moteur de synthèse imposé, contrôle `isNetworkConnectionRequired`), supprimer la lecture des noms, ou passer à des audios préenregistrés (question 4) ;
    - le message d'aide lu à voix haute doit-il contenir le nom de la destination ? Les gens autour l'entendent ;
    - les sons de guidage doivent-ils respecter le mode silencieux, pour un voyageur discret ?
    - sans voix locale, quel signal sans texte montre que « écouter » ne marche pas ? La partie préparation doit-elle vérifier la voix et aider à l'installer ?
14. Avant le premier build natif : bloquer `SYSTEM_ALERT_WINDOW` en version publiée, vérifier `NSAllowsArbitraryLoads` (HTTPS seulement) sur iOS après prebuild, contrôler l'APK avec `aapt dump permissions`.

## En attente côté humain

- Les 11 PNG d'origine de `assets/images/` (non suivis) contiennent un manifeste C2PA signé OpenAI avec des identifiants uniques de génération. Ne pas les commiter : les déplacer hors du dépôt ou les supprimer. Les versions utilisées par l'app sont les JPEG sans métadonnées de `assets/photos/`.

- Pousser les commits : le shell de Claude n'a pas d'identifiants GitHub. Installer `gh` puis `gh auth login`, ou ajouter la clé SSH à GitHub.
- Brancher un téléphone Android (débogage USB) pour les vérifications sur appareil. Pas d'émulateur ni de SDK Android installé sur la machine.
- Choisir une licence pour le projet (le fichier `LICENSE` du template Expo a été supprimé), compatible ARASAAC.
- Créer le dépôt GitHub Pages `ali-lamhene.github.io` (page du lien de partage, fichiers App Links / Universal Links).
- Compte Apple développeur, quand on attaquera l'iPhone.
