# État du projet

Reprise courte, lue au démarrage de chaque session (hook `SessionStart`). Mise à jour à la fin de chaque tâche, dans le même commit. Le récit détaillé va dans `docs/historique.md`, pas ici.

**Dernière mise à jour** : 2026-11-17

## Où on en est

- App « Yalla map » (Expo SDK 58, Expo Router, `src/app/`), repo `Ali-Lamhene/GPS`, travail direct sur `main`, une fonctionnalité = un commit. Méthode : spec d'abord (skill `/feature`, specs dans `docs/specs/`), puis code avec tests.
- Lot du 2026-11-17 (mode autonome, 6 fiches, une session par fiche, avant la build `preview`) : fiches 1 à 5 livrées (accueil sans raccourcis spec 035 ; D21 `hiddenOnMap` supprimé, tout lieu a épingle et photo ; photo partout spec 036 ; vérification spec 033 ; appui long pour changer pictogramme et photo d'un lieu spec 037, D22). Suite de tests verte (442).
- **Reste : fiche 6 (dézoom)**, puis build `preview` unique (décision d'Ali du 2026-11-12 : une seule build après tous les retours).
- Rien de la fiche 1 à 5 n'est vérifié à l'écran sur téléphone (aucune build de dev installée). Listes « À voir sur le S8 » dans les specs 035 à 037.
- Retour terrain 2026-11-10, point 5 (lieux absents au dézoom) : bug natif Android (vues des marqueurs), demande un téléphone branché en USB.
- Ensuite, en autonomie : trajets hors connexion (D5), métro sans GPS (`docs/recherche/metro-sans-gps.md`), spec 006 (droite à gauche, RTL), effacement rapide des lieux.

## Décisions en vigueur (détail : `docs/product/decisions.md`, `docs/engineering/securite.md`)

- D1 sécurité : aucun compte, aucune identité, aucun serveur à nous ; menace = lien entre identité et déplacements. Appels tiers sans clé acceptés si la spec déclare les données reçues (Transitous, OpenFreeMap, Photon, Panoramax).
- D3 le lieu est l'objet central (photo, pictogramme, couleur) ; trajets composés départ + arrivée ; D4 calcul en ligne, trajets gardés sur le téléphone ; D2 à pied et transports (voiture retirée, spec 026).
- D15 maquette émeraude (`docs/design/maquette-emeraude.png`) fait foi ; D21 tout lieu (maison comprise) a épingle et photo partout ; D22 appui long sur une tuile de la feuille des lieux = changer pictogramme/photo (l'appui long sur l'épingle de la carte et son correctif MapLibre sont retirés, 2026-11-18, fiche 7) ; le toucher court choisit le trajet.
- Zéro texte dans l'interface : ESLint « zéro texte », sous-agent `ux-sans-texte-reviewer`, deux canaux de signal minimum. Plus aucune cible (spec 027) : épingle à personnage pour « moi ici ».
- Arrivée à 15 m (`ARRIVED_METERS`) ; alerte hors chemin à 15 m sur 2 positions, nouveau trajet à plus de 30 m, retour à 10 m (spec 032) ; 6 recalculs max par trajet.
- Photo de rue : Panoramax (la plus proche, 20 candidates), crédit à afficher ; proposée aussi pour un domicile (spec 033) ; la photo ne voyage pas dans le lien de partage.
- Position : fournisseur standard gardé. Dépôt public GPL-3.0-or-later (D18) : seul Ali pousse. Nom « Yalla map », identifiant `io.github.alilamhene.yalla` (D19), liens `https://ali-lamhene.github.io/l/#…`.
- Photos visibles dans la liste des lieux et sur capture : pas de `FLAG_SECURE` (choix d'Ali, 2026-11-17).
- Règles de code : `docs/engineering/code.md` et `securite.md` ; ESLint interdit `console.*`, `any`, `!`, `eval`, SDK de suivi ; import de paquets sensibles réservé (MapLibre dans `src/ui/map`, audio dans `src/services/feedback.ts`, voix dans `src/services/speech.ts`) ; `src/testing/` interdit à l'app.
- Lancer en web : `npx expo start --web` (sans `CI=1`). Toujours `--platform android` pour EAS (profil `preview` sans iOS relu).

## Questions ouvertes (une ligne chacune)

- Villes pilotes (zone France, D14) ? Source de tuiles pour cartes hors connexion ?
- Recalcul quand le voyageur est perdu sans réseau ? Voix : audios préenregistrés ou sons et vibrations seulement ?
- Lecture à voix haute : durcir le natif, supprimer la lecture des noms, ou audios ; le message d'aide doit-il dire la destination ?
- Moyen rapide d'effacer les lieux en cas de fouille (après le test terrain) ? Chiffrement au repos ?
- Distribution : Play Store, App Store, APK par les associations ? Clé de signature (EAS seule ou Play App Signing, 2e empreinte dans `assetlinks.json`) ?
- Licences des photos de démo / crédits avant diffusion ; marque « Yalla map » à revérifier sur TMview avant le Play Store.
- Historique du navigateur : l'URL du lien de partage y reste (effacer demanderait un script). À trancher.
- Alertes Dependabot : outils de build seulement, à fermer en « risque toléré » si Ali veut.

## Pièges connus actifs

- Épingle Android : image React Native (pas `expo-image`), sinon la photo ne se charge pas ; photo de l'épingle non vérifiée sur téléphone. L'image des épingles web n'a pas de repli si le fichier manque.
- Sur le web, l'en-tête `no-store` bloque l'appel Panoramax par CORS (sans effet sur Android).
- Carte web sans réseau dans Chrome sans fenêtre : épingles, position et gestes non testables au navigateur.
- Spec 016 (rien dans les sauvegardes) : à vérifier sur la première APK `preview` (manifeste, `dataExtractionRules`, `allowBackup="false"`, `aapt dump permissions`, App Links vérifiés).

## En attente côté humain

- Ali : build (dev ou `preview`), puis la liste « À voir sur le téléphone » de la spec 037 ; ancien APK de dev `org.gpssanstexte.app.dev` à désinstaller.
- Ali : retours du terrain restants (icônes à l'ajout d'un lieu, recherche Photon lente : combien de secondes ?), captures promises.

Historique détaillé : docs/historique.md
