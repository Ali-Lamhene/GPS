# 005 — Accueil sur la carte, formes plus sobres

- **Statut** : validé
- **Date** : 2026-11-01
- **Persona** : voyageur

## Besoin

Après la spec 002, l'accueil reste jugé vide : une carte voilée, un chemin vertical qui flotte dessus, rien d'autre. Le voyageur doit arriver sur une **vraie carte vive**, comme dans Google Maps, qui montre où il est et où sont ses lieux, et pouvoir toucher un lieu pour y aller.

Le **chemin vertical** départ → arrivée (règle 3 de `docs/screens.md`) est gardé : il est visuellement parlant, et vertical, il se lit de la même façon quel que soit le sens de lecture du voyageur (arabe, persan, pachto se lisent de droite à gauche).

Partout dans l'app, l'interface fait encore « jouet » : arrondis très marqués, gros disque bleu à halo, icônes très grandes, tuiles de couleur. Elle doit devenir plus sobre, comme une app de navigation grand public.

## Parcours

### Accueil

1. Le voyageur ouvre l'app. La carte remplit l'écran, **sans voile**, centrée sur sa position (point bleu). Elle est cadrée pour montrer aussi ses lieux proches.
2. Ses lieux sont dessinés sur la carte en **épingles** : un disque blanc avec le pictogramme du lieu (ou sa photo), et une pointe vers le point exact. Un lieu marqué « ne pas montrer sur la carte » n'est pas dessiné.
3. Une **colonne blanche étroite** flotte contre le bord gauche de la carte : la case de départ en haut, des pointillés avec un petit marcheur adulte au milieu, la case d'arrivée en bas. Le départ est « ici » (point bleu) par défaut. La case d'arrivée, vide, pulse.
4. Le voyageur **touche une épingle** : le lieu remplit la case d'arrivée, son épingle grossit, un pointillé droit relie le point bleu au lieu. Une **barre bleue pleine largeur** « continuer » apparaît en bas.
5. Toucher une autre épingle change l'arrivée. Toucher la case de départ ou d'arrivée ouvre la **feuille des lieux** (tous les lieux, y compris ceux hors de l'écran ou non montrés sur la carte), comme aujourd'hui.
6. « Continuer » mène au choix du transport (E06), qui affiche le vrai trajet.
7. Deux doigts déplacent ou zooment la carte ; un bouton « ma position » apparaît alors et recentre (comme au guidage, spec 002). Un doigt ne déplace pas la carte : il sert à toucher les épingles.
8. L'aide reste en haut à droite (D13).

### Formes, dans toute l'app

- **Arrondis** : 8 dp pour les boutons, tuiles, bandeaux et cartes ; 16 dp en haut des panneaux du bas. Les cercles restent seulement pour les boutons flottants sur la carte (aide, recentrer, retour), les épingles et le point de position.
- **Action principale** : le gros disque bleu de 96 dp à halo devient une barre bleue pleine largeur en bas de l'écran, comme dans les panneaux de la spec 002.
- **Icônes** : réduites d'environ un quart ; les cibles tactiles restent d'au moins 64 dp.
- **Tuiles de lieux** : fond blanc bordé de gris clair, pictogramme foncé, au lieu des fonds colorés.

## Signaux

| Information              | Canaux                                                                  |
| ------------------------ | ----------------------------------------------------------------------- |
| Où je suis               | point bleu sur la carte + case de départ « ici » dans la colonne        |
| Où sont mes lieux        | épingles avec pictogramme ou photo sur la carte                         |
| Ce qu'il reste à choisir | case vide qui pulse dans la colonne                                     |
| Lieu choisi              | épingle agrandie + pictogramme dans la case d'arrivée + pointillé droit |
| Je peux continuer        | barre bleue pleine largeur qui apparaît en bas + son de validation      |
| La carte ne me suit plus | bouton « ma position » qui apparaît                                     |

## Cas limites

| Situation                                        | Comportement attendu                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Position pas encore connue ou permission refusée | pas de point bleu ; la case de départ pulse ; la carte se cadre sur les lieux                |
| Aucun lieu enregistré                            | carte centrée sur la position, aucune épingle ; la case d'arrivée ouvre la feuille (ajouter) |
| Lieu trop loin pour tenir à l'écran              | pas d'épingle visible ; il reste accessible par la case d'arrivée (feuille des lieux)        |
| Deux épingles très proches                       | elles se chevauchent sans se cacher entièrement ; la dernière touchée passe au-dessus        |
| Lieu sans position (ancien lieu, lien incomplet) | pas d'épingle ; accessible par la feuille                                                    |
| Toucher l'épingle du lieu de départ              | sans effet (un lieu ne peut pas être à la fois départ et arrivée)                            |
| Position hors de la zone embarquée               | fond de carte uni (spec 002), point bleu et épingles toujours dessinés                       |

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
- [ ] La colonne verticale montre départ en haut, marcheur et pointillés au milieu, arrivée en bas ; la case vide pulse.
- [ ] Toucher une épingle remplit l'arrivée, agrandit l'épingle, trace le pointillé et fait apparaître la barre « continuer », qui mène à E06.
- [ ] Toucher une case de la colonne ouvre la feuille des lieux.
- [ ] Un doigt ne déplace pas la carte ; deux doigts la déplacent et font apparaître « ma position ».
- [ ] Dans toute l'app : plus aucun arrondi supérieur à 16 dp hors cercles ; plus de disque d'action à halo ; tuiles de lieux blanches.
- [ ] Testé dans le navigateur à 360 × 740 et 360 × 640, parcours accueil → arrivée complet, aucune requête hors de l'app.

## Hypothèses

- En démo, chaque lieu reçoit une position réelle dans la zone embarquée de Marseille ; le trajet affiché ensuite reste le trajet de démo, quel que soit le lieu choisi.
- Valeur par défaut de « ne pas montrer sur la carte » : activé pour un lieu au pictogramme « maison » ou « famille », désactivé pour les autres ; modifiable à la création. En démo, la maison n'est pas montrée.
- Cadrage initial : la position et les lieux situés à moins d'environ 2 km, au zoom le plus proche qui les contient tous.
- La colonne mesure environ 72 dp de large et se place sous l'en-tête, à gauche ; elle ne bouge pas quand la carte bouge.
- La pulsation est gardée seulement sur la case à remplir et sur l'alerte « descends ».
- Le son de validation est le son `select`, déjà joué au choix du transport (E06), avec sa vibration (`src/services/feedback.ts`). Aujourd'hui, l'accueil n'en joue aucun au choix d'un lieu.

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
