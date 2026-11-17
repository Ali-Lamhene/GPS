# 037 — Modifier un lieu après coup : pictogramme et photo

- **Statut** : livré en autonomie (brief du 2026-11-17, fiche 5/6 validée par Ali ; mode autonome, pas de validation de spec attendue) ; à voir sur le téléphone, après une nouvelle build native
- **Date** : 2026-11-17
- **Persona** : voyageur et accompagnant (même entrée, même parcours)
- **Révise** : spec 033 (« pas de remplacement plus tard », réponse du 2026-11-10), spec 020 (photo choisie seulement à la création), spec 001 (un lieu ne se modifie pas)

## Besoin

Changer le **pictogramme** et la **photo** d'un lieu déjà enregistré : une photo ratée, une meilleure photo de rue, un pictogramme mal choisi. Le voyageur doit pouvoir le faire seul, sans lire ; l'accompagnant aussi, sur le téléphone du voyageur.

## Parcours

1. **Entrée** (décision d'Ali, 2026-11-17) : **appui long** (environ une demi-seconde) sur l'**épingle** du lieu, sur la carte d'accueil, ou sur le **lieu dans la feuille des lieux** (ouverte par une pastille du chemin). Le téléphone vibre et joue le son « select » (signal `hold`, celui de la fin d'un appui tenu) ; l'écran du pictogramme s'ouvre.
2. **Pictogramme (E28, réutilisé)** : la carte est centrée sur le lieu ; la grille montre le **pictogramme actuel déjà choisi**, et défile d'elle-même, sans animation, pour le mettre dans la première rangée visible ; l'aperçu au-dessus de la grille montre l'épingle du lieu **avec sa photo actuelle** et le pictogramme choisi dans une **pastille agrandie** (36 dp au lieu de 20) pour que le changement se voie. Toucher un autre pictogramme change l'aperçu. ✓ continue vers la photo. ← revient à l'accueil sans rien changer.
3. **Photo (E29, réutilisé)** :
   - Lieu **qui a une photo** : l'écran s'ouvre avec **sa photo actuelle en grand dans le cadre** et le rond émeraude ✓ à la place du déclencheur. Au-dessus de « sans photo », une vignette ronde de cette photo, cerclée d'émeraude, avec le **pictogramme du lieu** en badge. Toucher ✓ **garde la photo actuelle** (seul le pictogramme change). Toucher la vignette referme l'aperçu : la caméra revient, le déclencheur aussi ; un nouveau toucher rouvre l'aperçu.
   - Lieu **sans photo** : l'écran est celui de la création (caméra, galerie, « sans photo »).
   - Dans les deux cas, les trois choix de la création restent : **photo de rue proposée** (Panoramax, vignette au-dessus de la galerie, aperçu puis ✓, spec 033), **sa propre photo** (déclencheur ou galerie), **sans photo**.
   - **Sans photo, pour un lieu qui a une photo** (relecture UX : c'est le seul choix qui détruit, et le voyageur a appris à la création que ce bouton veut dire « passer ») : un premier toucher **montre** le lieu sans photo (son pictogramme en grand sur blanc chaud dans le cadre), le bouton « sans photo » cerclé d'émeraude, et ✓ à la place du déclencheur ; ✓ retire la photo. Un second toucher sur « sans photo », ou ←, referme cet aperçu sans rien changer. Pour un lieu sans photo, « sans photo » termine tout de suite, comme à la création.
   - La caméra ne tourne (et sa permission n'est demandée) que quand le déclencheur est visible : pas derrière une photo qui attend ✓. Un lieu modifié pour son seul pictogramme ne voit jamais la fenêtre de permission d'Android.
   - La vignette de photo de rue arrive sans le son « select » tant que la photo actuelle attend ✓ : il ferait croire à un choix.
4. **Enregistrement** : le lieu garde son identifiant, son point, son adresse et son nom pour le passant ; seuls le pictogramme et la photo changent. Son « enregistré » et vibration courte, retour à l'accueil. Le changement se voit **partout** (épingle, pastilles, feuille, liste de l'accompagnant, cartes du trajet, arrivée, aide : spec 036), y compris si le lieu est déjà choisi comme départ ou arrivée.

## Le toucher court ne change pas

- Toucher court sur une épingle ou un lieu de la feuille : choix du trajet, comme avant (spec 035). Un appui long n'est **jamais** aussi un toucher court : ni lieu choisi, ni son « select » en plus.
- Un doigt qui glisse (déplacer la carte) n'est pas un appui long.

## Signaux

| Information                   | Canaux                                                                    |
| ----------------------------- | ------------------------------------------------------------------------- |
| « Tu vas modifier ce lieu »   | Vibration de 150 ms, son « select », l'écran du pictogramme s'ouvre       |
| « Voici ce que tu as choisi » | Pictogramme actuel sélectionné, épingle d'aperçu avec la photo actuelle   |
| « C'est la photo actuelle »   | Photo en grand, vignette avec le pictogramme du lieu en badge, ✓ émeraude |
| « Lieu modifié »              | Son « enregistré », vibration de 80 ms, retour à l'accueil, épingle neuve |
| « Échec de l'enregistrement » | Croix rouge et alerte à l'accueil (spec 015), le lieu reste comme avant   |

## Cas limites

| Situation                                    | Comportement attendu                                                                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| « ici » (position actuelle)                  | Pas modifiable : aucun appui long sur le point de position ni sur la tuile « ici ». Le point de position, dessiné au-dessus des épingles, garde son appui long même quand le voyageur est sur un de ses lieux |
| Doigt juste à côté d'une épingle             | Rien : la zone de l'appui long est le dessin de l'épingle, sans marge, comme le toucher court (D15)                                                                                                           |
| Lieu de l'autre bout, grisé dans la feuille  | Rien (tuile inactive) ; on le modifie par son épingle                                                                                                                                                         |
| Lieu reçu par lien (spec 023), sans photo    | Modifiable comme les autres ; la photo ajoutée reste sur ce téléphone, elle ne voyage jamais dans un lien                                                                                                     |
| Lieu sans point                              | Pas d'épingle ; modifiable par la feuille ; E28 centrée sur la position du voyageur ; aucune photo de rue                                                                                                     |
| Photo remplacée ou retirée                   | L'ancien fichier est effacé **après** l'enregistrement réussi, jamais avant                                                                                                                                   |
| Photo actuelle gardée                        | Aucun fichier nouveau, aucun effacé                                                                                                                                                                           |
| Enregistrement impossible (téléphone plein…) | Le lieu reste comme avant ; la nouvelle photo est effacée ; croix rouge à l'accueil (spec 015)                                                                                                                |
| ← sur E28                                    | Retour à l'accueil, rien ne change                                                                                                                                                                            |
| ← sur E29                                    | Retour à E28 (le pictogramme choisi reste) ; si l'aperçu d'une photo de rue ou de « sans photo » est ouvert, il se ferme d'abord                                                                              |
| Les deux bouts choisis                       | L'appui long marche toujours (épingles et feuille)                                                                                                                                                            |
| Adresse                                      | Jamais redemandée à Photon (changer l'adresse est hors périmètre)                                                                                                                                             |

## Données et confidentialité

- Rien de nouveau ne sort du téléphone, sauf la recherche de photo de rue de E29 (`api.panoramax.xyz` : le point du lieu à environ 10 m et l'IP, une fois par ouverture), **déjà déclarée** pour la création (spec 033) ; elle se fait aussi à la modification.
- Photo : réencodée sans métadonnées, dans les documents privés hors sauvegarde (specs 016, 020) ; l'ancienne est effacée après l'enregistrement.
- **Appui long sur une épingle, Android** : MapLibre Native 11.5.1 avale l'appui long fait sur un marqueur (`onMapLongClick` sort sans rien dire si le doigt est dans un marqueur). Un petit correctif est appliqué au code natif de la bibliothèque à l'installation (`scripts/patch-maplibre-long-press.js`, lancé par `postinstall`) : l'appui long est transmis à la carte, qui trouve l'épingle sous le doigt. **Il faut une nouvelle build native** (dev ou `preview`) pour qu'il marche sur le téléphone. Aucune dépendance ajoutée, aucune permission.

## Hors périmètre

Renommer un lieu, le supprimer, changer son adresse ou son point. Modifier depuis la liste de l'accompagnant (spec 022).

## Critères d'acceptation

- [x] Spec écrite avec hypothèses ; relue par `ux-sans-texte-reviewer` (bloquant et points « à corriger » traités) et par `security-reviewer` (rien de bloquant ; `securite.md` complété).
- [x] Appui long sur une épingle (carte web : gestes du pointeur ; carte native : appui long de la carte et recherche de l'épingle sous le doigt ; lecteur d'écran) et sur un lieu de la feuille ouvre E28 avec le lieu (tests).
- [x] L'appui long ne choisit pas le lieu ; le toucher court choisit toujours (tests).
- [x] Changer le pictogramme seul (photo gardée) ; les 3 choix de photo (rue, caméra ou galerie, sans photo) ; le lieu garde son identifiant, l'ancienne photo est effacée après l'enregistrement (tests).
- [ ] Vérifié dans le navigateur et sur le Galaxy S8. **Fait en partie (2026-11-17)** : navigateur à 390 dp, accueil avec 4 lieux enregistrés (`public/seed.html`) : rendu sans erreur. **Non vu** : épingles (carte web sans tuiles en Chrome sans fenêtre, comme aux fiches 1 à 4) ; l'appui long, E28 et E29 en modification (Chrome sans fenêtre ne fait que des captures, aucun geste ; E28 et E29 demandent un brouillon) ; téléphone : aucune build de dev installée, et le correctif MapLibre demande une nouvelle build native.

À voir sur le téléphone (build de dev ou `preview` construite **après** `2ec6fb6`) : appui long sur une épingle (vibration, E28) sans que le lieu soit aussi choisi au relâchement ; toucher court inchangé ; appui long sur le point de position posé sur un lieu (rien) ; appui long sur une tuile de la feuille ; E28 qui défile jusqu'au pictogramme actuel et pastille de 36 dp sur la photo ; E29 qui s'ouvre sur la photo actuelle sans fenêtre de permission caméra ; ✓ ; vignette de la photo actuelle ; « sans photo » puis ✓ ; photo de rue, caméra, galerie ; le lieu changé partout (épingle, pastilles, feuille, liste de l'accompagnant).

## Hypothèses (mode autonome)

- **Parcours en deux écrans, comme la création** (E28 puis E29) plutôt qu'un écran « modifier » à deux boutons : un geste déjà appris, une décision par écran. Pour changer seulement la photo, le voyageur touche ✓ sur E28 ; pour changer seulement le pictogramme, ✓ sur E29.
- **Durée de l'appui long : celle du système** (500 ms sur le Galaxy S8, Android 9 ; 500 ms dans le navigateur). Pas plus longue, pour que l'accompagnant trouve le geste ; pas plus courte, pour qu'un toucher appuyé ne l'ouvre pas. À observer sur le terrain : un voyageur qui appuie longtemps par habitude ouvrira E28 ; ← le ramène sans rien changer.
- **Signal d'entrée** : `hold` (vibration de 150 ms et son « select »), celui de la fin d'un appui tenu.
- **Vignette de la photo actuelle au-dessus de « sans photo »**, symétrique de la photo de rue au-dessus de la galerie, avec le pictogramme du lieu en badge (au lieu du paysage de la photo de rue) : elle dit « la photo de ce lieu ».
- Sur E29, ← ferme l'aperçu d'une photo de rue (spec 033), mais pas celui de la photo actuelle, ouvert d'office : ← revient à E28.
- La liste des lieux de l'accompagnant (spec 022) ne reçoit pas l'appui long : l'entrée décidée est l'épingle et la feuille.
- iOS : l'appui long sur une épingle n'est pas vérifié (aucune build iOS).

## Relecture `ux-sans-texte-reviewer` (2026-11-17)

Corrigé : « sans photo » passe par un aperçu puis ✓ quand le lieu a une photo (bloquant) ; la grille de E28 défile jusqu'au pictogramme actuel ; pastille du pictogramme agrandie sur l'aperçu de E28 ; caméra et permission seulement quand le déclencheur est visible ; zone de l'appui long sans marge, point de position prioritaire ; pas de « select » à l'arrivée de la photo de rue quand la photo actuelle attend ✓ ; ni bulle ni sélection du navigateur sur une épingle web tenue.

À surveiller sur le terrain (gardé tel quel) :

- Le son d'entrée (`hold`) est celui du choix d'un lieu ; seuls la vibration de 150 ms et le changement d'écran distinguent « tu vas modifier ». Un son propre aiderait à comprendre un appui long fait par erreur.
- Une fois la photo actuelle refermée, le déclencheur remplace la photo tout de suite (comme à la création). Si des photos ratées arrivent, faire passer la photo prise par un aperçu puis ✓.
- Chaque entrée dans E29 en modification interroge Panoramax, même par erreur (déclaré, accepté).
- Découverte du geste sans démonstration ; appuis longs involontaires (voyageur stressé) ; délai d'accessibilité « appui prolongé » de 1 à 1,5 s sur certains téléphones ; vibration sentie à travers une coque ; deux vignettes rondes sur E29 distinguées.
- Android : vérifier sur le S8 que le relâchement après l'appui long ne choisit pas aussi le lieu (`onMapClick`).
