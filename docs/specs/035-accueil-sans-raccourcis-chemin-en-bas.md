# 035 — Accueil sans raccourcis : le chemin en bas, « + » plus grand

- **Statut** : livré en autonomie (brief du 2026-11-17, fiche 1/6 validée par l'utilisateur) ; à voir sur le téléphone
- **Date** : 2026-11-17
- **Persona** : voyageur
- **Révise** : spec 005 (carrousel de raccourcis), 007 (carrousel, chemin en haut), 008 (carrousel), 009 (panneau de tuiles, ✕ et ✓ dans le panneau), 011 et 012 (tuiles du panneau), 013 (taille du « + »), 015 (tuile « + » seule dans le panneau)

## Besoin

L'encart de raccourcis de lieux (le carrousel de tuiles en bas de l'accueil) perturbe la compréhension de l'interface par le voyageur : deux façons de choisir le même lieu, au même endroit, avec le chemin tout en haut. On le retire et on réorganise l'accueil : le voyageur choisit **sur la carte** ou **par les pastilles du chemin**, et rien d'autre.

## Parcours

1. L'accueil montre la carte plein écran, sans bandeau en haut. Le **chemin** (départ ····· arrivée, pastilles de 56 dp) est en bas, dans une carte blanche flottante. Il n'y a plus de tuiles.
2. Le voyageur choisit son trajet :
   - **par la carte** : il touche une épingle ; le lieu remplit le bout qui appelle (le départ d'abord, puis l'arrivée). **Tant que le départ appelle, son propre point de position est aussi touchable** (une petite main blanche dessus, comme sur la pastille, spec 028) : il choisit « ici » comme départ (décision d'Ali, 2026-11-17) ;
   - **par les pastilles** : il touche la pastille de départ ou d'arrivée ; la **feuille des lieux** s'ouvre (liste pour choisir), avec « ici » en premier pour le départ ; un lieu touché remplit ce bout.
     Les deux façons se mélangent.
3. Le bout qui appelle garde son halo émeraude et sa main qui tape (spec 028), maintenant en bas de l'écran, à portée de pouce.
4. Une fois les deux bouts choisis, une rangée apparaît **au-dessus du chemin**, qui ne bouge pas : **✕** (rond blanc, annuler l'arrivée) à gauche, **✓** (pilule émeraude pleine, continuer vers le choix du transport) à droite. Toucher une pastille permet toujours de changer un bout.
5. Le bouton **« + »** passe de 48 à **64 dp** (toujours émeraude plein, bas à droite au-dessus du chemin). Le bouton de l'accompagnant (36 dp) et le recentrage (40 dp) gardent leur taille et leur axe (spec 013). **Une fois les deux bouts choisis, « + » et le bouton de l'accompagnant disparaissent** (il ne reste qu'une décision, ✓, et un pouce qui la vise ne doit pas ouvrir « nouveau lieu ici ») ; le recentrage reste, juste au-dessus du chemin et de la rangée ✕ ✓.
   5 bis. Toucher l'épingle de **l'autre bout** ne fait rien et ne joue aucun son (comme la feuille, qui grise le lieu de l'autre bout) : ni arrivée vidée par mégarde, ni faux signal de réussite.
6. Le crédit ⓘ reste en bas à gauche, au-dessus du chemin ; le nuage barré (hors connexion) passe juste sous le haut de l'écran, le chemin n'y étant plus.

## Pourquoi cet emplacement

- Le chemin reste **fixe** en bas : le pouce qui vient de toucher une pastille n'a pas à chercher, et la rangée ✕ ✓ apparaît au-dessus sans le déplacer.
- ✓ est la seule action « continuer » : grande pilule émeraude, dans la zone du pouce, au même endroit qu'aujourd'hui (bas de l'écran), au lieu d'un panneau qui change de contenu sous le doigt.
- Le style est celui de la maquette émeraude (D15) : blanc chaud, émeraude, pictogrammes au trait, grandes pilules. La maquette montre encore les tuiles ; elles sont retirées.

## Signaux

Inchangés (specs 009, 011, 028) : bout à remplir par halo, main et contour épais ; lieu choisi par photo ou pictogramme dans la pastille avec son badge épingle / drapeau ; son « select » au choix. Continuer et annuler : ✓ émeraude, ✕ blanc (forme et couleur).

## Cas limites

| Situation                                     | Comportement attendu                                                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aucun lieu enregistré (premier lancement)     | épingles absentes ; le départ appelle ; la feuille propose « ici » ; pour l'arrivée, la feuille ne propose que la tuile « + » en pointillés (spec 015), et le « + » est là |
| Lieu caché de la carte (maison, famille)      | pas d'épingle ; atteignable par la pastille et la feuille des lieux (la règle `hiddenOnMap` est revue par une autre fiche)                                                 |
| Position inconnue (pas de point sur la carte) | « ici » grisé dans la feuille, un toucher la redemande (spec 017) ; « + » grisé                                                                                            |
| Les deux bouts choisis, toucher une épingle   | l'arrivée est remplacée (comportement inchangé)                                                                                                                            |
| Petit écran (320 × 640)                       | chemin (≈ 72 dp) + rangée ✕ ✓ (56 dp) en bas : la carte garde plus de la moitié de l'écran ; la colonne de droite reste au-dessus sans toucher la rangée                   |
| Lecture de droite à gauche                    | chemin jamais inversé, comme la carte (spec 006)                                                                                                                           |
| Android : bouton retour                       | ferme la feuille des lieux (inchangé)                                                                                                                                      |

## Données et confidentialité

Aucun changement : aucune donnée, dépendance, permission ni appel réseau. Ce qui est affiché ne change pas, seulement la façon de choisir.

## Hors périmètre

- La règle `hiddenOnMap` et les épingles des lieux cachés (fiche 2).
- La photo des lieux (fiches 3 à 5).

## Critères d'acceptation

- [x] Plus aucune tuile de raccourci à l'accueil ; plus de code mort (panneau, tuiles).
- [x] Un trajet complet (départ, arrivée, ✓) se fait par la carte seule (épingles), et par les pastilles seules (tests).
- [x] Le chemin est en bas ; ✕ et ✓ apparaissent au-dessus, sans déplacer le chemin.
- [x] « + » de 64 dp ; la colonne n'est là que tant qu'un bout appelle, donc jamais à côté de ✓.
- [x] La carte se cadre au-dessus du chemin (et de la rangée ✕ ✓ quand elle est là).
- [x] Le point de position est touchable tant que le départ appelle, et choisit « ici » (tests, carte web et téléphone).
- [ ] Vérifié à l'écran. **Fait en partie (2026-11-17)** : navigateur à 390 et 320 dp, accueil vide : chemin en bas, « + » (64 dp, grisé sans position) et bouton accompagnant au-dessus, aucune tuile, main sur le départ : conforme. **Reste à voir** : épingles, point de position touchable, rangée ✕ ✓ (carte web sans tuiles en Chrome sans fenêtre, pas de position) ; téléphone (aucune build de dev installée). Relu par `ux-sans-texte-reviewer` (sur le code).

## Hypothèses (mode autonome)

- ✕ et ✓ sont **au-dessus** du chemin, pas autour (quatre éléments ronds sur 320 dp ne laisseraient que des points trop courts entre les pastilles).
- La pastille garde 56 dp ; la maquette ne dit rien d'autre.
- ✕ garde sa place à gauche de la paire (spec 023), au-dessus de la pastille de départ, alors qu'il annule l'arrivée. Relecture UX : un non-lecteur peut lire « ✕ sur le départ ». Gardé pour que la paire s'apprenne une fois ; à tester sur le terrain.
- « + » à 64 dp, émeraude plein : écart à D15 (voir D20), **confirmé par Ali le 2026-11-17** (option A) ; la relecture UX craint qu'il éclipse la pastille qui appelle. À juger sur le terrain.
- Quand la rangée ✕ ✓ apparaît, la colonne de droite et ⓘ sautent de la hauteur de la rangée (≈ 68 dp), sans animation. À observer.
- Sans tuile, le premier lancement n'a pas de « + » pointillé dans l'accueil : le « + » rond, plus grand, et la main sur le départ suffisent. À observer sur le terrain.
