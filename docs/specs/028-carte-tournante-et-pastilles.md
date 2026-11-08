# 028 — Carte qui tourne à deux doigts, pastilles qui invitent au toucher

- **Statut** : livré
- **Date** : 2026-11-08
- **Persona** : voyageur

## Besoin

Retours de terrain de l'utilisateur (2026-11-05) :

- point 1 : on ne peut pas tourner la carte (rotation à deux doigts) ;
- point 4 : on ne comprend pas assez qu'on peut toucher les pastilles de départ et d'arrivée de l'accueil.

## Parcours

1. Sur toutes les cartes qui bougent (accueil, guidage, récapitulatif), deux doigts **tournent** la carte, en plus de zoomer. Un doigt la déplace, comme avant. L'inclinaison reste bloquée.
2. Après une rotation, la carte revient seule vers le voyageur et son cap au bout du délai habituel, ou tout de suite par le bouton de recentrage (comme pour un déplacement à la main, spec 017). Le cône du voyageur et la flèche du prochain virage suivent la rotation.
3. Accueil : la pastille qui attend un choix garde son halo, et une **main qui tape** (pictogramme `touch_app`, sombre sur un petit disque blanc) se pose sur son coin bas ; elle s'enfonce au début de chaque halo, comme un doigt qui touche. Elle disparaît dès que la pastille est remplie. Mouvement réduit : la main reste immobile.

## Signaux

| Information    | Canaux                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| « Touche ici » | Halo qui grandit (mouvement, couleur), main qui tape (forme, mouvement), anneau émeraude épais (forme) |
| Carte tournée  | Cône et flèche tournés avec la carte ; bouton de recentrage visible                                    |

## Cas limites

| Situation                                            | Comportement attendu                      |
| ---------------------------------------------------- | ----------------------------------------- |
| Carte immobile (fond d'un écran, aperçu)             | Pas de rotation, comme pas de déplacement |
| Écrans après l'accueil (pilule rappel, sans toucher) | Pas de main                               |
| Mouvement réduit dans les réglages                   | Halo pâle immobile, main immobile         |

## Données et confidentialité

Rien de nouveau.

## Hors périmètre

- Boussole de la carte (le nord) : toujours masquée ; le recentrage remet le cap.
- Inclinaison à deux doigts.
- Main sur les autres boutons de l'accueil.

## Critères d'acceptation

- [x] Rotation activée sur la carte du téléphone et sur le web (code ; pas de test automatique possible du geste).
- [x] La main n'apparaît que sur la pastille qui attend un choix, sur l'accueil (vu sur le web, capture).
- [ ] Sur le téléphone : tourner la carte à deux doigts ; le cône suit ; le recentrage remet la carte dans l'axe.
- [ ] Sur le terrain : la main fait-elle comprendre qu'on peut toucher la pastille ?

## Ajustements après la relecture `ux-sans-texte-reviewer` (2026-11-08)

- Main rentrée sur le disque (décalage de 10 % au lieu de 30 %) : on tape souvent là où on voit la main, et seul le disque répond.
- Main toujours à droite du disque, même en lecture de droite à gauche (pilule jamais miroir, spec 006).
- Pendant une rotation, les marqueurs ne sont retournés que tous les 5° (téléphones d'entrée de gamme).
- Choix assumé : la main désigne la pastille, parce que le retour de terrain portait sur elle ; les tuiles du bas restent le raccourci. À observer : quel chemin les voyageurs prennent, et si un pincement pour zoomer fait tourner la carte sans le vouloir.

## Hypothèses

- La main qui pointe (`touch_app`) est comprise partout comme « toucher l'écran » ; le doigt tendu est un geste d'écran tactile plus qu'un geste de la main dans la culture.
- La rotation ne gêne pas un pouce stressé : le geste demande deux doigts, comme le zoom déjà en place.
