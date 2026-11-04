# 022 — Liste des lieux de l'accompagnant

- **Statut** : validé (autonomie donnée le 2026-11-04)
- **Date** : 2026-11-04
- **Persona** : accompagnant (texte autorisé, D8)
- **Réalise** : spec 001 B.7 et C.5 (supprimer un lieu, partager un lieu existant)

## Parcours

1. Depuis E30 (bouton clavier de l'accueil), « Lieux enregistrés » ouvre la liste des lieux du téléphone, du plus récent au plus ancien : vignette (photo ou pictogramme), nom.
2. « Envoyer » ouvre la feuille de partage avec le lien du lieu (spec 019) ; jamais la photo.
3. « Supprimer » demande confirmation (« Le lieu et sa photo seront effacés de ce téléphone. ») ; le lieu disparaît du fichier, puis sa photo est effacée. Si l'écriture échoue : message, le lieu et sa photo restent.
4. Un lieu supprimé qui était le départ ou l'arrivée du trajet en préparation les vide.

## Données et confidentialité

- La suppression réécrit le fichier des lieux (écriture sûre de la spec 015) et efface la photo du dossier de l'app.
- La copie de secours (`places.json.bak`) est effacée après une suppression ; les images ne sont jamais gardées dans le cache disque d'`expo-image` (vidé une fois au lancement pour les anciennes copies).
- Enregistrements et suppressions passent un par un, chacun depuis la liste la plus récente.
- `/places` ne s'ouvre que depuis E30 (brouillon d'adresse), jamais par un lien.
- Un lien de lieu resté dans la messagerie du voyageur rajoute le lieu s'il est touché : pour faire disparaître un lieu, effacer aussi le message.
- **Prochaine build** : un lien déjà reçu, renvoyé par Android quand l'app est rouverte depuis les apps récentes ou que l'activité est recréée (taille du texte, langue), n'est plus relu (`plugins/with-no-link-from-history.js`) : un lieu supprimé ne revient pas tout seul.

## À trancher

- `places.unreadable.json` (fichier d'une version plus récente, mis de côté) peut garder un lieu supprimé depuis : l'emporter avec l'effacement rapide ?
- La liste montre les photos des lieux cachés de la carte (domicile, famille) : bloquer les captures d'écran de cet écran (`FLAG_SECURE`), ou montrer le pictogramme ?

## Hors périmètre

- Modifier un lieu (position, pictogramme, photo) : le supprimer puis le recréer.
- Effacement rapide de tous les lieux en cas de fouille.

## Critères d'acceptation

- [x] Envoyer, supprimer avec confirmation, échec d'écriture (tests).
- [x] Le plugin efface le lien relu depuis les apps récentes (test).
- [ ] Sur le téléphone : ouvrir l'app par un lien, supprimer le lieu, puis rouvrir depuis les apps récentes et changer la taille du texte : il ne revient pas.
