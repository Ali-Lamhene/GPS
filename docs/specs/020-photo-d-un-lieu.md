# 020 — Photo d'un lieu

- **Statut** : validé (autonomie donnée le 2026-11-04)
- **Date** : 2026-11-04
- **Persona** : voyageur et accompagnant (E29)
- **Réalise** : spec 001 B.5 (photo d'un lieu)

## Parcours

1. E29 s'ouvre sur l'appareil photo de l'app (plein écran sombre, cadre blanc). La première fois, Android demande la permission (en texte, en général lue par l'accompagnant).
2. Le déclencheur prend la photo ; le bouton galerie ouvre le sélecteur de photos du système ; « sans photo » enregistre le lieu sans photo.
3. La photo est réencodée (1080 px de large, JPEG), ce qui efface ses métadonnées, dont la position, puis gardée dans le stockage privé de l'app ; le lieu est enregistré avec elle (spec 015) et la montre sur l'accueil.
4. Sélecteur fermé sans photo, ou photo illisible : on reste sur E29.
5. Appareil photo refusé : déclencheur grisé ; galerie et « sans photo » marchent.

## Données et confidentialité

- Appareil photo **de l'app** (`expo-camera`), jamais l'app photo du téléphone : aucune copie dans la galerie ni dans Google Photos.
- Galerie : sélecteur du système, sans permission de lecture des médias.
- Photo gardée dans `Documents/photos/` (privé, exclu des sauvegardes, spec 016) ; les copies laissées dans le cache par l'appareil photo, le sélecteur et le réencodage sont effacées.
- Le fichier des lieux ne garde que l'adresse locale de la photo, validée à la lecture (seulement un JPEG du dossier `photos` de l'app).
- La photo ne quitte jamais le téléphone : elle n'est pas dans le lien de partage.

## Ajustements après la relecture `security-reviewer` (2026-11-04)

- Le fichier des lieux ne garde que le **nom** de la photo ; son adresse est reconstruite sur le téléphone (elle change sur iPhone à chaque mise à jour). Seul un nom de photo de l'app est accepté.
- Une photo dont le lieu n'a pas pu être enregistré est effacée aussitôt ; au lancement, les photos qu'aucun lieu n'utilise sont effacées.
- Les copies du cache (appareil photo, sélecteur, réencodage) sont vidées à l'ouverture et à la fermeture de E29 : l'original du sélecteur garde souvent sa position.
- `deletePhoto` refuse toute adresse hors du dossier des photos de l'app.
- **Prochaine build** : `expo-camera` sans les scanners ML Kit de Google (qui envoient des données d'usage), par l'option `barcodeScannerEnabled: false` et le plugin `plugins/with-no-camera-scanners.js` ; plus de texte de permission « photos » sur iPhone (le sélecteur n'en demande pas).

## À trancher

- Photos des lieux cachés de la carte (domicile, famille) : plus parlantes que des coordonnées en cas de fouille. Les déconseiller, ou ne pas les proposer ?

## Hors périmètre

- Recadrage, rotation.
- Suppression de la photo avec le lieu (vient avec la liste de l'accompagnant).

## Critères d'acceptation

- [x] Choisir une photo l'envoie au réencodage puis enregistre le lieu (test) ; fermer le sélecteur garde E29 (test).
- [x] Le fichier des lieux refuse toute photo hors du dossier de l'app (test).
- [ ] Sur téléphone : photo prise, visible sur l'accueil, aucune copie dans la galerie, pas de position dans le fichier (`exiftool`).
