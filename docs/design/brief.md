# Brief pour les maquettes (Claude Design)

À coller au début de chaque session Claude Design, avant les prompts par écran. Sources : `ecrans.md` (inventaire), `references.md` (recherches), `../product/principes.md`, `../product/decisions.md`.

## Contexte à donner à Claude Design

> Application mobile de navigation GPS pour des personnes réfugiées qui **ne savent pas lire**. Deux interfaces :
>
> 1. **Voyageur** : aucun texte, aucun chiffre, nulle part (y compris badges, heures, distances). Le sens passe par des photos, des pictogrammes ARASAAC, la couleur, la forme, le mouvement, le son et la vibration.
> 2. **Préparation** : utilisée par un travailleur social ou un ami qui sait lire, en français, pour créer des lieux. Texte autorisé.
>
> Le voyageur possède une collection de **lieux** (maison, hôpital, préfecture, chez un ami). Chaque lieu est une carte : photo + pictogramme + couleur. Il compose un trajet en choisissant un départ et une arrivée, puis il est guidé à pied.
>
> Téléphone cible : Android d'entrée de gamme, écran 360 × 800 dp, utilisé dehors, au soleil, d'une main, en marchant, parfois sous stress.

## Direction visuelle

**Idée directrice : la signalétique, pas l'« appli ».** S'inspirer des panneaux des gares, des aéroports et des hôpitaux (pictogrammes ISO 7001, AIGA/DOT) : aplats de couleur pleine, contours noirs épais, formes simples, contraste fort, rien de décoratif. Les pictogrammes ARASAAC (contour noir, aplats) s'y intègrent naturellement.

- **Fond** : blanc cassé chaud, lisible au soleil. Thème clair fixe pour le voyageur (les repères visuels ne doivent jamais changer).
- **Encre** : quasi-noir pour les contours et formes.
- **Cartes de lieu** : plaques rectangulaires aux coins légèrement arrondis ; photo plein cadre ; **cadre épais** (≥ 6 dp) de la couleur du lieu ; pastille ronde blanche cerclée de noir avec le pictogramme, dans un coin. Sans photo : pictogramme grand, sur aplat de la couleur du lieu.
- **Couleurs des lieux** : 8 couleurs distinctes pour les daltoniens (base Okabe-Ito : orange, bleu ciel, bleu, jaune, pourpre, brun, gris-bleu, noir). Elles ne doivent **pas** ressembler au vert « succès / bonne direction » ni au rouge « erreur / mauvaise direction », réservés aux états.
- **États** : vert = succès / bonne direction, rouge = erreur / mauvaise direction, toujours accompagnés d'une **forme** (coche, croix, flèche) et d'un motif de vibration.
- **Cibles tactiles** : ≥ 64 dp pour le voyageur, idéalement une carte de lieu ≈ moitié de la largeur de l'écran.
- **Typographie (préparation et page web)** : Atkinson Hyperlegible Next. Corps ≥ 17 sp.
- **Mouvement** : court et utile (coche qui se trace, carte qui grandit, cadre qui pulse). Pas d'animation décorative.
- **Contenu des maquettes** : vraies photos de lieux français ordinaires (entrée d'hôpital, façade de préfecture, porte d'immeuble, pharmacie à croix verte). Pas de photos de banque d'images avec des gens souriants.

## Liste noire (rendu générique d'IA)

Refuser toute maquette qui contient :

- dégradés (surtout violet / bleu), effet verre dépoli, néons, flous décoratifs ;
- ombres portées molles sur chaque carte, coins très arrondis partout, tout identique ;
- émojis utilisés comme icônes ; icônes « étincelle » ou « IA » ;
- illustrations 3D, personnages de type Memoji, formes organiques (« blobs ») en décor ;
- Inter, Poppins ou la police système par défaut sans choix ;
- menu hamburger, onglets en bas, barre de recherche chez le voyageur ;
- petit texte gris secondaire, libellés sous les icônes, badges avec des chiffres, heures, distances, pourcentages chez le voyageur ;
- drapeaux pour les langues, mains (pouce levé, OK), symboles religieux non choisis, police, uniformes ;
- squelettes de chargement scintillants, sabliers, roues de chargement avec pourcentage ;
- contenu factice anglais (« John Doe », « Lorem ipsum », « Welcome back! »).

## Prompts par écran

Format : un écran par demande, cadre 360 × 800, tous les états listés côte à côte.

### V1 — Accueil (mes lieux + barre de trajet)

> Écran d'accueil du voyageur, sans aucun texte ni chiffre. En haut, une barre de trajet : deux grandes cases (départ, arrivée) reliées par une **flèche animée** qui va du départ vers l'arrivée. Départ et arrivée se distinguent aussi par un marqueur (point de départ / cible d'arrivée), pas seulement par leur position : une partie des voyageurs lit l'ordre de droite à gauche. Geste principal : **toucher** un lieu (il vole vers la première case vide) ; glisser reste possible. La grille ne doit pas faire croire qu'elle est finie : la dernière rangée visible est **coupée** par le bord de l'écran pour montrer qu'il y a d'autres lieux dessous. En dessous, une grille de cartes de lieux sur deux colonnes, qui défile : 1) maison avec photo de porte d'immeuble, cadre orange, pastille maison ARASAAC ; 2) hôpital avec photo d'entrée d'hôpital, cadre bleu, pastille hôpital ; 3) préfecture sans photo, pictogramme guichet sur aplat jaune ; 4) chez un ami, photo de façade, cadre pourpre ; 5) pharmacie, photo à croix verte, cadre bleu ciel ; 6) gare sans photo, aplat brun. Un lieu spécial « ici » (pastille position) en premier. Dans un coin, un petit symbole discret pour l'accès préparation.
> États à montrer : a) aucun lieu (visuel d'attente, pas de grille) ; b) grille normale, cases vides ; c) départ rempli (« ici »), arrivée vide, la case arrivée invite au toucher ; d) un lieu juste reçu, cadre qui pulse.
> Variante à comparer : barre de trajet **verticale** (départ en bas, arrivée en haut) au lieu d'horizontale.

### V2 — Lieu reçu

> Superposition sur l'accueil : la carte du lieu reçu apparaît en grand au centre, puis **va se ranger** à sa place dans la grille (le résultat se voit, il n'est pas seulement symbolisé). Une coche verte en renfort, avec vibration et son. États : a) succès ; b) lien illisible : aucune carte, signe d'échec (forme + rouge), double vibration. Les coches et croix seules sont mal comprises par ce public : elles ne doivent jamais être le seul signal.

### V3 — Trajet prêt

> Sans texte ni chiffre. Carte OpenStreetMap avec le tracé à pied (trait épais), photo du départ et de l'arrivée aux deux bouts. Pictogramme marche. La durée montrée comme une quantité visuelle (proposer 3 options : disque qui se vide façon minuteur visuel, rangée de pas, jauge). Très grand bouton « partir » (forme flèche, vert). États : a) calcul en cours ; b) trajet prêt ; c) pas de réseau (pictogramme réseau barré, retour) ; d) calcul impossible.

### V4 — Guidage

> Sans texte ni chiffre. Le guidage repose sur la flèche, la vibration et le son ; la carte n'est qu'un bandeau de réassurance (les cartes sont peu familières à ce public). Grande flèche de direction au centre, jauge de progression vers l'arrivée (photo de l'arrivée au bout), bandeau de carte en bas avec tracé et position. Bouton d'aide (photo de l'accompagnateur) en haut, toujours au même endroit ; bouton arrêter. États : a) bonne direction (vert) ; b) mauvaise direction (rouge, flèche demi-tour) ; c) tourner à gauche ; d) recherche du GPS ; e) presque arrivé.

### V5 — Arrivé

> Photo de l'arrivée en très grand, cadre de sa couleur, animation de réussite, grand bouton retour à l'accueil (pictogramme maison de l'app, pas le lieu maison).

### V6 — Aide

> Photo de l'accompagnateur en grand, très grand bouton appel vert (combiné téléphonique), bouton fermer.

### V7 — Permission de localisation

> Avant la fenêtre système : illustration du téléphone qui montre sa position sur une carte, et un geste qui touche « Autoriser ». État refusé : schéma du chemin vers les réglages, et bouton d'aide.

### P1 à P5 — Préparation (français)

> Interface sobre et fonctionnelle, Atkinson Hyperlegible Next, mêmes couleurs que l'app. P1 liste des lieux (vignette, couleur, actions modifier / partager / supprimer, boutons « Ajouter un lieu » et « Envoyer un lieu à distance », « Retour » toujours visible). P2 recherche d'adresse + carte plein écran avec repère déplaçable, attribution OpenStreetMap. P3 apparence : grille de pictogrammes avec libellés (variantes croix / croissant pour les lieux de soin), palette de 8 couleurs, photo avec conseil « prenez la photo depuis le trottoir, face à l'entrée », **aperçu en direct de la carte du voyageur**. P4 partage avec rappel « la photo n'est pas envoyée ». P5 crédits ARASAAC et OpenStreetMap.

### W1 — Page web du lien

> Page web mobile sans texte autant que possible : icône de l'app, grand bouton store, schéma en 2 temps (installer, puis retoucher le lien), bouton « ouvrir l'app ».

### S1 — Icône

> Icône d'app sans texte, distincte de Google Maps et Waze, lisible à 48 px. Explorer : maison + chemin, pastille de lieu + flèche.

## Revue des maquettes

Chaque maquette passe par l'agent `ux-sans-texte-reviewer` et par la liste noire ci-dessus avant d'être retenue.
