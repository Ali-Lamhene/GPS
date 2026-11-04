# 016 — Lieux hors de toute sauvegarde et de tout transfert

- **Statut** : validé
- **Date** : 2026-11-04
- **Persona** : voyageur (aucun changement visible)
- **Révise** : spec 015 (le transfert direct Android, d'abord accepté, est coupé)

## Besoin

D1 : les lieux du voyageur ne doivent exister que sur son téléphone. La spec 015 les garde dans le stockage privé de l'app, mais deux copies restent possibles :

1. **iPhone** : le dossier Documents de l'app part dans la sauvegarde iCloud (active par défaut) et dans les sauvegardes faites sur un ordinateur. Quiconque obtient le compte Apple du voyageur, ou Apple sur réquisition, lirait ses lieux.
2. **Android 12 et plus** : `allowBackup: false` coupe la sauvegarde Google, mais pas le transfert direct vers un nouveau téléphone (câble ou sans fil). Quelqu'un qui tient le téléphone déverrouillé peut copier les lieux sur un autre appareil.

L'utilisateur décide (2026-11-04) : rien de l'app ne part dans une sauvegarde ni dans un transfert, sur les deux systèmes.

## Parcours

Aucun changement visible. Conséquence acceptée : un voyageur qui change de téléphone repart sans lieux ; l'accompagnant les renvoie par lien (spec du lien de partage).

## Données et confidentialité

- **iPhone** : les dossiers Documents (lieux, photos à venir) et Application Support (cache de tuiles de la carte, qui dit la zone regardée) sont marqués « exclus de la sauvegarde » (`isExcludedFromBackup`) à chaque lancement, par le module lui-même, et encore avant chaque enregistrement. Caches et tmp ne sont jamais sauvegardés par iOS. Module natif local, sans dépendance ni réseau (`modules/backup-exclusion`). Les préférences (`Library/Preferences`) ne peuvent pas être exclues ; l'app n'y écrit rien de sensible.
- **Android** : règles d'extraction (`dataExtractionRules`) qui excluent tous les fichiers de l'app (y compris les domaines protégés par l'appareil, `device_*`) de la sauvegarde en ligne et du transfert direct, ajoutées par un config plugin local (`plugins/with-no-data-extraction.js`). `allowBackup: false` reste en place pour Android 11 et moins.
- Aucune permission, aucune dépendance nouvelle, aucun appel réseau.
- Nécessite une nouvelle build : sans elle, rien ne change sur le téléphone (le code JS ne fait rien si le module natif manque).

## Ajustements après la relecture `security-reviewer` (2026-11-04)

- iPhone : Application Support exclu aussi (cache de tuiles MapLibre), exclusion faite au lancement par le module natif, sans dépendre du code JS.
- Android : domaines `device_*` exclus ; un test vérifie le fichier de règles et l'attribut du manifeste.
- `securite.md` §4 et la spec 015 renvoient à cette spec.
- À vérifier avant de cibler Android 16 : le transfert d'Android vers iPhone (`<cross-platform-transfer>`) ne doit pas inclure l'app.

## Hors périmètre

- Effacement rapide des lieux en cas de fouille (spec dédiée).
- Restauration des lieux sur un nouveau téléphone.

## Critères d'acceptation

- [ ] Android : le manifeste généré porte `android:dataExtractionRules` vers des règles qui excluent les domaines `root`, `file`, `database`, `sharedpref`, `external` et `device_*` de `cloud-backup` et `device-transfer` (vérifié avec `npx expo config --type introspect`, puis dans l'APK).
- [ ] iPhone (première build iOS) : sauvegarde chiffrée sur ordinateur, contenu listé (`idevicebackup2` ou équivalent) : aucun `places.json` ; transfert « Démarrage rapide » d'iPhone à iPhone : aucun lieu.
- [ ] Sans le module natif (build actuelle), l'app marche comme avant.
- [ ] Relu par `security-reviewer`.

## Hypothèses

- `expo-file-system` range `Paths.document` dans le dossier `files` d'Android (domaine `file`) ; les autres domaines sont exclus aussi, par prudence.
- Marquer le dossier entier suffit sur iPhone : l'attribut couvre son contenu.

## Questions / réponses

- Exclure des sauvegardes iPhone : oui, dès maintenant.
- Couper le transfert direct Android : oui (révise la spec 015).
