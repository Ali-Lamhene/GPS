# 018 — Préparation native de la build complète

- **Statut** : validé
- **Date** : 2026-11-04
- **Persona** : voyageur (barres système, photo, métro), accompagnant (lien, photo)
- **Révise** : spec 014 (limite des boutons de la barre du bas)

## Besoin

Chaque module natif demande une nouvelle build (une vingtaine de minutes). L'utilisateur veut une seule build avec tout le natif dont l'app complète a besoin, puis tester toute l'app en réel (décision du 2026-11-04, autonomie donnée pour finir l'app).

## Contenu

1. **Mode clair imposé** (`userInterfaceStyle: "light"`) et **barre du bas réglée** (`expo-navigation-bar`, `enforceContrast: false`) : boutons ◁ ○ □ ou trait foncés sur la bande blanc chaud, clairs sur les écrans sombres (E21, E29), même avec le téléphone en mode sombre. Corrige la limite de la spec 014.
2. **Photo d'un lieu** : `expo-camera` (appareil photo dans l'app : la photo ne passe pas par l'app photo du téléphone, qui en garde parfois une copie dans la galerie avec la position, puis dans Google Photos), `expo-image-picker` pour le seul sélecteur de photos du système, et `expo-image-manipulator` (redimensionner et réencoder, ce qui efface les métadonnées dont la position).
3. **Liens qui ouvrent l'app** (Android App Links) : exactement `https://ali-lamhene.github.io/l` et `/l/` (chemin neutre depuis D19, ancien `/gps/lieu`) (le lieu est après `#`), vérifiés (`autoVerify`), **dans la build publiée seulement** : jamais dans la build de dev, dont le lanceur chargerait le code désigné par un lien piégé. Tout lien entrant passe par `src/app/+native-intent.tsx` : seul un lien de lieu atteint son écran, le reste revient à l'accueil ; plus de « sitemap » d'Expo Router ni d'écran « introuvable » en anglais.
4. **Capteurs pour le métro** : `expo-sensors` (accéléromètre, boussole), pour le guidage sans GPS (spec 004). Pas de permission « mouvements » sur iPhone (podomètre non utilisé).

## Données et confidentialité

- **Permissions ajoutées** : `CAMERA` (par `expo-camera`, demandée au moment de la photo). Le sélecteur de photos du système ne demande aucune permission : `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_VISUAL_USER_SELECTED` bloquées, comme le micro. `HIGH_SAMPLING_RATE_SENSORS` bloquée (le métro n'a pas besoin de plus de 200 mesures par seconde).
- **Réseau** : aucun de ces modules n'envoie de donnée du voyageur. Sur Android 12 et moins, le sélecteur de photos peut être téléchargé une fois par les services Google Play.
- **App Links** : à chaque installation et mise à jour, Android (ou les services Google Play) vérifie `https://ali-lamhene.github.io/.well-known/assetlinks.json` : GitHub ou Google apprennent qu'un téléphone à cette adresse IP a installé l'app. Aucun lieu n'y passe.
- Textes iOS des permissions écrits en français pour l'accompagnant ; aucune build iOS avant l'exclusion des sauvegardes vérifiée (spec 016).

## Critères d'acceptation

- [ ] Sur le téléphone en mode sombre : app claire, boutons de la barre du bas foncés et lisibles ; clairs sur E21 et E29.
- [ ] `aapt dump permissions` sur l'APK : pas de lecture des médias, pas de micro, pas de localisation en arrière-plan.
- [ ] La build de dev s'installe et s'ouvre.

## À trancher (relecture `security-reviewer`)

- Domaine des liens : `ali-lamhene.github.io` dépend d'un compte GitHub ; s'il est piraté, les liens peuvent être détournés. Domaine dédié, ou compte durci (clé matérielle) ?
- Le schéma `gps://` reste dans la config de la build publiée ; `securite.md` §3 le réserve au développement.
- Appareil photo sur Android 9 et moins : non garanti (`minSdk` à décider).
- Tester les liens de partage demandera une build « preview » (vrai nom de paquet, sans lanceur de dev).

## Hypothèses

- Le sélecteur de photos du système (Android 13+, et versions plus anciennes par les mises à jour Google Play) suffit pour la galerie.
