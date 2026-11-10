# 032 — Hors du chemin : alerter tout de suite, recalculer après 30 m

- **Statut** : livré
- **Date** : 2026-11-10
- **Persona** : voyageur
- **Révise** : spec 031 (seuils de détection, moment du recalcul)

## Besoin

Retour de terrain de l'utilisateur (2026-11-10, point 1) : quand le voyageur se trompe de chemin, l'alerte arrive trop tard, puis le nouveau trajet est calculé dans la même seconde. Le voyageur n'a pas le temps de comprendre l'erreur ni de revenir de lui-même.

Comportement voulu : l'erreur est signalée tout de suite ; le nouveau trajet n'est calculé que si le voyageur continue de s'éloigner, 30 m après l'alerte.

## Parcours

1. À pied, chaque nouvelle position est comparée au chemin en cours (et à l'étape suivante), comme dans la spec 031. Plus loin que **15 m** sur **2 positions de suite**, sans durée minimale : le voyageur est hors du chemin (avant : 40 m, 3 positions, 10 s).
2. Alerte, identique à la spec 031 : cadre orange, ancienne consigne visible, épingle barrée dans un disque blanc à anneau orange qui pulse, son et vibration d'alerte, rejoués toutes les 30 s tant qu'il est perdu sans nouveau trajet. L'app retient l'**endroit de l'alerte** (la position qui l'a déclenchée).
3. **Pas de recalcul tout de suite.** Le recalcul part quand le voyageur est à plus de **30 m à vol d'oiseau de l'endroit de l'alerte**, toujours hors du chemin. Le reste est inchangé : flèches qui tournent pendant le calcul, guidage qui repart de la première étape du nouveau trajet, consigne verte.
4. Retour sur le chemin avant ces 30 m : à moins de **10 m** du chemin, sur 2 positions de suite (avant : 25 m), la consigne redevient verte, aucun recalcul. Un calcul en cours est abandonné, comme avant.
5. Recalcul raté (pas de réseau, service en panne) : orange et aide, nouvel essai toutes les 30 s tant qu'il est hors du chemin et à plus de 30 m de l'endroit de l'alerte. Au plus 6 recalculs par trajet (inchangé, tenu par le calcul des trajets).
6. Après un nouveau trajet, une nouvelle erreur repart de l'étape 1 : nouvelle alerte, nouvel endroit d'alerte.

## Signaux

Inchangés (spec 031).

| Information              | Canaux                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Hors du chemin           | Cadre orange, épingle barrée (forme), anneau qui pulse (mouvement), son et vibration d'alerte, répétés toutes les 30 s |
| Nouveau trajet en calcul | Flèches qui tournent à la place de l'épingle barrée                                                                    |
| Nouveau trajet           | Consigne verte et nouvelle flèche, son et vibration de l'étape, tracé neuf sur la carte                                |

## Cas limites

| Situation                                                  | Comportement attendu                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| GPS qui saute d'une position dans une rue étroite          | Rien : il faut 2 positions de suite à plus de 15 m                                               |
| Voyageur arrêté après l'alerte (il hésite, il regarde)     | Orange et alerte toutes les 30 s ; pas de recalcul tant qu'il ne s'éloigne pas de 30 m ; aide là |
| Il fait demi-tour et revient dans la rue                   | À moins de 10 m sur 2 positions : vert, aucun recalcul                                           |
| Il tourne autour de l'endroit de l'alerte (allers-retours) | Mesure à vol d'oiseau : les allers-retours ne comptent pas                                       |
| Dans un bus ou un métro, position perdue, étape pas à pied | Inchangé (spec 031) : jamais « hors du chemin », l'orange s'efface                               |
| Près de l'étape suivante (sortie d'un arrêt)               | Compté sur le chemin (inchangé)                                                                  |

## Données et confidentialité

Inchangé par rapport à la spec 031 : Transitous reçoit la position actuelle (environ 10 m), l'arrivée, l'heure et l'IP à chaque recalcul, 6 fois au plus par trajet. Le recalcul part plus tard qu'avant, donc jamais plus souvent. L'endroit de l'alerte reste en mémoire seulement, effacé au retour sur le chemin ou au nouveau trajet. Aucune dépendance ni permission nouvelle.

## Ajustements après les relectures (2026-11-10)

`ux-sans-texte-reviewer` (bloquant, déjà présent depuis la spec 031) : chaque nouvelle position coupait la requête de recalcul en cours ; en marchant, sur un réseau lent, le nouveau trajet n'arrivait jamais et chaque essai coupé comptait dans les 6. Une requête en cours n'est plus coupée par une nouvelle position, seulement par le retour sur le chemin, la fin de la marche ou la sortie de l'écran. Les flèches qui tournent n'apparaissent que si une requête part vraiment (pas pour un essai refusé par le rythme de 30 s).

À savoir pour le terrain : l'endroit de l'alerte est la 2e position hors du chemin, déjà à 15-25 m de la rue ; le recalcul part donc vers 45-55 m de l'erreur.

`security-reviewer` : rien de bloquant ; moins d'appels qu'avant, même données.

## Hors périmètre

- Seuils différents selon la précision annoncée par le GPS.
- Ramener vers l'ancien chemin au lieu de recalculer (spec 031).
- Détection du mauvais sens par la boussole.

## Critères d'acceptation

- [x] 2 positions de suite à plus de 15 m : alerte, sans attendre 10 s ; une seule position à plus de 15 m : rien (tests).
- [x] Après l'alerte, aucun recalcul tant que la position est à moins de 30 m à vol d'oiseau de l'endroit de l'alerte ; au-delà, un recalcul (tests).
- [x] Retour à moins de 10 m sur 2 positions : vert, aucun recalcul ; entre 10 et 15 m : reste orange (tests).
- [x] Recalcul raté : nouvel essai 30 s plus tard si toujours au-delà des 30 m (tests).
- [ ] Terrain : se tromper de rue exprès, vérifier que l'alerte arrive dans les premiers mètres et que le nouveau trajet arrive après une trentaine de mètres ; s'arrêter après l'alerte, vérifier qu'aucun nouveau trajet ne part.

## Hypothèses

- Le voyageur arrêté hors du chemin à moins de 30 m de l'alerte n'a jamais de nouveau trajet : il garde l'orange, l'alerte répétée et l'aide. Supposé acceptable : le nouveau trajet n'aide que s'il marche.
- 15 m sur 2 positions donnera peu de fausses alertes en ville ; à vérifier sur le terrain (rues étroites, trottoirs d'avenues, gares, places). Piste si elles sont trop nombreuses : seuil selon la précision du GPS.

## Questions / réponses

- Seuil de l'alerte : **15 m, 2 positions de suite, sans attente** (utilisateur, 2026-11-10 ; d'abord 20 m, jugé trop grand ; 12 m écarté : fausses alertes sur les trottoirs, le chemin étant tracé au milieu de la rue).
- « 30 m d'erreur » : **30 m parcourus depuis l'alerte** (utilisateur), mesurés **à vol d'oiseau** depuis l'endroit de l'alerte (utilisateur), pour que les sauts du GPS à l'arrêt ne comptent pas.
- Retour sur le chemin : **10 m, 2 positions de suite** (utilisateur), pour ne pas clignoter autour de 15 m.
