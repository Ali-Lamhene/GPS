# 034 — Le bouton d'aide pulse quand le voyageur reste perdu

- **Statut** : livré (suggestion du 2026-11-10 retenue par l'utilisateur le 2026-11-12 ; détails tranchés en autonomie, listés dans « Hypothèses »)
- **Date** : 2026-11-12
- **Persona** : voyageur

## Besoin

Spec 032 : hors du chemin, l'alerte part tout de suite, puis revient toutes les 30 s ; un nouveau trajet est calculé quand le voyageur a fait 30 m. Un voyageur **arrêté** (il ne sait plus où aller, ou pas de réseau pour un nouveau trajet) entend l'alerte sans savoir quoi faire. L'aide (carte à montrer à un passant) est la réponse : il faut l'y amener.

## Parcours

1. Le voyageur est hors du chemin : consigne orange et alerte (specs 031, 032), rien ne change.
2. 30 s plus tard, 1er rappel de l'alerte : rien ne change.
3. 60 s après l'alerte, 2e rappel, toujours perdu : le bouton d'aide, en haut à droite, prend une bordure orange épaisse et fixe, et un anneau orange pulse autour (plus serré que celui de la consigne, pour rester dans l'écran). En même temps, les anneaux de la consigne s'arrêtent : elle reste orange mais immobile. Une seule chose bouge à l'écran : l'aide.
4. Il reste ainsi tant que le voyageur est perdu. Tout s'arrête dès qu'il retrouve le chemin, qu'un nouveau trajet arrive, que la position se perd ou que l'étape n'est plus à pied.
5. Aide ouverte pendant qu'il est perdu : les rappels de l'alerte attendent (pas de son ni de vibration pendant qu'un passant lit la carte). Au retour sur le guidage, ils reprennent au rythme de 30 s, sans alerte immédiate.

## Signaux

| Information           | Canaux                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| « Demande de l'aide » | Bordure orange fixe et épaisse (forme, couleur) et anneau qui pulse (mouvement) autour de l'aide, seule chose qui bouge ; le son et la vibration de l'alerte, toutes les 30 s |

## Cas limites

| Situation                                                                    | Comportement attendu                                        |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Retour sur le chemin, nouveau trajet                                         | L'anneau disparaît ; un nouvel écart repart de zéro         |
| Calcul d'un nouveau trajet en cours                                          | L'anneau reste (le voyageur est toujours perdu)             |
| Plus de position (métro, tunnel)                                             | L'anneau disparaît, comme l'orange                          |
| « Réduire les animations » actif (souvent mis par l'économiseur de batterie) | Les anneaux restent fixes et visibles, partout dans l'app   |
| Aide ouverte                                                                 | Rappels en pause ; reprise au retour, sans alerte immédiate |

## Données et confidentialité

Rien de nouveau : aucune donnée, aucun réseau, aucune dépendance.

## Hors périmètre

- Ouvrir l'aide toute seule.
- Un son ou une vibration propres à l'aide.

## Critères d'acceptation

- [x] Perdu au 2e rappel (60 s) : l'aide pulse ; avant, non ; plus perdu, non (tests).
- [ ] Sur le terrain : un voyageur arrêté touche-t-il l'aide quand elle pulse ?

## Hypothèses

- Le 2e rappel (60 s) plutôt que le 1er : laisser au voyageur le temps de faire demi-tour seul.
- Anneau orange (couleur de l'alerte) plutôt qu'émeraude : il dit « problème, l'aide est là ».
- Relecture UX (2026-11-12) : bordure fixe en plus du mouvement, anneaux de la consigne arrêtés, rappels en pause pendant l'aide, anneaux fixes si les animations sont réduites.
- Pas de son ni de vibration propres à l'aide : à rouvrir si le terrain montre qu'un voyageur au téléphone en poche n'y va pas.
