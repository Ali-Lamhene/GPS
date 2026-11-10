# État du projet

Fichier de passation entre sessions. Mis à jour à la fin de chaque tâche, dans le même commit. Lu automatiquement au démarrage de chaque session (hook `SessionStart`).

**Dernière mise à jour** : 2026-11-10

## Reprise (à lire en premier)

**Dernière session : 2026-11-10, retours terrain en 6 points.** Le détail est dans la section « Retours terrain du 2026-11-10 », plus bas, sous « Prochaine étape (session suivante) ».

- Faits : 6 (icônes), 3 (photo sur les épingles, à vérifier sur téléphone), 2 (photo de rue la plus proche), 1 (spec 032 livrée : alerte à 15 m, nouveau trajet après 30 m).
- **Prochaine étape : point 4**, la photo Panoramax proposée à la création d'un lieu. Les 4 réponses de l'utilisateur sont notées dans la section du 2026-11-10 : il reste à écrire la spec 033 (skill `feature`) et à la faire valider, puis à coder.
- Ensuite : point 5 (lieux absents au dézoom), qui demande le téléphone branché en USB.
- Question ouverte : réduire le seuil d'arrivée de 25 m (point 2) ?
- Un build `preview` est nécessaire pour tester ces correctifs sur le téléphone.

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

- Maquette v7 implémentée (2026-10-31), voir « Prochaine étape ».
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

Les 30 écrans de la maquette v7 sont codés en interface statique (données factices, guidage simulé : toucher la carte de consigne fait avancer). Test fonctionnel complet dans le navigateur réussi (accueil → transport → récapitulatif → 14 étapes de guidage dont E21 → arrivée ; aide contextuelle ; création d'un lieu). Lancer : `npx expo start --web` (sans `CI=1`, qui coupe le rechargement).

Spec 002 « carte d'abord » : témoins validés par l'utilisateur (2026-10-31), puis style généralisé à toute l'app dans le navigateur (2026-11-01). La carte embarquée sert de fond à l'accueil, au choix du transport (E06), au récapitulatif (E07-E08, une étape ouverte cadre la carte dessus), au guidage, à l'arrivée (E26), au problème de connexion (E25), à la position et au pictogramme d'un nouveau lieu (E27-E28) ; la carte d'aide (E24) montre une petite carte de la situation ; le métro hors connexion (E21) dessine la ligne avec ses vraies stations. Interface flottante commune : en-tête (`MapHeader`), panneau blanc (`FloatingSheet`), barre d'action pleine largeur. Test fonctionnel complet dans le navigateur réussi, aucune requête hors de l'app.

Spec 005 « accueil sur la carte, formes plus sobres » (2026-11-01) : l'accueil est une carte vive centrée sur le voyageur, ses lieux en épingles à toucher (sauf ceux marqués « ne pas montrer sur la carte », dont la maison par défaut), un panneau du bas avec le chemin départ ··· marcheur ··· arrivée (horizontal, choisi par l'utilisateur après essai de 5 variantes, la colonne verticale étant jugée trop austère) et 4 raccourcis de lieux plus « … » ; une fois l'arrivée choisie, ✕ pour annuler et ✓ pour continuer. Le départ est la position actuelle par défaut. Un doigt déplace la carte partout (révise la spec 002). E06 : plus de coche sur le mode choisi. Partout : arrondis de 4, 8 et 16 dp, barre d'action pleine largeur au lieu du disque à halo, icônes réduites, tuiles de lieux blanches. Les épingles n'existent que dans le navigateur tant que MapLibre natif n'est pas branché.

Révision photos de la spec 005 (2026-11-01) : après un labo (icônes pleines, au trait, photos), un lieu qui a une photo la montre avec son pictogramme en petit (coin bas gauche, en diagonale du drapeau d'arrivée), sur les raccourcis, les épingles et les pastilles du chemin. Un lieu caché de la carte (maison, famille) ne montre jamais sa photo dans les raccourcis. Démo : 3 photos libres Wikimedia Commons (mairie, lycée, haltères), recadrées, sans métadonnées, embarquées en `data:` dans `src/features/traveller/demo/photos.ts`, crédits dans `docs/credits-photos.md` ; le lieu « centre-ville » devient « la mairie ». Les écrans « arrivé » et « aide » filtrent aussi la photo avec `isLocalPicture`.

Spec 007 « accueil carte flottante et bouton + » (2026-11-02), **livrée** dans le navigateur :

- L'accueil reprend la variante F du labo : la carte reste entière, une carte blanche flotte en bas avec le chemin (capsule grise) et un carrousel de grandes vignettes (photo avec pastille de catégorie, ou tuile illustrée). Une fois l'arrivée choisie, ✕ et une barre ✓ en pilule.
- Bouton « + » en haut à droite de l'accueil, à la place de l'aide (D13 révisée : pas d'aide à l'accueil, elle revient dès E06). Toucher : nouveau lieu « ici » (E27-E29). Appui de 3 s : adresse de l'accompagnant (E30), anneau caché la première seconde, aucun texte. Le lieu créé est seulement gardé, l'arrivée ne change pas ; il prend sa place dans l'ordre de la spec 001 (`placeOrder`).
- Feuille des lieux : seulement pour choisir, plus de tuile d'ajout ni de texte « Accompagnant » (question 11 close).
- Palette du labo dans tout le thème (bleu `#2F6BFF`, encre `#111827`, gris `#F3F4F6`) et une couleur par famille de lieux (`placeCategory`), contraste d'au moins 3:1 avec le blanc vérifié par un test.
- Labo `/dev/home-lab` retiré du dépôt (copie de secours hors dépôt, dans le dossier temporaire de la session).
- Inclut le travail du 2026-11-01 au soir : épingle `location_on` au départ.

Spec 008 « refonte visuelle clair premium » (2026-11-02), **livrée** dans le navigateur, après un labo (`/dev/ui-lab`, retiré) et l'analyse de 9 kits Envato :

- Système : carte gris perle partout (la carte beige est retirée), cartes blanches flottantes à 28 dp détachées des bords (`FloatingSheet`), pilule bleue de 64 dp (`MainActionButton`), couleurs vives en dégradé par famille de lieux (`colors.vivid`, deux bouts à 3:1 au moins avec le blanc, testé), pictogrammes plats blancs, même rendu de lieu partout (`PlaceArt`, `VividFill`) : épingles, chemin, cartes, feuille, arrivée.
- Accueil : rien n'est choisi au départ (révise la spec 005) ; la pastille à remplir appelle (pointillés bleus et halo, sans second canal, choix de l'utilisateur), d'abord le départ puis l'arrivée ; grandes cartes de lieux (75 % de la largeur, 200 dp au moins), carte « ici » en premier pour le départ ; « + » flottant bleu en bas à droite ; ✕ et pilule ✓.
- Guidage : consigne en pilule sombre (orange pour « descends »), flèche de virage dans un anneau vert qui se vide à l'approche (`approachLeft`) ; carte de progression flottante.
- Autres écrans : choix du transport, récapitulatif, métro (thème sombre gardé), aide (message dans une carte), connexion, arrivée (lieu en vedette, coche en rebond), nouveau lieu.
- Pictogrammes 3D (Fluent Emoji) essayés puis écartés : plats retenus. Rappel du trajet sans flèche (`TripEnds`, déjà conforme à la spec 006).
- Jest : délai de test porté à 15 s (`testTimeout`), les tests dépassaient 5 s quand la machine est chargée.

Nettoyage du 2026-11-03 (D15) : l'utilisateur juge l'interface « clair premium » sans personnalité (« bootstrap ») et fournit une nouvelle maquette, `docs/design/maquette-emeraude.png` (accueil sur une carte crème, accent émeraude unique), qui **fait foi**. Décision D15 écrite ; principe 4 révisé (cibles à la taille de la maquette, plus de minimum de 64 dp) ; D11 et la palette de D12 remplacées ; specs 002, 005, 007, 008 marquées « partie visuelle remplacée » ; `docs/screens.md` (règles 3 et 11, § 8), `code.md`, `.claude/CLAUDE.md` et la grille de `ux-sans-texte-reviewer` mis à jour. Supprimés : anciens docs de conception (`docs/design/brief.md`, `ecrans.md`, `guide-claude-design.md`, `references.md`), planche `/dev/screens`, tokens et export jamais utilisés, les 11 PNG générés d'`assets/images/` (hors git). La maquette a été réenregistrée sans son manifeste C2PA OpenAI avant d'être commitée. Les données de démonstration restent jusqu'à l'étape « fonctionnel ».

**Prochaine étape** (ordre décidé le 2026-11-03) :

1. [x] Nettoyage du dépôt et des règles obsolètes (D15).
2. [ ] MapLibre natif : carte sur téléphone.
   - [x] Code (2026-11-03, relu deux fois par `security-reviewer`) : `@maplibre/maplibre-react-native` 11.5.1 (version exacte), `expo-dev-client`, `expo-asset` (dépendance manquante d'`expo-audio`) ; `TripMap` natif (`src/ui/map/trip-map.tsx`, marqueurs `map-markers.tsx`, crédit ⓘ `map-texts.tsx`) ; réseau et logs de MapLibre coupés (`native-map-setup.ts`) ; archive lue seulement depuis un `file://` (`localTilesUrl`) ; permissions de localisation bloquées ; ESLint limite le paquet à `src/ui/map` sans ses modules à risque ; identifiant `org.gpssanstexte.app`, build de dev `org.gpssanstexte.app.dev` (schéma `gps-dev`, `app.config.ts`, `APP_VARIANT`) ; `eas.json` profil `development` (APK).
   - [ ] `eas init` (compte Expo `otakumi`, choisi par l'utilisateur), puis `npx eas-cli build --profile development --platform android`, installation de l'APK sur le téléphone, `npx expo start --dev-client --offline`.
   - [x] Build de dev Android terminée (2026-11-03, 2e essai après la correction des icônes) : APK à installer.
   - [x] APK de dev installée sur le téléphone de l'utilisateur (2026-11-04) et app ouverte, connectée au serveur Metro par le partage de connexion du téléphone : `EXPO_OFFLINE=1 npx expo start --dev-client --host lan`, URL saisie à la main `http://<ip-du-pc>:8081`. Rechargement en direct confirmé. Pas d'adb : l'utilisateur regarde l'écran et répond (adb sans fil possible avec `sudo apt install adb`).
   - [ ] Vérifier sur le téléphone : tuiles affichées avec le réseau de MapLibre coupé (forme `pmtiles://file:///…` non confirmée par la doc), aucune `MapLibreConfigurationException` dans logcat, épingles touchables, recentrage, crédit ⓘ ; `aapt dump permissions` sur l'APK (rien d'autre que `INTERNET`, plus `SYSTEM_ALERT_WINDOW` en debug). Puis spec 002 au statut `livré`.
3. [ ] Refonte visuelle selon la maquette émeraude, écran par écran.
   - [x] Accueil : spec 009 livrée dans le navigateur (2026-11-03, relue par `ux-sans-texte-reviewer`). Carte crème et point de position émeraude sur tous les écrans ; pilule épingle ····· drapeau ; épingles en goutte ; panneau de tuiles carrées ; « + » émeraude ; pictogrammes au trait ; composants `PlaceFace`, `PlaceTile`, `pin-shape.ts`, jetons `emerald`, `warmWhite`, `warmEdge`. À revoir sur le téléphone avec la build de dev.
   - [x] Autres écrans : spec 010 livrée dans le navigateur (2026-11-03, d'après le catalogue de maquettes de l'utilisateur, gardé hors du dépôt pour ses manifestes C2PA ; relue par `ux-sans-texte-reviewer`). Émeraude partout, boutons ronds blanc chaud sans zone tactile élargie (`sizes.minTarget` retiré), aide blanche à 56 dp, guidage en carte blanche à contour vert « bon chemin » (`#2FBF71`), barre de progression en points, E21 sombre aux accents émeraude, arrêts en gouttes. À revoir sur le téléphone.
   - [x] Retours sur l'accueil : spec 011 livrée dans le navigateur (2026-11-03) — pilule et pastilles agrandies (56 dp), tuiles d'environ 117 dp sans « … », toucher un bout ouvre tous les lieux pour ce bout, petit bouton de l'accompagnant (deux personnes) à côté du « + » au lieu de l'appui de 3 s, catalogue de 77 pictogrammes en 11 familles (`src/domain/pictograms.ts`), domiciles et santé sensible cachés de la carte par défaut.
   - [x] Retours sur téléphone : spec 012 livrée (2026-11-04, validée sur le téléphone, relue par `ux-sans-texte-reviewer`) — raccourcis de l'accueil à 56-64 dp, écart 8-14 dp calculés pour que la dernière tuile soit toujours coupée (40 à 65 %), panneau d'environ 100 dp, pastille de pictogramme sur photo à 26 dp.
   - [x] Spec 013 livrée (2026-11-04, validée sur le téléphone, relue par `ux-sans-texte-reviewer`) : colonne en bas à droite de l'accueil (recentrer, accompagnant, « + », même axe, écart 12 dp), cadrage gardant environ 70 dp libres à droite pour qu'aucune épingle ne tombe sous la colonne ; ⓘ du crédit à 24 dp sur tous les écrans avec carte (zone de toucher 48 dp, web compris).
   - [x] Spec 014 livrée (2026-11-04, validée sur le téléphone, relue par `ux-sans-texte-reviewer`) : cadre racine `SystemBarsFrame` qui arrête l'app aux barres système d'Android, bandes blanc chaud et icônes foncées en haut (sombres sur E21 et E29, `useDarkSystemBars`), marges haut et bas des écrans remises à zéro ; bouton de l'accompagnant en clavier. Limite : boutons de la barre du bas peu visibles en mode sombre du téléphone et sur E21/E29 (nouvelle build nécessaire : `userInterfaceStyle: "light"`, `expo-navigation-bar`).
   - [x] Écran noir et délai à l'ouverture de « + » et du clavier corrigés (2026-11-04, vérifié sur le téléphone) : fond de la fenêtre en blanc chaud (`expo-system-ui`, au lieu du noir du mode sombre, vu pendant les transitions et l'ouverture du clavier) ; carte MapLibre en `androidView="texture"` (la surface GL restait noire jusqu'à sa première image).
4. [ ] App entièrement fonctionnelle : vraies données à la place de la démo (specs 001, 003, 004), retrait de `src/features/traveller/demo/` et `src/features/social-worker/demo/`.
   - [x] Démonstration retirée de l'app (2026-11-05, demande de l'utilisateur) : l'app démarre vide même en développement, `EXPO_PUBLIC_DEMO_PLACES` n'existe plus. Lieux, photos et trajet de Marseille déplacés dans `src/testing/fixtures/`, pour les tests seulement ; ESLint interdit à l'app d'importer `src/testing/`. Les points « domicile » et « travail » des tests sont maintenant des lieux publics (cours Julien, gare Saint-Charles).
   - Ordre décidé le 2026-11-04 : stockage, puis lien de partage, recherche d'adresse, photo, liste de l'accompagnant (modifier, supprimer). Chiffrement au repos : non pour l'instant. Effacement rapide en cas de fouille : spec dédiée plus tard.
   - [x] Spec 015 livrée (2026-11-04, vérifiée sur le téléphone, relue par `security-reviewer` et `ux-sans-texte-reviewer`) : lieux gardés dans `places.json` (stockage privé, `expo-file-system`, déjà dans la build), écriture sûre (temporaire, copie `.bak`, fichier illisible mis de côté), accueil vide au premier lancement avec tuile « + » centrée, croix rouge si l'enregistrement échoue. Démonstration seulement avec `EXPO_PUBLIC_DEMO_PLACES=1` en développement. Transfert direct Android vers un nouveau téléphone accepté.
   - [x] Spec 016 codée (2026-11-04, relue par `security-reviewer`) : rien de l'app dans une sauvegarde ni un transfert. iPhone : module local `modules/backup-exclusion` (Documents et Application Support exclus au lancement). Android : plugin `plugins/with-no-data-extraction.js` (`dataExtractionRules`, tous les domaines, sauvegarde en ligne et transfert direct). **À vérifier dans la prochaine build** (APK : manifeste et `res/xml/no_data_extraction.xml` ; iPhone : sauvegarde chiffrée listée) avant de passer la spec à `livré`.
   - [x] Spec 017 codée (2026-11-04, relue par `security-reviewer` et `ux-sans-texte-reviewer`) : carte en ligne OpenFreeMap (D16, exception à D1), vraie position (`expo-location`, premier plan), états « recherche » et « indisponible », nuage hors connexion (`expo-network`). Archive de Marseille et `pmtiles` retirés. **Nécessite la prochaine build** : ne pas recharger l'ancienne build de dev (modules natifs manquants).
   - [ ] Autonomie donnée par l'utilisateur le 2026-11-04 : coder toutes les fonctionnalités manquantes, commits au fil de l'eau, une seule build regroupant le natif ; l'utilisateur testera tout en réel ensuite.
   - [x] Spec 018 (2026-11-04) : tout le natif en une build (mode clair, barre du bas, `expo-camera`, `expo-image-picker`, `expo-image-manipulator`, `expo-sensors`, App Links en build publiée seulement). Build de dev complète lancée le 2026-11-04 (tout le natif, ML Kit retiré, vieux liens ignorés) : https://expo.dev/accounts/otakumi/projects/GPS/builds/ef0b3be7-85ee-492e-9a0f-c19c4af368d4
   - [x] Spec 019 codée (2026-11-04, relue) : recherche d'adresse Photon (E30), garder ou envoyer par lien, réception du lien (épingle et coche, une seule lecture, retour au trajet), hôtes dans `src/services/hosts.ts`. À faire côté utilisateur : dépôt `ali-lamhene.github.io` avec `.well-known/assetlinks.json` et `.nojekyll` ; tester les liens sur une build « preview ».
   - [x] Spec 020 codée (2026-11-04, relue) : E29 avec l'appareil photo de l'app et le sélecteur du système, photo réencodée sans métadonnées, gardée dans `Documents/photos/` (nom seul dans le fichier), caches vidés, photos orphelines effacées. **Prochaine build** : ML Kit retiré d'`expo-camera` (`plugins/with-no-camera-scanners.js`).
   - [x] Spec 021 codée (2026-11-04, relue) : trajets réels par Transitous (D17), calculés à l'entrée sur E06, lus strictement ; guidage construit depuis les vraies étapes et avancé par la position ; arrivée à 25 m. À faire côté utilisateur : licence libre, dépôt public.
   - [x] Spec 022 (2026-11-04, relue) : liste des lieux côté accompagnant (envoyer, supprimer avec la photo et la copie de secours), écritures en file unique, pas de cache disque des images. **Prochaine build** : `plugins/with-no-link-from-history.js` (un vieux lien n'est jamais relu).
   - [ ] Trajets gardés sur le téléphone, hors connexion (D5).
   - [ ] Métro sans GPS : compter les arrêts (capteurs posés dans la build).
   - [ ] Spec 006 : sens de lecture, vérification en RTL.

Reste aussi à coder la spec 006 « sens de lecture » : flèche « → » devant la direction d'un bus ou d'un métro, vérification en RTL forcé sur téléphone.

À trancher (relectures des specs 007 et 008) :

- Accueil émeraude (relecture spec 009) : poignée du panneau retirée (rien ne se tire, décidé le 2026-11-03). À tester sur le terrain : halo pâle au soleil, badge épingle / drapeau lisible, contraste crème / rues blanches sur un écran bas de gamme, épingles de 42 dp et ⓘ de 34 dp pour un pouce stressé, point émeraude reconnu comme « moi », ✓ compris partout.

- « + » flottant (spec 008) : peut se lire comme une croix de pharmacie ; un voyageur en détresse peut le garder enfoncé 3 s (formulaire en texte). À observer lors des tests avec des voyageurs.
- Halo de la pastille à remplir sans son ni vibration (choix de l'utilisateur, dérogation à la règle des deux canaux) : à observer en test.
- Bouton d'attribution « i » de la carte : une lettre qui ouvre du texte (ancien).
- Sécurité (relecture MapLibre natif, 2026-11-03) : clé de signature de production gérée par EAS (dépend de la sécurité du compte Expo) ou keystore local / Play App Signing, à décider avant le premier build publié ; double authentification active sur les comptes Expo et GitHub (2026-11-05) ; profil EAS de production sans `developmentClient` ni `expo-updates` ; source de la position pour les specs 003/004 (le fournisseur « network » d'Android envoie les Wi-Fi vus à Google : imposer le GPS seul ?) ; avant le premier build iOS, vérifier qu'aucune requête ne part au montage de la carte et ajouter un suffixe au `bundleIdentifier` de dev.
- ~~Schéma `gps://` en build publiée~~ : retiré (D19, 2026-11-05) ; seule la build de dev déclare `yalla-dev://`. À confirmer sur la première build `preview` : démarrage, lien https à froid et à chaud.
- À tester sur le terrain : le voyageur retrouve-t-il son nouveau lieu dans le carrousel ? Le bord coupé donne-t-il l'idée de glisser jusqu'à « … » ?
- À tester sur le terrain (relecture UX de la spec 008) : l'anneau vert qui se vide est-il lu comme « le virage approche » (et pas « échec ») ? Le halo suffit-il pour qu'on touche d'abord le départ ? La carte « ici » et le « + » bleus se distinguent-ils ? La maison orange visible dès l'ouverture gêne-t-elle devant un tiers ?
- Vérification visuelle à refaire à 360 × 740 et 320 × 640 pour le choix du transport et le récapitulatif : Chrome a cessé de répondre pendant la session du 2026-11-02.

Ensuite : carte sur téléphone (MapLibre natif, `@maplibre/maplibre-react-native`) dès qu'un téléphone Android est branché : build de développement, revue sécurité dédiée, puis spec 002 au statut `livré`. Ensuite specs 003 (composer un trajet) et 004 (guidage).

Aide (D13, 2026-11-01, révisée le 2026-11-02 : sauf l'accueil et sa feuille des lieux) : bouton d'aide en haut à droite sur tous les autres écrans, guidage et métro hors connexion compris. La petite carte de l'aide ne montre au passant que le reste du tronçon en cours et l'arrêt ou le lieu à trouver ; avant le départ, ni photo du lieu d'arrivée, ni carte si le départ n'est pas la position actuelle ; le message demande l'arrêt à prendre (en transport), puis suit l'étape. Sur les écrans sombres (E21, E29), le disque d'aide garde un contraste adapté au fond (validé). Au guidage, les noms de station passent sous le pictogramme, sur toute la largeur du bandeau ; le bouton écouter rejoint la rangée des cadrans, le panneau garde une hauteur fixe.

Points laissés ouverts par les relectures de la spec 002 :

- Métro sans GPS (spec 004) : décidé le 2026-11-01, position hybride (arrêts comptés à l'accéléromètre, contrôlés par le temps prévu, recalés au GPS), alerte une station avant, prochaine station plutôt qu'un point qui glisse, bouton « je suis descendu » gardé. Recherche et détails : `docs/recherche/metro-sans-gps.md`.
- Lieux cachés de la carte d'accueil par défaut : « maison » et « famille » seulement (décidé le 2026-11-01). Le lien de partage (spec 001) ne doit transporter ni `hiddenOnMap` (recalculé chez le voyageur) ni photo.
- Sens de lecture : spec 006 validée (2026-11-01), à coder. Rappel du trajet sans flèche (E06, E07), barre de progression aux bouts marqués et jamais inversée, « ensuite » plus petit et plus pâle, flèche vers le bas dans le récapitulatif.
- Photos des lieux (relectures du 2026-11-01) : `PlaceAvatar` (accueil) et `PlaceVisual` (feuille des lieux, pictogramme au centre en 42 px) placent et dimensionnent le pictogramme différemment, à unifier ; pas de test sur le badge des épingles (`createPlacePin`) ; retirer `photos.ts` avec la démo avant la production. À observer pendant les tests : le petit pictogramme est-il vu, le drapeau reste-t-il lu comme « arrivée », la photo de la mairie (drapeaux) inquiète-t-elle ?
- Spec 005 reste `validé` : à vérifier au doigt sur téléphone (déplacement, épingles), après MapLibre natif. Le disque rouge de E25 et le sceau de E26 restent tels quels pour l'instant (décidé le 2026-11-01).
- UX : jauge d'approche du virage dans le bandeau (aujourd'hui flèche sur la carte) ; cône relié à la boussole et état « mauvais sens » (spec 004) ; barre d'action désactivée qui ne dit pas pourquoi (E28) ; pour les tests avec des voyageurs, un autre déclencheur que le bandeau pour faire avancer la démo.
- Sécurité : la version web restera-t-elle un outil de développement (sinon l'hôte verrait qui charge la carte) ? Modèle de carte hors de la zone embarquée (archive par ville, téléchargement par zone ou tuiles à la demande : chaque tuile demandée révèle la zone du voyageur) ; `postinstall` (copie du worker MapLibre) empêche `ignore-scripts=true` dans `.npmrc` ; MapLibre natif à relire avant installation.

Écarts relevés par `ux-sans-texte-reviewer`, non appliqués car la maquette v7 prévaut (D11), à trancher :

- Signaux : « tout droit », « arrivé à l'arrêt », « à bord » et « marche finale » n'ont ni son ni vibration ; l'attente du véhicule et le hors connexion n'ont pas de vibration ; gauche et droite ont le même son et la même vibration.
- Monter / descendre dessinés avec `login` / `logout` (métaphore informatique) ; « aller à l'arrêt », « attendre » et « à bord » partagent le même grand pictogramme.
- Orange de l'alerte (#E8710A) : contraste d'environ 3,1:1 avec le texte blanc, faible en plein soleil.
- Mise en page de droite à gauche (téléphones en arabe, persan, pachto) : flèches non inversées ; décider de forcer la gauche-à-droite ou d'inverser les glyphes.
- Pas de retour ni d'accueil sur l'écran de guidage ; la feuille des lieux masque l'aide.
- Déjà corrigé sans changer le rendu : retour Android qui ferme la feuille, badges de ligne insensibles à la taille de police système.

## Questions produit ouvertes

- ~~Nom définitif~~ : « Yalla map » (D19, 2026-11-05) ; aucune marque « Yalla » active en France pour les classes 9, 39, 42 (vérifié par l'utilisateur sur TMview). Refaire la vérification avant le Play Store.

0. Refonte émeraude (D15), à trancher dans sa spec : que montre la pilule du haut de l'accueil (épingle de départ, pointillés, drapeau) quand aucun trajet n'est choisi ? Comment se traduisent les autres écrans (guidage, récapitulatif, métro sombre, aide) qui n'apparaissent pas sur la maquette ?
1. Zone : France au lancement (D14). Reste à choisir la ou les villes pilotes (conditionne les données de transports en commun et la taille des cartes hors connexion).
2. Cartes hors connexion : quelle source de tuiles gratuite autorise le téléchargement ? (Les serveurs de tuiles OSM l'interdisent.) Piste : fichiers Protomaps / PMTiles d'une zone, hébergés en statique.
3. Recalcul quand le voyageur se perd : en ligne via un service public (envoie la position), ou seulement le ramener vers le tracé prévu, sans réseau ?
4. Voix : audios préenregistrés dans les langues des voyageurs, ou seulement sons et vibrations ?
5. Heure du rendez-vous : rappel « pars maintenant » ? Comment montrer une heure sans chiffres ?
6. ~~Licence du projet~~ : GPL-3.0-or-later (D18). ARASAAC (CC BY-NC-SA) incompatible : ne pas le réintroduire.
7. Distribution : Play Store et App Store, ou aussi APK installé par les associations ?
8. Tests : travailleurs sociaux / voyageurs prêts à tester des maquettes tôt ?
9. Création d'un lieu par le voyageur lui-même (« je suis ici » + photo) : spec ultérieure.
10. Sécurité (détail dans `docs/engineering/securite.md`) : chiffrer lieux et trajets au repos ? moyen rapide d'effacer ou cacher les lieux si le téléphone est fouillé ? bloquer les captures d'écran de la partie préparation ?
11. ~~Tuile « Accompagnant · appui 3 s »~~ : close par la spec 007 (appui long sur le « + », sans texte).
12. Licences des photos de démo : lycée (CC BY-SA 4.0) et haltères (CC BY 2.0) obligent à citer l'auteur dans toute version distribuée (export web, build envoyée). Décidé de régler plus tard : avant la première diffusion, écran de crédits côté accompagnant ou photos CC0 seulement. Ancienne question : photos de démonstration générées par ChatGPT : elles portent sans doute un filigrane invisible OpenAI, qui résiste au réencodage. À remplacer par des photos libres ou faites par l'équipe avant toute diffusion publique ?
13. Lecture à voix haute (relue par `security-reviewer`) : aujourd'hui, l'app ne lit qu'avec une voix française installée sur le téléphone (Android : voix Google « -local » seulement), sinon elle se tait. Reste à trancher :
    - durcir en natif (moteur de synthèse imposé, contrôle `isNetworkConnectionRequired`), supprimer la lecture des noms, ou passer à des audios préenregistrés (question 4) ;
    - le message d'aide lu à voix haute doit-il contenir le nom de la destination ? Les gens autour l'entendent ;
    - les sons de guidage doivent-ils respecter le mode silencieux, pour un voyageur discret ?
    - sans voix locale, quel signal sans texte montre que « écouter » ne marche pas ? La partie préparation doit-elle vérifier la voix et aider à l'installer ?
14. Avant le premier build natif : bloquer `SYSTEM_ALERT_WINDOW` en version publiée, vérifier `NSAllowsArbitraryLoads` (HTTPS seulement) sur iOS après prebuild, contrôler l'APK avec `aapt dump permissions`.

## Prochaine étape (fin du 2026-11-05)

L'utilisateur lance lui-même la build `preview` (`npx eas-cli build --profile preview --platform android`) et teste l'app en conditions réelles pendant quelques jours. **À la reprise** : recueillir ses retours de terrain, contrôler l'APK `preview` (lien de la build à fournir : permissions avec `aapt dump permissions`, `allowBackup="false"` et `dataExtractionRules`, `autoVerify` des liens, aucune activité du client de dev), puis préparer la bêta sur les stores.

**Build `preview` (2026-11-05)** : https://expo.dev/accounts/otakumi/projects/GPS/builds/a77565f8-2c19-4bbe-8cf2-7c342ad43ec3 (APK à contrôler à la reprise).

**Premiers retours de terrain de l'utilisateur (2026-11-05), à traiter à la reprise, rien de codé :**

1. On ne peut pas tourner la carte (rotation à deux doigts).
2. Souci graphique sur les icônes quand on ajoute un lieu (à faire préciser : quel écran, capture).
3. L'appareil photo ne se déclenche pas (E29, spec 020).
4. Pas assez clair qu'on peut toucher les pastilles de départ et d'arrivée (accueil).
5. On ne peut pas toucher les épingles de la carte pour choisir un lieu (sur téléphone).
6. Le bouton de géolocalisation (recentrer) est une cible ; il devrait être une épingle.
7. Recherche d'adresse (E30) : après le choix d'une suggestion, « Garder sur ce téléphone » est visible mais « Envoyer par lien au voyageur », en dessous, est caché par le clavier ; on ne comprend pas tout de suite qu'il existe.
8. Retirer le choix « voiture » des modes de transport (E06) : décision de l'utilisateur, révise D2. À spécifier (spec du choix du transport, calcul des trajets de la spec 021, D2).
9. Guidage : toucher la consigne la change (une flèche « tout droit » devient « à gauche »). Probable reste du guidage simulé de la maquette statique (« toucher la carte de consigne fait avancer ») dans le guidage réel de la spec 021.
10. Guidage, chemin du bas (départ ···· arrivée) : des pictogrammes génériques au lieu de ceux des lieux, « drapeau » pour l'arrivée. **Plus aucune cible dans l'app** (précisé par l'utilisateur le 2026-11-05). Pour le départ, proposer à la spec l'épingle de la pilule de l'accueil (épingle ····· drapeau), à confirmer, en tenant compte du point 6 (bouton de géolocalisation en épingle) pour que chaque symbole garde un seul sens.
11. Guidage : les points du chemin du bas se remplissent au fur et à mesure du déplacement, pour donner une idée de la distance restante.
12. Accueil : après avoir choisi départ et arrivée puis touché ✕, la pastille de départ qui attend un choix montre un contour **carré** au lieu du halo rond.

**Retours complémentaires (2026-11-08), réponses de l'utilisateur incluses :**

13. Guidage : quand le voyageur se trompe de chemin, rien ne l'indique (état « mauvais sens » reporté par la spec 021). À spécifier, sur au moins deux canaux.
14. Carte d'aide : elle dit « je cherche <nom du pictogramme> » au lieu de l'adresse. **Décidé** : afficher l'adresse ; pour un lieu sans adresse (épingle posée, photo), la demander à Photon (géocodage inverse, envoie la position du lieu ; accepté par l'utilisateur, à justifier dans la spec).
15. Au-delà d'un certain écart, **recalculer un nouveau trajet, le plus court, comme Google** (décidé par l'utilisateur).
16. La recherche d'adresse (Photon, E30) est très longue.
17. Arrivée : un voyageur qui ne lit pas ne reconnaît pas le bâtiment. **Décidé** : montrer une photo de rue du lieu d'arrivée. Google écarté (payant, interdit de garder les photos, envoie la destination à Google, contraire à D1). Source retenue : **Panoramax** (API testée le 2026-11-08 : `api.panoramax.xyz/api/search?place_position=lon,lat` renvoie des photos tournées vers le point ; Marseille, Paris, Lyon couverts ; licences etalab-2.0 et CC-BY-SA 4.0, à créditer, spec 024). Reçoit la zone de l'arrivée et l'IP, à écrire dans la spec. Sans photo Panoramax : photo de l'accompagnant ou pictogramme.

Fait le 2026-11-08 :

- Point 9 corrigé : la consigne ne se touche plus avec une position récente ; sans nouveau point depuis 30 s (métro, tunnel), le toucher fait de nouveau avancer (spec 021 précisée). Relu par `ux-sans-texte-reviewer`. Restent, à traiter avec le point 13 : rien ne montre que la position est perdue ni que la consigne devient touchable ; un GPS présent mais faux (dérive de plus de 60 m) bloque la consigne, l'aide est la seule sortie ; aucune étape réelle n'est marquée `offline` (l'écran métro « Je suis descendu » n'apparaît qu'en démo).
- Point 3 corrigé, **cause trouvée** : l'option `cameraPermission: false` du plugin `expo-image-picker` retirait la permission `CAMERA` du manifeste Android (`tools:node="remove"`), donc l'appareil photo de l'app ne pouvait jamais être autorisé. Relu par `security-reviewer`. **Demande une nouvelle build `preview`** (changement natif).
- Point 5 corrigé : sur Android, un marqueur MapLibre est une vue native posée sur la carte, le toucher n'atteignait pas le `Pressable` à l'intérieur ; c'est maintenant le `onPress` du marqueur, plus l'action `activate` pour TalkBack. À vérifier sur le téléphone : deux épingles proches, réactivité.
- Point 12 corrigé (hypothèse, à vérifier sur le téléphone) : le disque vide et le disque avec lieu ont des clés distinctes, pour qu'Android monte une vue neuve au lieu de dessiner la nouvelle bordure carrée.
- Point 7 corrigé : le clavier se ferme au choix d'une suggestion, les deux boutons sont visibles.
- Point 16 : Photon répond en 0,2 à 0,3 s depuis un ordinateur (mesuré le 2026-11-08). La lenteur vient sans doute du téléphone ou du réseau mobile ; à préciser avec l'utilisateur (combien de secondes, « Recherche… » qui ne finit pas ?). Aucune limite de temps sur la requête aujourd'hui.
- Point 2 : attend une capture.

Specs livrées le 2026-11-08 (autonomie, relues par `ux-sans-texte-reviewer` et `security-reviewer`, rien de vu sur téléphone) :

- 026 retrait de la voiture (point 8, D2 révisée).
- 027 plus aucune cible : épingle à personnage pour « moi ici » et le recentrage, personnage barré quand la position manque ; vrais lieux aux bouts du chemin du guidage ; points faits plus gros (points 6, 10, 11 ; le remplissage des points existait déjà depuis la spec 021).
- 028 rotation de la carte à deux doigts ; main qui tape sur la pastille à remplir (points 1, 4).
- 029 adresse du lieu sur la carte d'aide, demandée une fois à Photon pour un lieu sans adresse, jamais pour un lieu caché (point 14).
- 030 photo de rue Panoramax de l'arrivée : dernière marche et écran d'arrivée, téléchargée une fois, gardée en mémoire seulement (point 17).
- 031 hors du chemin : cadre orange, épingle barrée, alerte, puis nouveau trajet depuis la position (6 au plus par trajet) ; main sur la consigne quand elle se touche (points 13, 15).

**Décisions de sécurité prises par l'utilisateur (2026-11-08)** : menace précisée dans D1 et `securite.md` (réfugiés déjà en France, pas recherchés ; rien chez nous qui relie une identité à des déplacements ; appels déclarés à des services tiers sans compte acceptés). Recalcul en cours de route accepté, y compris vers un domicile (031) ; stockage OVH de l'IGN accepté, crédit par photo à revoir avant les stores, photos anciennes gardées (030) ; adresse demandée et gardée pour tous les lieux, domicile compris (029).

**Prochaine étape (session suivante) : vérifier que la V1 fonctionne.** Build `preview` lancée par l'utilisateur le 2026-11-08 (correctif de l'appareil photo). À la reprise, recueillir ses retours **un point à la fois** (consigne globale de l'utilisateur) :

Vérifications sur le téléphone :

1. Épingle à personnage (027) : comprise comme « moi », distincte de l'épingle simple du départ, lisible avec le badge dans la pastille de départ, bouton de recentrage trouvé.
2. Main sur la pastille à remplir (028) : fait-elle comprendre qu'on peut toucher ? touche-t-on la main au lieu de la pastille ? visible au soleil ? quel chemin est pris (pastille ou tuiles) ?
3. Rotation de la carte (028) : deux doigts, cône juste, rotation involontaire pendant un zoom, recentrage remet l'axe.
4. Photo de rue (030) : apparaît-elle (lieu en ville créé sans photo) ? bon bâtiment ? reconnaissable à 168 × 124 au soleil ? comprise comme l'arrivée ? essaie-t-on de la toucher ?
5. Seuils hors du chemin (031, 40 m / 10 s / retour à 25 m) : alerte assez tôt, fausses alertes (rues étroites, places, gares), nouveau trajet rapide et depuis la position, l'orange part en revenant.
6. Signal « tu t'es trompé » (031) : orange et épingle barrée compris, alerte sentie en poche, nouveau trajet compris, que faire sans réseau, main sur la consigne sans position.

Aussi à vérifier : appareil photo (bug 3), épingles de la carte touchables, y compris deux proches (bug 5), clavier fermé à la recherche d'adresse (bug 7), consigne non touchable avec position (bug 9), pastille de départ ronde après ✕ (bug 12), voiture absente (026), adresse sur la carte d'aide (029), points du chemin pas trop gros (027).

Points en suspens après la build : point 2 (icônes à l'ajout d'un lieu) et contour carré (12), captures promises par l'utilisateur, petits soucis non gênants ; point 16 (recherche d'adresse lente) : combien de secondes, « Recherche… » qui ne finit pas ?

À trier à la reprise : bugs qui rétablissent un comportement déjà spécifié (3, 5, 9, 12, sans doute 2 et 7) ; changements visibles qui passent par une spec (1, 4, 6, 8, 10, 11).

**Retours terrain du 2026-11-10** (6 points, autonomie donnée par l'utilisateur ; bugs d'abord, specs ensuite) :

1. [x] Erreur de trajet : spec 032 validée et livrée (alerte à 15 m sur 2 positions, sans attente ; recalcul à plus de 30 m à vol d'oiseau de l'endroit de l'alerte ; retour à 10 m). À vérifier sur le terrain : fausses alertes à 15 m (sinon repasser à 20 m, une constante) ; nouveau trajet qui arrive en marchant sur réseau lent (requête plus coupée à chaque position). Suggestion UX ouverte : faire pulser l'aide au 2e ou 3e rappel d'alerte, pour un voyageur arrêté.
2. Arrivée au 24 au lieu du 26, photo de l'entrée à 30 m.
   - [x] Photo : Panoramax ne trie pas sa réponse par distance (vérifié sur des points publics : 6, 10, 8 m…), l'app prenait la première photo tournée vers le lieu. Elle prend maintenant la plus proche, parmi 20 candidates au lieu de 10.
   - Arrivée : conforme à la spec 021 (écran d'arrivée à 25 m du bout du trajet ; deux numéros voisins sont à 10-20 m). Le bout du trajet est le point sur la rue, pas la porte, et le GPS en ville dérive de 10-20 m. Question ouverte : réduire ce seuil (révision de spec, à poser à l'utilisateur).
3. [x] Lieu enregistré avec photo, épingle sans photo : sur Android, MapLibre pose la vue de l'épingle hors écran puis la déplace sur la carte, et le chargement d'`expo-image` s'y perdait. L'épingle utilise l'image de React Native (Fresco relance le chargement à chaque rattachement). **Non vérifié sur téléphone** (aucun appareil branché) : à contrôler à la prochaine build.
4. Lieu dont le service fournit une photo : choisir cette photo ou en prendre une. **Entretien de spec en cours (skill `feature`), spec 033 pas encore écrite.** Réponses de l'utilisateur (2026-11-10) :
   - moment : à la création du lieu seulement (écran photo E29, que les deux parcours « ici » et adresse E30 traversent) ; pas de remplacement plus tard ;
   - lieux cachés de la carte (domicile, famille, santé) : **proposer quand même** (Panoramax reçoit une fois le point du lieu à environ 10 m et l'IP ; à écrire dans la spec et dans `securite.md`, révise la règle de la spec 030 pour ce seul moment) ;
   - affichage : vignette à toucher en bas de E29, à côté du déclencheur et de la galerie ; roue pendant la recherche ; rien trouvé, pas de vignette ;
   - nombre : la meilleure seule (la plus proche tournée vers le lieu, comme à l'arrivée).
     Reste à écrire la spec puis la faire valider. Points à y traiter sans redemander : photo choisie gardée comme une photo prise (réencodée, sans métadonnées, documents privés) ; panorama gardé recadré sur le lieu ; crédit de la licence (spec 024) pour une photo Panoramax gardée ; lieu envoyé à distance (lien) : la photo ne voyage pas.
5. Lieux hors de la vue par défaut absents au dézoom : bug **en attente d'un téléphone branché en USB** (débogage USB). Le JS envoie tous les lieux à la carte et MapLibre ne filtre pas par position : cause dans le natif Android (vues des marqueurs), à observer sur l'appareil.
6. [x] Grille des pictogrammes qui débordait au-dessus de la carte blanche (marge négative fixe de l'aperçu, plus grande que l'épingle) : corrigé, vérifié dans le navigateur.

Préparation de la bêta sur les stores (liste à compléter avec l'utilisateur) :

- Explications des permissions : textes iOS (`NSLocationWhenInUseUsageDescription`, `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`) ; côté Android, déclarations de la Play Console (localisation au premier plan, appareil photo) ; écran d'explication avant la demande système, en pictogrammes pour le voyageur (spec à faire).
- Play Console : formulaire « Sécurité des données » (position traitée sur le téléphone, envoyée à Transitous et OpenFreeMap ; texte tapé à Photon), politique de confidentialité publiée (page sur `ali-lamhene.github.io`), classification du contenu, public cible, accès à l'app, pas de publicité.
- Test fermé Google Play : un compte développeur personnel récent doit faire tester l'app par au moins 12 personnes pendant 14 jours avant la production (règle à revérifier).
- Clé de signature : Play App Signing ou clé EAS seule ; si Google signe, ajouter sa 2e empreinte dans `assetlinks.json`.
- Fiche du store : description, captures d'écran, icône 512 px, image de présentation 1024 × 500.
- iPhone : compte Apple développeur, `bundleIdentifier`, TestFlight, étiquettes de confidentialité d'Apple, Universal Links (`apple-app-site-association` sur le site des liens).
- Revérifier la marque « Yalla map » sur TMview (FR, EM, WO ; classes 9, 39, 42).
- Ménage : retirer `expo-web-browser` (inutilisé), traiter les 4 alertes Dependabot (`zod`, `glob`, `minimatch`, `deepmerge`), trancher la source de la position (fournisseur « network » d'Android).

Ensuite, en autonomie : trajets hors connexion (D5), métro sans GPS, spec 006 (droite à gauche), effacement rapide des lieux.

## Reprise du 2026-11-05 (décidé le 2026-11-04 au soir)

**Décisions et actions de l'utilisateur, à traiter en premier :**

1. ~~Licence libre et dépôt public~~ : fait le 2026-11-05 (D18). GPL-3.0-or-later ; historique réécrit avec l'adresse anonyme GitHub, dépôt GitHub recréé, privé le temps d'ajouter la licence. Dépôt public depuis le 2026-11-05 : seul l'utilisateur peut pousser ; push forcé et suppression de `main` interdits (ruleset `protect-main`) ; CI des contributeurs extérieurs soumise à approbation ; détection de secrets avec blocage au push ; signalement privé des failles ; alertes Dependabot. Le choix de Transitous (D17) reste à confirmer.
2. ~~Dépôt GitHub Pages~~ : fait le 2026-11-05. Dépôt public `Ali-Lamhene/ali-lamhene.github.io` (copie locale `../ali-lamhene.github.io`), mêmes protections que GPS. Page de repli `l/` (chemin neutre depuis D19, ancien `gps/lieu/`) : épingle émeraude seule, sans texte, sans script, CSP stricte (même épingle que l'icône de l'app, spec 025). `robots.txt` sans indexation. `.well-known/assetlinks.json` avec l'empreinte de la clé de signature gérée par EAS (choix de l'utilisateur), créée sans build pour le profil `preview` (APK au vrai nom de paquet, nouveau dans `eas.json`). Relu par `security-reviewer` : liens envoyés avec la barre finale (`…/l/#…`, évite la redirection de GitHub Pages ; les deux formes sont lues et déclarées en App Links), `SYSTEM_ALERT_WINDOW` bloquée hors build de dev (`app.config.ts`), lecture d'`assetlinks.json` par Android documentée (`hosts.ts`, `securite.md`). Reste :
   - Identifiant `io.github.alilamhene.yalla` (D19) : nouvelle clé EAS créée par l'utilisateur, empreinte `A3:CC:…:61:41` publiée dans `assetlinks.json` à la place de l'ancien paquet (2026-11-05). L'ancienne clé d'`org.gpssanstexte.app` peut être supprimée d'EAS. Liens de partage sur le chemin neutre `https://ali-lamhene.github.io/l/#…`.
   - Toujours lancer la build avec `--platform android` : le profil `preview` n'a pas de configuration iOS relue.
   - Contrôles sur la première APK `preview` avant de la distribuer : `aapt dump permissions` (INTERNET, VIBRATE, localisation au premier plan, CAMERA et ce que les specs justifient, rien d'autre) ; `dataExtractionRules`, `allowBackup="false"` et `autoVerify` dans le manifeste ; pas d'activité du dev launcher ; App Link « vérifié » sur le téléphone (Réglages > Apps > Ouvrir par défaut). La spec 016 attend aussi cette build.
   - À trancher avec la question 7 (distribution) : si la diffusion passe par Play App Signing, Google signe avec une autre clé, à ajouter dans `assetlinks.json` ; une APK installée à la main ne se mettra pas à jour depuis le Play Store.
   - Lien ouvert sans l'app : l'URL complète (lieu compris) reste dans l'historique du navigateur, synchronisé vers Google si Chrome synchronise. L'effacer demanderait un petit script dans la page (fin du principe « aucun script »). À trancher.
   - Compte GitHub : point unique de confiance des liens (page et `assetlinks.json`). Double authentification active.
3. **Arbitrages de sécurité** (détail dans les specs 019 à 022) :
   - ~~En-tête Transitous~~ : `YallaMap/1.0 (otakumi.factory@gmail.com)` (D19, 2026-11-05).
   - ~~Crédit Transitous~~ : spec 024 livrée (2026-11-05) : « Trajets : Transitous » dans le ⓘ de la carte, liens vers les sources de Transitous et le copyright OpenStreetMap sur E30 (accompagnant). `expo-web-browser`, inutilisé, reste dans `package.json` (modèle Expo) : à retirer avec une relecture sécurité.
   - ~~Lien forgé~~ (décidé le 2026-11-05) : à la réception, le voyageur voit le lieu et choisit en pictogrammes d'accepter ou de refuser l'ajout ; les accompagnants briefent les voyageurs (ne pas ouvrir un lien d'un inconnu). Spec 023 livrée dans le navigateur (2026-11-05, relue par `ux-sans-texte-reviewer` et `security-reviewer`), à vérifier sur téléphone avec la build `preview`.
   - ~~Domaine des liens~~ : `ali-lamhene.github.io` gardé pour l'instant (décidé le 2026-11-05) ; un vrai domaine neutre après les premiers retours des bêta-testeurs.
   - ~~Photos des lieux cachés~~ (décidé le 2026-11-05) : autorisées comme aujourd'hui, sans avertissement. La photo aide le voyageur à reconnaître sa porte ; risque accepté si le téléphone est fouillé.

**Puis tester toute l'app en réel** avec la build complète (dernière build de dev dans EAS) : l'installer à la place de l'ancienne (les lieux de test seront effacés). Les liens de partage ne s'ouvrent pas dans la build de dev (voulu) : il faudra une build « preview ».

**Ce qui reste pour une app complète (Claude, en autonomie) :**

- Garder les trajets sur le téléphone, utilisables sans réseau (D5).
- Compter les arrêts dans le métro sans GPS (capteurs déjà dans la build, spec 004).
- Spec 006 : sens de lecture, vérification de droite à gauche.
- Effacement rapide des lieux en cas de fouille (spec dédiée).

## En attente côté humain

- Nom « Yalla map » (D19) : nouvel identifiant Android, donc **nouvelle build de dev nécessaire** (`npx eas-cli build --profile development --platform android`) ; l'ancienne app de dev (`org.gpssanstexte.app.dev`) reste installée à côté, à désinstaller. Le serveur Metro se joint maintenant par le schéma `yalla-dev://`.

- Vérifications sur appareil : le téléphone se connecte au serveur Metro par le Wi-Fi ou le partage de connexion (`EXPO_OFFLINE=1 REACT_NATIVE_PACKAGER_HOSTNAME=<ip> npx expo start --dev-client --host lan`, puis QR code `yalla-dev://expo-development-client/?url=…`). Pas d'adb sur la machine (`sudo apt install adb` pour l'adb sans fil).
- Sauvegardes de l'ancien historique hors dépôt, à garder ou effacer : `../GPS-backup-20261105.git` et `../GPS-backup-20261105.tar.gz` (elles contiennent l'ancienne adresse).
- Compte Apple développeur, quand on attaquera l'iPhone.
