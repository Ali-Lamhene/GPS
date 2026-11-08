# 031 — Hors du chemin : le signaler, puis recalculer le trajet

- **Statut** : livré
- **Date** : 2026-11-08
- **Persona** : voyageur

## Besoin

Retours de terrain de l'utilisateur :

- point 13 (2026-11-08) : quand le voyageur se trompe de chemin, rien ne l'indique ;
- point 15 : au-delà d'un certain écart, **recalculer un nouveau trajet, le plus court, comme Google** (décidé par l'utilisateur) ;
- relecture UX du correctif du point 9 : rien ne montre que la position est perdue ni que la consigne devient touchable.

## Parcours

1. À pied, chaque nouvelle position est comparée au chemin en cours (et à l'étape suivante). Plus loin que **40 m** sur au moins **3 positions de suite pendant 10 s** : le voyageur est hors du chemin. Un écart bref (GPS qui saute dans une rue étroite) ne déclenche rien.
2. Hors du chemin : la consigne passe dans un **cadre orange**, l'ancienne consigne reste visible et une **épingle barrée** (dans un disque blanc à anneau orange qui pulse) s'ajoute à côté, plus le **son et la vibration d'alerte**, rejoués toutes les 30 s tant qu'il est perdu sans nouveau trajet.
3. Tout de suite, l'app demande (l'épingle barrée devient deux **flèches qui tournent** pendant le calcul) à Transitous un **nouveau trajet, par le même mode, depuis la position actuelle jusqu'au même lieu** (le plus court qu'il propose). Reçu : le guidage repart de la première étape du nouveau trajet, la consigne redevient verte avec le signal de la nouvelle étape.
4. Pas de nouveau trajet (pas de réseau, service en panne) : la consigne reste orange ; l'aide reste en haut à droite. De retour sur l'ancien chemin (à moins de **25 m**, sur 2 positions de suite, pour ne pas clignoter autour de 40 m), la consigne redevient verte d'elle-même ; un calcul en cours est alors abandonné.
5. Au plus un recalcul toutes les 30 s, et 6 par trajet, limite tenue par le calcul des trajets lui-même (elle survit au retour sur l'écran de guidage, pas à l'arrêt de l'app).
6. Position perdue (métro, tunnel) ou étape qui n'est pas à pied : l'orange s'efface.
7. Sans position récente (aucun point depuis 30 s : métro, tunnel), la consigne porte la **main qui touche** (30 dp, dans le cadre, comme les pastilles de l'accueil, spec 028) : la toucher fait avancer l'étape (spec 021).

## Signaux

| Information              | Canaux                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Hors du chemin           | Cadre orange, épingle barrée (forme), anneau qui pulse (mouvement), son et vibration d'alerte, répétés toutes les 30 s |
| Nouveau trajet en calcul | Flèches qui tournent à la place de l'épingle barrée                                                                    |
| Nouveau trajet           | Consigne verte et nouvelle flèche, son et vibration de l'étape, tracé neuf sur la carte                                |
| La consigne se touche    | Main qui touche (forme), sur la consigne                                                                               |

## Cas limites

| Situation                                      | Comportement attendu                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Dans un bus ou un métro                        | Jamais « hors du chemin » (le véhicule suit sa ligne)                   |
| Près de l'étape suivante (sortie d'un arrêt)   | Compté sur le chemin                                                    |
| Pas de réseau au moment du recalcul            | Orange et aide ; nouvel essai 30 s plus tard si toujours hors du chemin |
| Position trop ancienne                         | Pas de détection (rien à comparer) ; main sur la consigne               |
| Recalcul en transport : un autre bus que prévu | Accepté : c'est le plus court depuis ici                                |

## Données et confidentialité

- **Transitous** (D17) reçoit à chaque recalcul : la **position actuelle** du voyageur (4 décimales, environ 10 m), le lieu d'arrivée, l'heure et l'IP. C'est plus qu'avant : la position en cours de route, au moment où il s'est perdu (avant, seul le départ choisi partait). 6 fois au plus par trajet. **Les requêtes d'un même trajet sont reliables entre elles** (même IP, même en-tête, même arrivée) : Transitous, ou qui lit ses journaux, peut reconstituer une trace partielle et datée du déplacement (départ, jusqu'à 6 positions, arrivée).
- Rien n'est stocké. Aucune nouvelle dépendance ni permission.

## Ajustements après les relectures (2026-11-08)

`ux-sans-texte-reviewer` : l'orange s'efface quand la position se perd ou que l'étape n'est plus à pied ; l'ancienne consigne (flèche, ligne, arrêts) reste dans le cadre orange, l'épingle barrée s'ajoute ; retour sur le chemin à 25 m sur 2 positions (pas de clignotement) ; alerte répétée toutes les 30 s ; signe d'attente pendant le calcul ; main dans le cadre et plus grande.

`security-reviewer` : limite de 6 recalculs et de 30 s tenue par le fournisseur des trajets (plus par l'écran) ; requête coupée quand l'écran part ou que le voyageur revient sur le chemin ; trace reliable écrite ci-dessus.

## À trancher (utilisateur)

- ~~Positions envoyées en cours de route~~ : **accepté tel quel** par l'utilisateur le 2026-11-08 (aucun compte, pas de lien direct vers une personne ; noté dans D17).
- ~~Recalcul vers un lieu caché~~ : **on recalcule quand même** (utilisateur, 2026-11-08 ; menace précisée dans D1).

## Hors périmètre

- Proposer de revenir sur l'ancien chemin plutôt que recalculer (choix de l'utilisateur : comme Google).
- « Mauvais sens » détecté par la boussole avant de s'écarter (cône).
- Détection dans le métro (comptage des arrêts, à venir).
- GPS présent mais faux qui « colle » au chemin : non détectable ici.

## Critères d'acceptation

- [x] Hors du chemin seulement après 10 s et 3 positions à plus de 40 m ; un écart bref ne déclenche rien (tests).
- [x] Alerte, puis nouveau trajet depuis la position ; échec : reste orange (tests).
- [x] Main sur la consigne sans position récente, pas avec (tests).
- [ ] Sur le terrain : prendre volontairement une autre rue ; la consigne passe à l'orange en une dizaine de secondes, puis un nouveau trajet s'affiche.
- [ ] Sur le terrain : l'orange et l'épingle barrée sont-ils compris comme « tu t'es trompé » ?

## Hypothèses

- 40 m et 10 s : assez pour ignorer les sauts du GPS en ville, assez court pour prévenir avant le carrefour suivant. À ajuster après les essais.
- Le premier itinéraire de Transitous est le plus court (même règle que la spec 021).
