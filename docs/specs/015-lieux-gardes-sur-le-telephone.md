# 015 — Lieux gardés sur le téléphone

- **Statut** : livré
- **Date** : 2026-11-04
- **Persona** : voyageur (accueil, nouveau lieu), accompagnant (adresse)
- **Réalise** : spec 001, partie « stockage » (première étape de l'app fonctionnelle) ; révise l'accueil des specs 011 et 012 quand il n'y a aucun lieu

## Besoin

Aujourd'hui l'accueil montre des lieux de démonstration, et un lieu créé avec « + » ou le clavier disparaît dès que l'app se ferme. Le voyageur doit retrouver ses vrais lieux à chaque ouverture, et seulement les siens. Comme le veut D1, tout reste sur son téléphone : aucun serveur, aucune sauvegarde en ligne.

## Parcours

### Premier lancement

1. Le voyageur n'a aucun lieu. L'accueil montre la carte, sans épingle, avec sa position, la pilule du chemin, la colonne de boutons.
2. Le départ appelle (halo) ; le panneau du bas propose seulement « ici ». Le toucher remplit le départ.
3. L'arrivée appelle ; le panneau du bas montre **une seule tuile « + »**, centrée dans le panneau : contour en pointillés émeraude, pictogramme « + » émeraude, même taille que les autres tuiles. Un toucher ouvre « nouveau lieu ici » (E27), comme le « + » de la colonne.
4. Toucher une pastille du chemin ouvre la feuille des lieux, qui ne contient que « ici » pour le départ et rien pour l'arrivée : la feuille de l'arrivée montre la même tuile « + ».

### Créer un lieu

5. Le parcours ne change pas : « + » (E27 à E29) ou clavier (E30). Au ✓ final, le lieu est **enregistré sur le téléphone**, puis l'accueil revient avec le signal « enregistré » actuel.
6. Le lieu apparaît aussitôt dans les tuiles, la feuille des lieux et, sauf s'il est caché de la carte, en épingle. Ordre des tuiles : celui de la spec 011 (`placeOrder`).
7. Le lieu reste là après fermeture de l'app, redémarrage du téléphone ou mise à jour de l'app.

### À chaque ouverture

8. Les lieux sont lus avant que l'accueil ne s'affiche : l'écran de démarrage reste visible le temps de la lecture, jamais un accueil vide qui se remplit ensuite.
9. Départ et arrivée proposent tous les lieux du voyageur (plus « ici » pour le départ), sans les listes fixes de la démonstration.

### Échec d'enregistrement

10. Si l'enregistrement échoue (téléphone plein, par exemple) : croix rouge animée sur l'accueil, son et vibration d'alerte, puis l'accueil sans le nouveau lieu. Le lieu n'est pas gardé à moitié.

## Signaux

| Information               | Canaux                                                                 |
| ------------------------- | ---------------------------------------------------------------------- |
| Aucun lieu pour l'arrivée | tuile « + » en pointillés émeraude, halo sur la pastille de l'arrivée  |
| Lieu enregistré           | signal « enregistré » actuel (son et vibration), lieu visible aussitôt |
| Enregistrement impossible | croix rouge animée, son d'alerte, vibration d'alerte                   |

## Cas limites

| Situation                                    | Comportement attendu                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Fichier des lieux absent (premier lancement) | accueil vide décrit plus haut                                                                                      |
| Fichier abîmé ou d'une version future        | les lieux illisibles sont ignorés, les autres s'affichent ; le fichier n'est réécrit qu'au prochain enregistrement |
| Pictogramme inconnu dans le fichier          | le lieu prend `push_pin` (règle de la spec 011)                                                                    |
| App fermée pendant l'enregistrement          | l'ancien fichier reste entier (écriture dans un fichier temporaire, puis remplacement)                             |
| Beaucoup de lieux                            | pas de limite ; les tuiles et la feuille défilent                                                                  |
| Le trajet (récapitulatif, guidage)           | reste celui de la démonstration jusqu'à la spec 003, quels que soient les lieux choisis                            |

## Données et confidentialité

- **Stocké** : un fichier dans le stockage privé de l'app (dossier documents), lisible par elle seule. Pour chaque lieu : identifiant aléatoire, pictogramme, coordonnées si connues, nom pour la carte d'aide (`helpName`, tapé par l'accompagnant en E30), « caché de la carte », date de création. Rien d'autre : pas de photo dans cette spec, pas de trajet, pas de position du voyageur.
- **Durée** : jusqu'à la suppression de l'app (modifier et supprimer un lieu viendront avec la liste de l'accompagnant).
- **Rien ne quitte le téléphone** : aucun appel réseau. La sauvegarde Android est déjà coupée (`allowBackup: false`), donc le fichier ne part pas dans la sauvegarde Google.
- **Pas de chiffrement en plus** (décidé le 2026-11-04) : Android chiffre déjà le stockage privé ; un chiffrement de l'app ne protège pas un téléphone fouillé déverrouillé. Le moyen rapide de cacher ou d'effacer les lieux fera l'objet d'une spec dédiée.
- **Logs** : aucune coordonnée ni contenu du fichier dans un message d'erreur.
- **Dépendance** : `expo-file-system`, déjà embarqué par `expo` (aucun nouveau code natif attendu, donc pas de nouvelle build), ajouté en dépendance directe avec `npx expo install`. Aucune permission.

## Hors périmètre

- Modifier, supprimer un lieu (liste de l'accompagnant, spec à venir).
- Photo d'un lieu, recherche d'adresse, lien de partage (specs à venir).
- Garder les trajets (specs 003 et 004).
- Effacement ou masquage rapide en cas de fouille (spec dédiée).
- Chiffrement au repos.

## Critères d'acceptation

- [ ] Premier lancement : aucune épingle, « ici » seul pour le départ, tuile « + » seule pour l'arrivée ; toucher la tuile « + » ouvre E27.
- [ ] Un lieu créé par « + » ou par le clavier est encore là après fermeture et réouverture de l'app (téléphone et navigateur).
- [ ] L'accueil ne s'affiche qu'une fois les lieux lus.
- [ ] Échec d'écriture simulé (test) : croix rouge, signal d'alerte, aucun lieu ajouté, l'ancien fichier intact.
- [ ] Fichier abîmé (test) : les lieux valides s'affichent, l'app ne plante pas.
- [ ] Les lieux de démonstration n'apparaissent plus dans l'app, sauf en développement à la demande.
- [ ] Aucun appel réseau ajouté ; relu par `security-reviewer` et `ux-sans-texte-reviewer`.

## Hypothèses

- Les lieux tiennent dans un seul fichier JSON (quelques dizaines de lieux) : plus simple qu'une base SQLite, qui reste possible plus tard sans changer l'écran.
- Dans le navigateur (développement), le même code garde les lieux dans le stockage du navigateur.
- La démonstration reste disponible en développement par une variable au démarrage du serveur (`EXPO_PUBLIC_DEMO_PLACES=1`), jamais dans une build publiée.
- `expo-file-system` est déjà dans la build de dev installée ; si ce n'est pas le cas, les lieux ne seront gardés sur le téléphone qu'après la prochaine build.

## Ajustements après les relectures (2026-11-04)

`security-reviewer` et `ux-sans-texte-reviewer` :

- Enregistrement sûr : le nouveau texte va dans `places.json.tmp`, l'ancien fichier devient `places.json.bak`, puis le temporaire prend sa place (l'option `overwrite` d'`expo-file-system` efface avant de renommer). À la lecture : le fichier, sinon le temporaire, sinon la copie précédente. Un échec ne laisse pas de copie temporaire.
- Un fichier que cette version ne sait pas lire (version future, abîmé) est mis de côté une fois (`places.unreadable.json`) avant tout enregistrement : les lieux ne sont jamais perdus sans recours.
- Un fichier trop grand pour être relu n'est pas écrit (croix rouge).
- Identifiant de lieu purement aléatoire, sans l'heure de création.
- Double toucher sur E29 : un seul enregistrement ; les boutons s'atténuent et ne répondent plus pendant l'enregistrement.
- La croix rouge, son son et sa vibration arrivent ensemble, une fois l'accueil revenu au premier plan.
- La feuille de l'arrivée montre aussi la tuile « + » quand son seul lieu est déjà le départ.
- Tuile « + » plus visible : fond émeraude pâle, pointillés de 3 dp.

## À trancher

- **iPhone** : le dossier Documents part dans la sauvegarde iCloud et dans les sauvegardes faites sur un ordinateur. Avant toute build iOS, exclure le fichier des lieux de la sauvegarde (petit module natif à nous, `isExcludedFromBackup`). Aucune build iOS ne sort avant.

- Le son d'alerte de l'échec est aussi celui de « descends au prochain arrêt » : à observer en test, un son d'échec distinct sinon.

## Décidé après les relectures

- Android 12 et plus : le transfert direct vers un nouveau téléphone copiait aussi les lieux. D'abord accepté, puis coupé par l'utilisateur le 2026-11-04 : voir la spec 016.
- La tuile « + » seule est centrée dans le panneau (retour sur le téléphone, 2026-11-04).

## À tester sur le terrain

- La tuile en pointillés se lit-elle « ajoute un lieu » ou « case vide » ? Deux « + » de formes différentes troublent-ils ?
- Au premier lancement, le « + » de l'arrivée garde l'endroit où le voyageur se trouve : comprend-il qu'il garde son lieu, pas qu'il dit où il va ?
- La croix rouge seule : le voyageur comprend-il que le lieu est perdu et qu'il faut le refaire ?

## Questions / réponses

- Ordre des étapes fonctionnelles : stockage d'abord, puis lien, adresse, photo, liste.
- Tout sur le téléphone : oui (D1).
- Chiffrement : pas pour l'instant.
- Premier lancement : accueil vide, démonstration réservée au développement.
- Effacement rapide : plus tard, spec dédiée.
- Arrivée sans lieu : tuile « + » dans le panneau.
- Échec d'enregistrement : signal d'erreur, retour à l'accueil sans le lieu.
