# 005 — Accueil sur la carte, formes plus sobres

- **Statut** : validé
- **Date** : 2026-11-01
- **Persona** : voyageur

## Besoin

Après la spec 002, l'accueil reste jugé vide : une carte voilée, un chemin vertical qui flotte dessus, rien d'autre. Le voyageur doit arriver sur une **vraie carte vive**, comme dans Google Maps, qui montre où il est et où sont ses lieux, et pouvoir toucher un lieu pour y aller.

Le **chemin** départ → arrivée (règle 3 de `docs/screens.md`) est gardé, car il est visuellement parlant. Une première version verticale (colonne à gauche) a été jugée trop austère ; après un essai de cinq variantes dans le navigateur, l'utilisateur a retenu un **panneau du bas** façon Citymapper, avec le chemin à l'horizontale (révision du 2026-11-01). Pour les lecteurs de droite à gauche, les deux bouts se reconnaissent à leur symbole (point bleu, drapeau), pas à leur ordre.

Partout dans l'app, l'interface fait encore « jouet » : arrondis très marqués, gros disque bleu à halo, icônes très grandes, tuiles de couleur. Elle doit devenir plus sobre, comme une app de navigation grand public.

Révision du 2026-11-01 (photos) : l'effet « jouet » vient aussi des seuls pictogrammes. Un labo dans le navigateur a comparé icônes pleines, icônes au trait et vraies photos de lieux ; l'utilisateur a retenu **les photos, avec le pictogramme du lieu en petit** : la photo dit « ce lieu-là », le pictogramme précise « c'est un lieu de santé, de sport… ».

## Parcours

### Accueil

1. Le voyageur ouvre l'app. La carte remplit l'écran, **sans voile**, centrée sur sa position (point bleu). Elle est cadrée pour montrer aussi ses lieux proches.
2. Ses lieux sont dessinés sur la carte en **épingles** : un disque blanc avec le pictogramme du lieu, ou sa photo avec le pictogramme en petit dans le coin bas, et une pointe vers le point exact. Un lieu marqué « ne pas montrer sur la carte » n'est pas dessiné.
3. Un **panneau blanc** reste visible en bas de l'écran (coins du haut arrondis). Sur sa première rangée, le **chemin** : la pastille de départ (le point bleu « ici » par défaut), des pointillés avec un petit marcheur adulte au milieu, la pastille d'arrivée, qui pulse tant qu'elle est vide. Les pastilles sont des disques bleu pâle avec le pictogramme du lieu ; un lieu qui a une photo la montre, avec son pictogramme en petit dans le coin bas. Sur les pastilles de départ et d'arrivée, le symbole du bout (point, drapeau) reste dans le coin haut : les deux badges ne se gênent pas.
4. Sous le chemin, une rangée de **raccourcis** : les 4 premiers lieux en pastilles (photo et petit pictogramme, ou pictogramme seul), puis une 5e pastille « … » qui ouvre la feuille avec tous les lieux. Toucher un raccourci choisit ce lieu comme arrivée.
5. Le voyageur **touche une épingle** ou un raccourci : le lieu remplit la pastille d'arrivée, son épingle grossit, un pointillé droit relie le point bleu au lieu. Les raccourcis laissent la place à deux boutons : un **carré blanc ✕** qui annule (l'arrivée redevient vide, les raccourcis reviennent) et une **barre bleue ✓** pleine largeur qui continue.
6. Toucher une autre épingle change l'arrivée. Toucher la pastille de départ ou d'arrivée ouvre la **feuille des lieux** (tous les lieux, y compris ceux hors de l'écran ou non montrés sur la carte).
7. « Continuer » mène au choix du transport (E06), qui affiche le vrai trajet.
8. **Un doigt déplace la carte**, deux doigts zooment, partout dans l'app, guidage compris (révise la spec 002) ; le bouton « ma position » apparaît alors et recentre ; sans geste, la carte revient seule au bout de 10 s.
9. L'aide reste en haut à droite (D13).

### Formes, dans toute l'app

- **Arrondis** : 8 dp pour les boutons, tuiles, bandeaux et cartes ; 16 dp en haut des panneaux du bas. Les cercles restent seulement pour les boutons flottants sur la carte (aide, recentrer, retour), les épingles et le point de position.
- **Action principale** : le gros disque bleu de 96 dp à halo devient une barre bleue pleine largeur en bas de l'écran, comme dans les panneaux de la spec 002.
- **Icônes** : réduites d'environ un quart ; les cibles tactiles restent d'au moins 64 dp.
- **Tuiles de lieux** : fond blanc bordé de gris clair, pictogramme foncé, au lieu des fonds colorés.
- **Plus chaleureux sans faire jouet** (révision) : panneau de l'accueil arrondi à 24 dp, pastilles rondes bleu pâle, ombres douces.
- **Choix du transport (E06)** : plus de coche sur le mode choisi, le fond bleu suffit ; pictogrammes plus petits.

## Signaux

| Information              | Canaux                                                                 |
| ------------------------ | ---------------------------------------------------------------------- |
| Où je suis               | point bleu sur la carte + pastille de départ « ici » dans le panneau   |
| Où sont mes lieux        | épingles avec photo et petit pictogramme, ou pictogramme seul          |
| Ce qu'il reste à choisir | pastille d'arrivée vide qui pulse                                      |
| Lieu choisi              | épingle agrandie + pictogramme dans la pastille d'arrivée + pointillé  |
| Je peux continuer        | barre bleue ✓ et bouton ✕ qui remplacent les raccourcis + son `select` |
| La carte ne me suit plus | bouton « ma position » qui apparaît                                    |

## Cas limites

| Situation                                        | Comportement attendu                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Position pas encore connue ou permission refusée | pas de point bleu ; la pastille de départ pulse ; la carte se cadre sur les lieux     |
| Aucun lieu enregistré                            | aucune épingle ni raccourci ; la pastille « … » ouvre la feuille (ajouter un lieu)    |
| Lieu trop loin pour tenir à l'écran              | pas d'épingle visible ; raccourci ou feuille des lieux                                |
| Moins de 4 lieux                                 | autant de raccourcis que de lieux, puis « … »                                         |
| Deux épingles très proches                       | elles se chevauchent sans se cacher entièrement ; la dernière touchée passe au-dessus |
| Lieu sans position (ancien lieu, lien incomplet) | pas d'épingle ; accessible par la feuille                                             |
| Toucher l'épingle du lieu de départ              | sans effet (un lieu ne peut pas être à la fois départ et arrivée)                     |
| Position hors de la zone embarquée               | fond de carte uni (spec 002), point bleu et épingles toujours dessinés                |

## Données et confidentialité

- **Position des lieux** : chaque lieu reçoit un point (longitude, latitude), gardé sur le téléphone avec le lieu (spec 001). Rien ne quitte le téléphone.
- **« Ne pas montrer sur la carte »** : nouvel attribut du lieu, choisi par la personne qui le crée dans la partie préparation (spec 001, à ajouter à son parcours B). La carte d'accueil s'ouvre au lancement de l'app : quiconque voit ou fouille le téléphone voit les épingles. Ce réglage protège un lieu sensible (maison, famille).
- **Photo d'un lieu caché de la carte** (maison, famille) : les raccourcis, visibles dès l'ouverture de l'app, ne montrent que son pictogramme, jamais sa photo. Une façade révèle l'adresse aussi bien qu'une épingle. La photo n'apparaît qu'une fois le lieu choisi comme départ ou arrivée, et dans la feuille des lieux.
- **Photos de démonstration** : 3 photos libres de Wikimedia Commons (mairie, lycée Thiers, haltères), téléchargées une fois pendant le développement avec l'accord de l'utilisateur, recadrées en carré de 256 px, métadonnées retirées, embarquées dans l'app. Aucun appel réseau à l'exécution. Auteurs et licences dans `docs/credits-photos.md`.
- **Pointillé droit** : calculé sur le téléphone, sans service de calcul d'itinéraire.
- Aucune nouvelle dépendance ni permission. La position réelle arrive avec la spec 004 ; ici, la position de démonstration.

## Hors périmètre

- Le vrai GPS et la vraie position (spec 004), le vrai calcul de trajet (spec 003).
- La case à cocher « ne pas montrer sur la carte » dans la partie préparation : elle sera codée avec la spec 001. Ici, l'attribut existe et la démo l'utilise.
- La vue aérienne IGN (D14).
- Le regroupement d'épingles nombreuses.
- La barre de progression horizontale du guidage (risque pour les lecteurs de droite à gauche) : notée à part.

## Critères d'acceptation

- [ ] L'accueil affiche une carte vive, sans voile, avec le point bleu et les épingles des lieux de démonstration, sans aucun texte ni chiffre.
- [ ] Un lieu marqué « ne pas montrer sur la carte » n'a pas d'épingle mais reste dans la feuille des lieux.
- [ ] Un lieu avec photo montre sa photo et son petit pictogramme sur son épingle, son raccourci et la pastille d'arrivée (drapeau en haut, pictogramme en bas).
- [ ] Un lieu caché de la carte avec photo ne montre que son pictogramme dans les raccourcis.
- [ ] Le panneau du bas montre le chemin (départ, marcheur, arrivée qui pulse) et 4 raccourcis plus « … ».
- [ ] Toucher une épingle ou un raccourci remplit l'arrivée, agrandit l'épingle, trace le pointillé et remplace les raccourcis par ✕ et ✓ ; ✓ mène à E06 ; ✕ vide l'arrivée.
- [ ] Toucher une pastille du chemin ou « … » ouvre la feuille des lieux.
- [ ] Un doigt (ou la souris) déplace la carte et fait apparaître « ma position », guidage compris.
- [ ] E06 : pas de coche sur le mode choisi.
- [ ] Dans toute l'app : plus aucun arrondi supérieur à 16 dp hors cercles ; plus de disque d'action à halo ; tuiles de lieux blanches.
- [ ] Testé dans le navigateur à 360 × 740 et 360 × 640, parcours accueil → arrivée complet, aucune requête hors de l'app.

## Hypothèses

- En démo, chaque lieu reçoit une position réelle dans la zone embarquée de Marseille ; le trajet affiché ensuite reste le trajet de démo, quel que soit le lieu choisi.
- Valeur par défaut de « ne pas montrer sur la carte » : activé pour un lieu au pictogramme « maison » ou « famille », désactivé pour les autres ; modifiable à la création. En démo, la maison n'est pas montrée.
- Cadrage initial : la position et les lieux situés à moins d'environ 2 km, au zoom le plus proche qui les contient tous.
- Les « 4 premiers lieux » suivent l'ordre de la feuille des lieux (spec 001 : maison d'abord, puis du plus récent au plus ancien).
- Le panneau n'a pas de poignée : il ne se tire pas, la feuille complète s'ouvre par « … » ou par les pastilles.
- La pulsation est gardée seulement sur la case à remplir et sur l'alerte « descends ».
- Le son de validation est le son `select`, déjà joué au choix du transport (E06), avec sa vibration (`src/services/feedback.ts`). Aujourd'hui, l'accueil n'en joue aucun au choix d'un lieu.

- Départ ou arrivée marqué « ne pas montrer sur la carte » : ni pointillé ni repère pour ce lieu ; seul le panneau montre le choix.
- La barre « continuer » porte une coche, pas une flèche vers la droite (sens de lecture).
- Photos de démo : seulement des lieux publics ; « travail », « plage » et « marché » gardent leur pictogramme (pas de photo libre convenable : le cadrage de la tour CMA CGM montrait surtout une cathédrale, symbole religieux ; la plage était un coucher de soleil, illisible en petit et qui évoque « le soir » ; aucune photo libre de Noailles). Le lieu de démo « centre-ville » devient « la mairie », comme sa photo.
- Licences : les photos CC BY et CC BY-SA (lycée, haltères) demandent de citer leur auteur dans toute version distribuée ; à régler avant la première (crédits côté accompagnant ou photos CC0). Elles sont embarquées sous forme d'images codées dans le code (`data:image/jpeg`), seul format local que `isLocalPicture` accepte aussi dans le navigateur.
- Le petit pictogramme sur une photo : disque blanc de 28 dp (26 px sur les épingles), liseré sombre et ombre, pictogramme foncé de 18 dp, coin bas gauche ; le symbole du bout du trajet garde son disque foncé, coin haut droit, en diagonale.
- En démo, la position est toujours connue : la case de départ qui pulse (position inconnue) arrive avec la spec 004.

## Questions / réponses

- Accueil : comment choisir où aller ? → Lieux en épingles sur la carte ; toucher une épingle donne le trajet depuis la position. Garder le chemin vertical, pas d'horizontale (sens de lecture).
- Où placer le chemin vertical ? → Colonne flottante étroite contre le bord gauche.
- Lieux trop loin pour l'écran ? → Accessibles par la case d'arrivée (feuille des lieux).
- Après le toucher d'une épingle ? → Aperçu (pointillé droit) puis barre « continuer » vers E06.
- Maison sur la carte ? → Choix par lieu : « ne pas montrer sur la carte », réglé par la personne qui crée le lieu.
- Position inconnue ? → Case de départ vide qui pulse, carte cadrée sur les lieux.
- Milieu de la colonne ? → Pointillés et petit marcheur (maquette v7).
- Arrondis ? → Sobres : 8 dp, 16 dp en haut des panneaux, cercles pour les boutons de carte.
- Effet « jouet » à calmer ? → Gros disque bleu à halo, icônes très grandes, couleurs des tuiles. Les pulsations restent (case à remplir, alerte).
- Révision après essai (colonne jugée pas assez chaleureuse) : 5 variantes testées dans le navigateur ; retenue « Feuille » : panneau du bas avec chemin horizontal et raccourcis.
- Carte bloquée à un doigt ? → Un doigt déplace la carte partout, guidage compris.
- Annuler l'arrivée ? → Carré ✕ à côté de la barre ✓.
- Quels raccourcis ? → Les 4 premiers lieux, plus « … » vers la feuille complète.
- E06 : icônes trop grosses, coche inutile → retirée, pictogrammes réduits.
- Effet « jouet » et photos (révision) : labo icônes pleines / au trait / photos → photos, avec le pictogramme du lieu en petit (« une précision en plus »). Icônes pleines gardées.
- Pictogramme et drapeau sur la même pastille ? → Coins opposés : drapeau en haut, pictogramme en bas.
- Photo de la maison dans les raccourcis ? → Non, pictogramme seul pour un lieu caché de la carte.
- Ajouter un hôpital à la démo ? → Non.
- Relectures : licences CC BY / BY-SA ? → Plus tard, avant toute version distribuée. Plage en coucher de soleil ? → Pictogramme seul. Mairie avec drapeaux, nommée « centre-ville » ? → Renommée « la mairie », photo gardée.
