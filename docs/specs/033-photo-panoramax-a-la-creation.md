# 033 — Photo Panoramax proposée à la création d'un lieu

- **Statut** : livré (réponses de l’utilisateur du 2026-11-10 ; détails tranchés en autonomie le 2026-11-12, listés dans « Hypothèses » ; à vérifier sur le téléphone)
- **Date** : 2026-11-12
- **Persona** : voyageur, et l'accompagnant qui crée le lieu sur son téléphone

## Besoin

Retour de terrain du 2026-11-10 (point 4) : quand une photo de rue existe pour le lieu qu'on crée, la personne qui le crée doit pouvoir la choisir au lieu d'en prendre une. Utile surtout pour un lieu créé depuis une adresse (E30), loin du lieu : la caméra ne peut pas le photographier.

## Parcours

1. Écran photo E29, que traversent les deux parcours (« ici » E27 et adresse E30). À l'ouverture, si le lieu a un point, l'app cherche sur Panoramax la photo la plus proche, à moins de 50 m, **tournée vers le lieu** (même règle que l'arrivée, spec 030).
2. Pendant la recherche : au-dessus de la galerie, un rond en pointillés blancs, sans fond, avec une roue qui tourne. Il ne prend pas de place dans la barre : rien ne bouge quand il vient ou s'en va.
3. Photo trouvée : à cette place, une vignette ronde de la photo, cadrée sur le lieu, cerclée d'émeraude avec un liseré blanc, un petit pictogramme « paysage » dans un rond émeraude en bas. Elle apparaît en fondu, avec le son doux « select ».
4. Premier toucher sur la vignette : la photo s'affiche en grand dans le cadre, à la place de la caméra ; la vignette grossit un peu ; le déclencheur devient un rond émeraude « ✓ » (garder). Un second toucher sur la vignette, ou le retour, referme l'aperçu.
5. Toucher « ✓ » : une roue tourne dans le rond pendant le travail, puis la photo est gardée comme une photo prise (réencodée, sans métadonnées, dans les documents privés), le son « enregistré » joue, retour à l'accueil.
6. Rien trouvé (aucune photo, pas de réseau, plus de 8 s) : la roue disparaît, pas de vignette. Déclencheur, galerie et « sans photo » marchent comme avant.

## Signaux

| Information                  | Canaux                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------- |
| « Recherche en cours »       | Roue qui tourne (mouvement), rond en pointillés au-dessus de la galerie      |
| « Cette photo existe déjà »  | Image du lieu, cercle émeraude, badge paysage (forme), fondu, son « select » |
| « C'est bien ce bâtiment ? » | Photo en grand dans le cadre, rond « ✓ » émeraude à la place du déclencheur  |
| « Photo gardée, lieu créé »  | Son « enregistré », retour à l'accueil avec la nouvelle tuile                |

## Cas limites

| Situation                                           | Comportement attendu                                                                                                                         |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Lieu caché de la carte (domicile, famille, santé)   | **Recherche faite quand même** (choix de l'utilisateur, révise la spec 030 pour ce seul moment)                                              |
| Lieu sans point                                     | Aucune recherche, pas de vignette                                                                                                            |
| Lieu envoyé à distance par lien (spec 019)          | E29 n'est pas traversé : aucune recherche ; la photo ne voyage jamais dans le lien                                                           |
| Photo prise ou galerie touchée pendant la recherche | La recherche est abandonnée                                                                                                                  |
| Panorama 360°                                       | Gardé recadré : le quart tourné vers le lieu, carré, horizon au milieu ; près de la couture de l'image, le cadre est poussé vers l'intérieur |
| Photo plate                                         | Gardée recadrée en carré autour du lieu                                                                                                      |
| Réencodage impossible                               | Rien n'est gardé, on reste sur E29 (comme une photo ratée)                                                                                   |
| Retour arrière puis retour sur E29                  | Nouvelle recherche                                                                                                                           |

## Données et confidentialité

- **Panoramax** (`api.panoramax.xyz`) reçoit le point du lieu à 4 décimales (environ 10 m) et l'IP, une fois par ouverture de E29 ; les serveurs d'images (IGN et son stockage OVH, OpenStreetMap France) reçoivent l'IP et l'image demandée. Mêmes hôtes et mêmes contrôles que la spec 030 (liste fermée, `no-store`, taille et type bornés).
- Pour un lieu caché de la carte, c'est un écart voulu à la spec 030 (décision de l'utilisateur, 2026-11-10) : Panoramax apprend qu'un point a intéressé quelqu'un, sans savoir que c'est un domicile. À noter dans `securite.md`.
- Photo choisie : réencodée en JPEG sans métadonnées, gardée dans les documents privés hors sauvegarde (specs 016, 020), comme une photo prise. Le fichier temporaire est écrit dans un dossier du cache vidé à l'ouverture et à la fermeture de E29.
- Une fois gardée, la photo du lieu est locale : à l'arrivée, aucune nouvelle demande à Panoramax (spec 030, lieu qui a sa propre photo).
- Licence : seules etalab-2.0, CC-BY-SA 4.0, CC-BY 4.0 et CC0 sont proposées ; le crédit général de E30 couvre aussi les photos de lieux.
- Aucune nouvelle dépendance, aucune permission.

## Hors périmètre

- Remplacer la photo d'un lieu existant.
- Plusieurs photos proposées, choix dans un panorama, zoom.
- Crédit par photo (à revoir avant les stores, comme pour la spec 030).

## Critères d'acceptation

- [x] E29 cherche une photo à l'ouverture quand le lieu a un point, jamais sans point (tests).
- [x] Roue pendant la recherche ; vignette si trouvée ; rien sinon (tests).
- [x] Toucher la vignette garde la photo recadrée et enregistre le lieu (tests).
- [x] Recadrage : quart de panorama tourné vers le lieu, photo plate carrée autour du lieu, bornés à l'image (tests).
- [ ] Sur le téléphone, à une adresse de grande ville : la vignette apparaît, la tuile du lieu montre le bon bâtiment.

## Hypothèses

- La vignette se place au-dessus de la galerie (relecture UX : le déclencheur reste au centre, 20 dp entre deux cibles, rien ne bouge).
- Un aperçu en grand avant de garder (relecture UX) : une mauvaise photo ne se remplace pas plus tard.
- Le badge paysage distingue la vignette d'un simple bouton ; à confirmer sur le terrain.
- Recadrage carré : les tuiles et épingles affichent des formes carrées ou rondes.
- Une photo plate est cadrée un peu différemment dans la vignette et dans la photo gardée (alignement de l'image) ; écart faible, accepté.
- Netteté : la source est l'image `sd` de Panoramax (environ 2 048 px de large) ; le quart d'un panorama gardé fait environ 512 px de côté, moins net qu'une photo prise (1 080 px). Accepté pour cette version ; l'image `hd` pourra être prise plus tard.
- Panorama près de la couture : cadre poussé vers l'intérieur plutôt que recollé (décalage de 45° au plus).

## Questions / réponses (2026-11-10)

- Quand ? À la création du lieu seulement, sur E29 ; pas de remplacement plus tard.
- Lieux cachés de la carte ? Proposer quand même.
- Affichage ? Vignette à toucher en bas de E29, à côté du déclencheur et de la galerie ; roue pendant la recherche ; rien trouvé, pas de vignette.
- Combien ? La meilleure seule, la plus proche tournée vers le lieu.
