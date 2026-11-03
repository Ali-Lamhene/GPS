# 010 — Tous les autres écrans en direction émeraude

- **Statut** : validé
- **Date** : 2026-11-03
- **Persona** : voyageur (E06 à E29), accompagnant (E30)
- **Référence visuelle** : maquette de l'accueil `docs/design/maquette-emeraude.png` (D15), catalogue de maquettes de l'utilisateur (`catalogue_gps_sans_texte.pdf`, gardé hors du dépôt car il contient des manifestes C2PA ; on en reprend l'esprit, pas les défauts listés plus bas), accueil livré (spec 009).
- **Révise** : la partie visuelle des specs 002, 005, 007 et 008 pour ces écrans ; D13 (aspect du bouton d'aide, pas sa place).

## Besoin

L'accueil est passé en direction émeraude (spec 009). Les autres écrans gardent l'interface bleue « clair premium », avec un guidage et un métro sombres : l'app a deux visages. Cette spec passe **tous les autres écrans** dans la même famille que l'accueil. Le comportement ne change pas, sauf les points listés dans « Changements de comportement ».

## Système commun

- **Une seule couleur d'action** : émeraude `#037C6D` partout où il y avait le bleu (`primary`). Le bleu disparaît de l'interface du voyageur. Les couleurs officielles des lignes (bus 41, M1) restent celles du réseau.
- **Surfaces** : blanc chaud `#FBF8F6`, carte crème (déjà en place), grands arrondis, ombres douces et chaudes, comme l'accueil.
- **Pictogrammes** : Material Symbols au trait (« outlined ») partout ; plein seulement sur fond émeraude plein, en blanc.
- **Boutons ronds** : blancs chauds, pictogramme émeraude au trait. Aide (?), retour, accueil, fermer, écouter, ⓘ : même forme. Le bouton d'aide reste **toujours en haut à droite, même taille** (D13) ; il n'est plus un disque noir.
- **Action principale** : pilule émeraude pleine, pictogramme blanc (`MainActionButton`, ton émeraude par défaut).
- **Tailles** : celles de la maquette, sans zone tactile élargie (D15). La zone de 64 dp d'`IconButton` (`sizes.minTarget`) est retirée.
- **Pilule du haut** (E06, E07, E08) : le même chemin que l'accueil (épingle ····· drapeau, points tous remplis), en lecture seule, qui montre les lieux choisis (photo ou pictogramme) avec leur badge épingle / drapeau (spec 006).
- **Durées** : nos cadrans (un cadran par heure commencée), restylés : quartiers remplis en émeraude sur fond pâle. Jamais d'horloge, jamais de chiffres.
- **Tracés** : marche en pointillés émeraude ; véhicules en trait plein dans la couleur officielle de la ligne ; partie déjà faite en gris.
- **Arrêts sur la carte** : gouttes comme les épingles de lieux (spec 009), avec le pictogramme du véhicule au trait, ou le « M » officiel du métro sur la couleur de la ligne ; l'arrêt de descente cerclé d'orange (alerte).
- **Vert « bon chemin »** : un vert plus clair que l'émeraude, `#2FBF71`, réservé au contour de la carte de consigne du guidage quand le voyageur va dans la bonne direction (toujours vrai dans la démo ; l'état « mauvais sens » viendra avec la spec 004).
- **Alerte** : orange `#E8590C` sur une carte pêche `#FDE3D3` (« descends », arrêt de descente, pas de réseau).

## Écrans

### E06 — Choix du moyen de transport

- En haut : retour (rond), pilule du chemin, aide.
- Carte blanche n° 1 : trois ronds (à pied, transports en commun, voiture) ; le choisi est émeraude plein, pictogramme blanc ; les autres vert très pâle, pictogramme émeraude. Sous les ronds, la durée totale en cadrans.
- Carte blanche n° 2 (quand l'écran est assez haut, règle actuelle) : la suite des modes du trajet, en petits ronds reliés par des traits, l'identifiant de ligne sous chaque véhicule (41, M1). Elle commence par une petite épingle et finit par un petit drapeau, pour se lire dans les deux sens (spec 006).
- En bas : pilule ✓ émeraude « continuer ».

### E07, E08 — Récapitulatif et détail d'une étape

- En haut : accueil (rond), pilule du chemin, aide.
- Carte : vrai tracé et arrêts en gouttes (système commun).
- Panneau blanc : une ligne par étape (pictogramme du mode au trait, identifiant de ligne, cadran de l'étape, chevron) ; l'étape ouverte prend un fond vert très pâle et montre, sur place, l'arrêt de montée et l'arrêt de descente (pictogrammes, noms D9, bouton écouter rond) ; la carte se cadre sur elle (comportement actuel).
- En bas : cadrans de la durée totale et pilule émeraude « démarrer » (pictogramme de navigation).

### E09 à E20, E22, E23 — Guidage

- **Carte de consigne** en haut à gauche : grande carte blanche arrondie avec le pictogramme de l'étape en émeraude, contour vert « bon chemin ». Selon l'étape :
  - marche : flèche tout droit ; **virage : flèche coudée** (`turn_left`, `turn_right`) avec l'anneau qui se vide à l'approche du coin, en émeraude ;
  - aller à l'arrêt, attendre, à bord (bus, tram) : pictogramme du véhicule, identifiant de ligne officiel, et le nom utile (arrêt de montée, direction, arrêt de descente, comme aujourd'hui) ;
  - métro : le « M » officiel au lieu du pictogramme de véhicule ;
  - descends bientôt : carte pêche, **cloche** orange (`notifications_active`), nom de l'arrêt ;
  - descendu : pictogramme de sortie ; sortir de la station : **escalier** ; marche finale : flèche, puis le lieu d'arrivée annoncé ;
  - **ce qui vient ensuite** : petit pictogramme pâle dans la carte, à côté du grand (comportement actuel).
- Aide en haut à droite ; ⓘ en bas à gauche ; **recentrer** au-dessus du panneau quand la carte a été déplacée.
- **Bouton écouter** : rond blanc au-dessus du panneau, à droite, quand l'étape a un nom de station.
- **Panneau du bas** : pilule blanche avec, à un bout, l'épingle de départ et le cadran du temps restant, à l'autre le drapeau ; entre les deux, des points : **émeraude pour le chemin fait, pâles pour le reste**. Plus de point du voyageur qui glisse.
- Toucher la carte de consigne fait avancer la démo (comportement actuel).

### E21 — Métro sans réseau

- **Thème sombre gardé**, aux couleurs de la famille : fond très sombre chaud, cartes sombres arrondies, accents émeraude.
- En haut : pictogramme orange « pas de réseau », identifiant de ligne (M1), bouton écouter, aide.
- La ligne en suite de stations verticale ; la station de descente en grand, rond émeraude plein, avec son nom (D9).
- En bas : pilule émeraude « je suis descendu » (sortie + ✓).

### E24 — Aide contextuelle

- Fond vert très pâle, fermer (rond) en haut.
- Carte blanche du message en français (D9), puis la petite carte de l'étape en cours (D13).
- En bas : pilule émeraude « écouter » et rond « agrandir » (pictogramme d'agrandissement `open_in_full`, **jamais un « + »**, qui veut dire « ajouter un lieu » à l'accueil). Agrandi : le message prend la place, le rond montre `close_fullscreen`.

### E25 — Problème de connexion

- La carte ; au centre un grand rond blanc avec le pictogramme orange « pas de réseau » ; en bas, pilule émeraude **« réessayer »** avec le pictogramme `refresh` (pas une flèche, qui voudrait dire « suivant ») ; aide.

### E26 — Arrivée

- La carte ; un grand rond blanc bordé d'émeraude dans un halo pâle, avec le pictogramme du lieu (ou sa photo, jamais pour un lieu privé) ; la coche émeraude qui apparaît en rebond (son et vibration actuels) ; pilule émeraude « accueil ».
- Le lieu doit vraiment s'afficher : sur les captures du 2026-11-03, la carte du lieu est vide dans le navigateur ; à vérifier et corriger.

### E27, E28, E29 — Nouveau lieu

- **E27 position** : la carte, le cercle de précision émeraude pâle et le point émeraude au centre, l'épingle d'aperçu ; fermer, aide ; pilule ✓ émeraude.
- **E28 pictogramme** : l'épingle d'aperçu (goutte, spec 009) sur la carte ; panneau blanc avec la grille de **nos 12 pictogrammes de lieux** sur tuiles vert très pâle, la tuile choisie émeraude pleine (pictogramme blanc) ; pilule ✓ pâle tant que rien n'est choisi ; retour, aide.
- **E29 photo** : viseur sombre gardé ; ronds blancs « sans photo », « galerie », déclencheur blanc ; retour, aide.

### E30 — Adresse (accompagnant)

- Fond vert très pâle, fermer (rond), titre et champ de saisie avec l'épingle, suggestions en lignes blanches. Texte autorisé (D8). Mêmes couleurs et arrondis que le reste.

## Changements de comportement

- Guidage : la barre de progression montre le chemin fait par la couleur des points au lieu d'un point qui glisse.
- Aide : le pictogramme « agrandir » change (pas de « + »).
- Connexion : « réessayer » prend le pictogramme `refresh`.
- Bouton d'aide : blanc au lieu de noir, même place et même taille.
- Zone tactile élargie à 64 dp retirée de tous les boutons ronds.

## Défauts du catalogue de maquettes non repris

Horloges à la place des cadrans ; points pâles des pilules hors du guidage ; même carte pour aller à l'arrêt, attendre et être à bord ; icône de bus pour le métro ; flèches droites pour les virages ; flèche → pour « descends » et pour « réessayer » ; « + » pour agrandir ; pictogrammes « ? », bus, drapeau, épingle, « i », marcheur dans la grille des lieux ; marcheur pour la sortie de station ; point de position bleu ; détail d'étape qui chevauche la ligne suivante ; tracé du récapitulatif en lignes droites ; frise des modes sans M1 ; tracé de marche plein ; métro sans réseau en thème clair.

## Signaux

| Information              | Canaux                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| Consigne de l'étape      | pictogramme, couleur de la carte, son et vibration actuels                |
| Virage qui approche      | flèche coudée, anneau qui se vide, son et vibration actuels               |
| Descends bientôt         | carte pêche, cloche orange, son et vibration d'alerte actuels             |
| Bonne direction          | contour vert « bon chemin » de la carte de consigne, point sur le tracé   |
| Avancement du trajet     | points émeraude / pâles entre l'épingle et le drapeau, cadran du temps    |
| Mode de transport choisi | rond émeraude plein, pictogramme blanc, tracé redessiné                   |
| Pas de réseau            | pictogramme orange, fond sombre (E21), son et vibration actuels           |
| Arrivé                   | grand rond du lieu, coche en rebond, son et vibration de réussite actuels |

## Cas limites

| Situation                      | Comportement attendu                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| Lieu sans photo, ou lieu privé | pictogramme, jamais la photo d'un lieu privé (règles existantes)   |
| Écran bas (moins de 700 dp)    | E06 sans la frise des modes (règle actuelle)                       |
| Ligne sans couleur officielle  | couleur de repli actuelle                                          |
| Nom de station long            | sur toute la largeur de la carte de consigne, comme aujourd'hui    |
| Mouvement réduit               | halo et anneau fixes (règles existantes)                           |
| Lecture de droite à gauche     | pilules, barre de progression et frise jamais inversées (spec 006) |
| Grande police système          | seuls les textes D9 grandissent, dans leurs limites actuelles      |

## Données et confidentialité

Aucun changement : rien de nouveau stocké, rien ne quitte le téléphone, aucune nouvelle dépendance ni permission.

## Hors périmètre

- L'état « mauvais sens » du guidage (spec 004) : seule la couleur « bon chemin » est posée.
- Toute nouvelle fonction, tout changement de parcours.
- Le catalogue de maquettes dans le dépôt (décidé : jamais commité).

## Critères d'acceptation

- [ ] Plus aucun bleu d'action dans l'interface du voyageur ; émeraude partout ; couleurs de ligne officielles inchangées.
- [ ] Bouton d'aide blanc, en haut à droite, même taille, sur tous les écrans qui l'avaient.
- [ ] E06, E07, E08 : pilule du chemin avec les lieux choisis ; ronds de mode ; frise avec épingle et drapeau aux bouts ; lignes d'étape ; étape ouverte sur place.
- [ ] Guidage : carte de consigne blanche à contour vert, flèches coudées et anneau aux virages, « M » au métro, cloche orange sur carte pêche pour « descends », escalier pour sortir ; barre du bas avec points faits émeraude et reste pâle, cadran, épingle et drapeau ; écouter et recentrer en ronds.
- [ ] E21 sombre aux accents émeraude ; E24 fond pâle, agrandir sans « + » ; E25 réessayer avec `refresh` ; E26 le lieu s'affiche vraiment ; E27 à E29 et E30 restylés.
- [ ] Cadrans émeraude partout, jamais d'horloge ni de chiffre.
- [ ] Tous les tests existants passent ; vérifié dans le navigateur (390, 360, 320 dp) puis sur le téléphone ; relu par `ux-sans-texte-reviewer`.

## Hypothèses

- Vert « bon chemin » `#2FBF71`, pêche d'alerte `#FDE3D3`, vert très pâle des fonds et tuiles `#EAF4F1`, à ajuster à l'écran.
- La frise des modes (E06) porte une petite épingle au début et un petit drapeau à la fin (la maquette n'en a pas, la spec 006 l'exige pour une suite horizontale).
- Tailles reprises du catalogue, sans zone élargie.

## Questions / réponses

- Virages : flèches coudées et anneau gardés (pas les flèches droites de la maquette).
- Marche : pointillés gardés.
- Vert « bon chemin » : contour de la carte de consigne, nuance plus claire que l'émeraude.
- Pilule du haut (E06, E07) : montre les lieux choisis avec leur badge.
- Guidage : « ensuite » et recentrer gardés, plus petits.
- Découpage : une seule spec pour tous les écrans restants.
- Progression du guidage : points faits en émeraude, reste pâle.
- Métro sans réseau : thème sombre gardé.
- Catalogue de maquettes : jamais commité.
