# 006 — Sens de lecture : rien qui ne se lise que de gauche à droite

- **Statut** : validé
- **Date** : 2026-11-01
- **Persona** : voyageur

## Besoin

Les voyageurs ne lisent pas tous dans le même sens : l'arabe, le persan et le pachto se lisent de droite à gauche. Même sans savoir lire, une personne habituée à ce sens peut comprendre une suite horizontale à l'envers : croire qu'elle arrive alors qu'elle part, ou qu'une flèche vers la droite veut dire « revenir ».

La relecture de la spec 005 a relevé quatre endroits où l'interface compte encore sur un ordre de gauche à droite. La règle retenue pour l'accueil (spec 005) s'applique partout : **les deux bouts d'un trajet se reconnaissent à leur symbole** (point de départ, drapeau d'arrivée), pas à leur place ; **pas de flèche** pour dire « vers » ; une ligne horizontale n'est **jamais inversée**, comme la carte.

## Parcours

1. **Rappel du trajet** en haut du choix du transport (E06) et du récapitulatif (E07) : la flèche disparaît. On voit la pastille du départ, des pointillés, puis la pastille de l'arrivée avec un drapeau en coin, comme dans le panneau de l'accueil. Pas de marcheur au milieu : en E06, le mode n'est pas encore choisi.
2. **Barre de progression du guidage** : elle garde sa forme, jamais inversée. Son bout de départ porte le symbole du départ (point), son bout d'arrivée le pictogramme du lieu avec un drapeau en coin. La partie déjà faite devient grise, la partie restante garde ses couleurs (pointillés bleus à pied, couleur de la ligne en transport).
3. **Bandeau de consigne** : le pictogramme « ensuite » reste à sa place mais devient plus petit et plus pâle. L'ordre se lit par la taille (grand = maintenant, petit et pâle = après), pas par la position.
4. **Étapes du récapitulatif (E07)** : la flèche `>` qui ouvre une étape devient une flèche vers le bas (et vers le haut une fois ouverte), comme une liste qui se déplie.

## Signaux

| Information             | Canaux                                                             |
| ----------------------- | ------------------------------------------------------------------ |
| Quel bout est le départ | symbole du départ (point) + place dans le chemin                   |
| Quel bout est l'arrivée | drapeau en coin + pictogramme ou photo du lieu + anneau bleu       |
| Ce qui est déjà fait    | partie grise de la barre + position du point bleu                  |
| Ce qu'il faut faire     | grand pictogramme vif du bandeau + couleur du bandeau + voix / son |
| Ce qui vient après      | petit pictogramme pâle du bandeau                                  |
| Une étape s'ouvre       | flèche vers le bas qui devient vers le haut + fond bleu pâle       |

## Cas limites

| Situation                                                | Comportement attendu                                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Téléphone réglé en arabe ou en persan (mise en page RTL) | rappel du trajet et barre de progression gardent départ à gauche, arrivée à droite, comme la carte |
| Départ = position actuelle                               | pastille de départ = point bleu « ici », comme à l'accueil                                         |
| Pas d'étape suivante (dernière consigne)                 | pas de petit pictogramme, comme aujourd'hui                                                        |
| Écran étroit (320 dp)                                    | le rappel du trajet tient dans l'en-tête sans toucher le bouton d'aide                             |

## Données et confidentialité

Aucun changement : pas de donnée, pas de dépendance, pas de permission.

## Hors périmètre

- Le texte des noms de station et de ligne (exception D9) : il se lit comme le panneau auquel il est comparé.
- La flèche devant le nom de la direction d'une ligne, dans le bandeau « attendre le bus / métro » : gardée, voir hypothèses.
- La carte elle-même (jamais inversée, déjà le cas).

## Critères d'acceptation

- [ ] Plus aucune icône `arrow_forward` ni `chevron_right` dans les écrans du voyageur, sauf la flèche de direction de ligne.
- [ ] E06 et E07 : rappel du trajet départ ··· arrivée, drapeau sur l'arrivée, sans flèche ni marcheur.
- [ ] Guidage : la barre a un symbole de départ et un drapeau d'arrivée ; la partie faite est grise.
- [ ] Bandeau : le pictogramme « ensuite » est nettement plus petit et plus pâle que le principal.
- [ ] Récapitulatif : flèche vers le bas sur une étape fermée, vers le haut sur une étape ouverte.
- [ ] Testé dans le navigateur à 360 × 740 et 320 × 640, aussi avec une mise en page RTL forcée : rien ne s'inverse.

## Hypothèses

- La flèche devant le nom de direction d'une ligne reste : le nom est en écriture latine (D9), lu de gauche à droite comme sur le panneau du quai, et la flèche le désigne.
- Sur la barre de progression, le symbole de départ est le même point que la pastille « ici » de l'accueil, en petit.
- « Plus pâle » = opacité d'environ 70 % sur le fond du bandeau ; à confirmer au soleil.
- La flèche vers le bas des étapes n'a pas été demandée explicitement : c'est l'usage courant d'une liste qui se déplie.

## Questions / réponses

- Rappel du trajet (E06, E07) ? → Pointillés entre les deux pastilles, drapeau sur l'arrivée, sans marcheur.
- Barre de progression ? → Gardée, bouts marqués par leur symbole, partie faite en gris, jamais inversée.
- « Ensuite » dans le bandeau ? → Reste à sa place, l'ordre se lit par la taille et la pâleur.
