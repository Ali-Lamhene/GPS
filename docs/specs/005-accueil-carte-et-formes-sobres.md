# 005 — Accueil sur la carte, formes plus sobres

- **Statut** : validé
- **Date** : 2026-11-01
- **Persona** : voyageur

## Besoin

Après la spec 002, l'accueil reste jugé vide : une carte voilée, un chemin vertical qui flotte dessus, rien d'autre. Le voyageur doit arriver sur une **vraie carte vive**, comme dans Google Maps, qui montre où il est et où sont ses lieux, et pouvoir toucher un lieu pour y aller.

Le **chemin** départ → arrivée (règle 3 de `docs/screens.md`) est gardé, car il est visuellement parlant. Une première version verticale (colonne à gauche) a été jugée trop austère ; après un essai de cinq variantes dans le navigateur, l'utilisateur a retenu un **panneau du bas** façon Citymapper, avec le chemin à l'horizontale (révision du 2026-11-01). Pour les lecteurs de droite à gauche, les deux bouts se reconnaissent à leur symbole (point bleu, drapeau), pas à leur ordre.

Partout dans l'app, l'interface fait encore « jouet » : arrondis très marqués, gros disque bleu à halo, icônes très grandes, tuiles de couleur. Elle doit devenir plus sobre, comme une app de navigation grand public.

## Parcours

### Accueil

1. Le voyageur ouvre l'app. La carte remplit l'écran, **sans voile**, centrée sur sa position (point bleu). Elle est cadrée pour montrer aussi ses lieux proches.
2. Ses lieux sont dessinés sur la carte en **épingles** : un disque blanc avec le pictogramme du lieu (ou sa photo), et une pointe vers le point exact. Un lieu marqué « ne pas montrer sur la carte » n'est pas dessiné.
3. Un **panneau blanc** reste visible en bas de l'écran (coins du haut arrondis). Sur sa première rangée, le **chemin** : la pastille de départ (le point bleu « ici » par défaut), des pointillés avec un petit marcheur adulte au milieu, la pastille d'arrivée, qui pulse tant qu'elle est vide. Les pastilles sont des disques bleu pâle avec le pictogramme du lieu.
4. Sous le chemin, une rangée de **raccourcis** : les 4 premiers lieux en pastilles, puis une 5e pastille « … » qui ouvre la feuille avec tous les lieux. Toucher un raccourci choisit ce lieu comme arrivée.
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
| Où sont mes lieux        | épingles avec pictogramme ou photo sur la carte                        |
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
