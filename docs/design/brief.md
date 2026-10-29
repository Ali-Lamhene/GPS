# Brief des maquettes (Claude Design)

Instructions précises, écran par écran, à donner à Claude Design. Mode d'emploi de Claude Design : `guide-claude-design.md`. Inventaire et états : `ecrans.md`. Sources : `references.md`.

**Design system à utiliser** : « GPS sans texte », https://claude.ai/artifact/T8sKnYwYLZy4rM5vR8ZdXF. Il contient les couleurs, la typo, les règles, les photos, les pictogrammes ARASAAC noir et blanc et cinq composants de référence (CarteLieu, BarreTrajet, Confirmation, BoutonAide, EcranAccueil). Toute maquette part de là.

## 0. Message d'ouverture (à coller une fois, au début du canvas)

> Tu vas dessiner les écrans d'une app mobile de navigation à pied pour des personnes réfugiées qui ne savent pas lire.
>
> **Utilise exclusivement le design system « GPS sans texte »** : https://claude.ai/artifact/T8sKnYwYLZy4rM5vR8ZdXF. Lis son README en entier avant de dessiner. Utilise ses tokens (couleurs, rayons, espacements), ses photos et ses pictogrammes **tels quels** (mêmes fichiers). Reprends ses composants (CarteLieu, BarreTrajet, Confirmation, BoutonAide) à l'identique. N'invente aucune image, aucune illustration, aucun pictogramme : s'il en manque un, mets un cadre gris barré et dis-le-moi.
>
> Règles absolues pour les écrans du voyageur (préfixe V) : **aucun texte, aucun chiffre**, nulle part. Pas de barre d'état factice avec l'heure. Artboards de **360 × 800**, interactifs quand je le demande.
>
> Style : signalétique de transport, sérieux et adulte. Fond `ground`, encre `ink`, couleur seulement sur les cadres de lieu. Coins `radius-md` maximum, aucune ombre, aucun dégradé, aucun rebond. Si tu hésites, regarde le composant EcranAccueil du design system.
>
> Organise le canvas en pages : « 1 Accueil », « 2 Trajet », « 3 Guidage », « 4 Préparation », « 5 Web et icône ». Un artboard par état, nommé « V1-b Départ choisi » etc. Une note jaune à côté de chaque écran résume ses comportements (gestes, vibrations, sons).
>
> Je vais te demander les pages une par une. Commence par la page 1.

Ensuite, coller les blocs ci-dessous **un par un**, dans l'ordre, en attendant chaque résultat.

## Conventions de mesure

Écran 360 × 800. Marge haute 40 (barre d'état du téléphone, laissée vide). Marges latérales 16. Écart entre cartes 12. Cible tactile ≥ 64. Contour encre 3. Cadre de lieu 6. « BarreTrajet » = le composant du design system, hauteur totale 172 (40 + 16 + 124 - 8).

---

## Page 1 — Accueil

### V1 Accueil : 5 artboards

```
┌──────────────────────────── 360 ┐
│ (40 vide, barre d'état)       ◌ │ ← symbole préparation, 28, 50 %
│ ┌──────┐   · ·[M]· ·  ┌──────┐ │
│ │DÉPART│               │ARRIV.│ │   BarreTrajet, fond ink
│ └──────┘               └──────┘ │
├─────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ │
│ │   ICI       │ │ photo maison│ │   CarteLieu 158 × 172
│ │  (épingle)  │ │ ◉picto      │ │
│ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ │
│ │photo hôpital│ │ préfecture  │ │
│ │ ◉           │ │ (aplat)     │ │
│ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ │
│ │ photo ami   │ │ pharmacie   │ │
│ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ │ ← rangée COUPÉE par le bas
└─┴─────────────┴─┴─────────────┴─┘
```

> **Page 1, V1 Accueil.** Reprends exactement le composant EcranAccueil du design system. Ordre des lieux : ici (aplat `place-encre`, épingle), maison (photo-maison, `place-ocre`, picto-maison), hôpital (photo-hopital, `place-bleu`, picto-hopital-croix), préfecture (sans photo, aplat `place-jaune`, picto-guichet), chez un ami (photo-ami, `place-mauve`, picto-ami), pharmacie (photo-pharmacie, `place-ciel`, picto-pharmacie-croix), gare (photo-gare, `place-brun`, picto-gare), arrêt de bus (photo-bus, `place-ardoise`, picto-arret-bus). La quatrième rangée est coupée par le bas de l'écran.
>
> Fais 5 artboards :
>
> - **V1-a Aucun lieu** : BarreTrajet vide et estompée (opacité 40 %). À la place de la grille, au centre : picto-ami (180) au-dessus de picto-telephone (96), dans un cadre pointillé `ink` 3px, coins `radius-md`, 240 × 320 : « donne ton téléphone à quelqu'un qui sait lire ». Le symbole de préparation passe à 100 % d'opacité et pulse.
> - **V1-b Grille, rien choisi** : BarreTrajet vide.
> - **V1-c Départ choisi** : « ici » dans la case départ, case arrivée en attente (halo), marqueur disque sur la carte « ici ».
> - **V1-d Lieu juste reçu** : comme V1-b, mais « chez un ami » est en 2e position avec le contour pulsant du composant CarteLieu (état « juste reçu »).
> - **V1-e Barre verticale (variante à comparer)** : la BarreTrajet devient une colonne de 120 de large collée à gauche, départ en bas, arrivée en haut, marcheur qui monte ; la grille passe à une colonne de cartes 196 × 150 à droite.
>
> Rends V1-b interactif : toucher un lieu le place dans la première case vide (vol de la carte vers la case, 200 ms, ease-out) ; toucher une case pleine la vide ; quand les deux cases sont pleines, les cartes de la grille s'estompent (opacité 30 %).

### V2 Lieu reçu : 2 artboards

> **Page 1, V2 Lieu reçu.** Par-dessus V1-b assombri (voile `ink` à 60 %). Reprends le composant Confirmation.
>
> - **V2-a Succès** : carte « chez un ami » 220 × 242 au centre, sceau `success` avec coche en haut à droite. Note : vibration courte + son, puis la carte rétrécit et va se ranger en 2e position de la grille (250 ms).
> - **V2-b Échec** : case pointillée vide 220 × 242 avec épingle grise estompée, sceau `error` avec croix. Note : deux vibrations courtes + son d'erreur, retour à l'accueil après 1,5 s.

---

## Page 2 — Trajet prêt

### V3 Trajet prêt : 6 artboards

```
┌──────────────────────────── 360 ┐
│ BarreTrajet pleine : ICI → HÔPITAL│ 172
├─────────────────────────────────┤
│                            (aide)  │ ← BoutonAide 80, haut droite
│        CARTE SANS TEXTE         │
│   ●━━━━━━━━┓                    │   tracé ink 8, départ disque,
│            ┃                    │   arrivée cible + photo 64
│            ┗━━━━━━━◎[photo]     │ 380
│                                 │
├─────────────────────────────────┤
│  DURÉE (quantité visuelle)      │ 96
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ [marcheur] ──►  (sans texte)│ │ 96, success, pleine largeur
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

> **Page 2, V3 Trajet prêt.** En haut, BarreTrajet pleine : départ « ici », arrivée « hôpital » (état « prête » du composant). En dessous, une **carte sans aucun texte** (pas de noms de rues, pas de numéros) : fond `ground`, rues en traits `line-soft` de 6 à 14px, pâtés de maisons légèrement plus foncés que le fond, un parc en vert très pâle. Tracé à pied : trait `ink` 8px, départ = disque `ink` 24, arrivée = cible `ink` 32 avec la photo de l'hôpital en vignette ronde 64 cerclée `place-bleu`. BoutonAide en haut à droite de la carte. En bas, un grand bouton « partir » pleine largeur (328 × 96, `success`, coins `radius-md`) avec picto-marcheur en blanc suivi d'une flèche blanche épaisse, **sans texte**. Entre la carte et le bouton, la durée du trajet, sans chiffre.
>
> Fais 6 artboards :
>
> - **V3-a Durée en disque** : disque 72 façon minuteur visuel (secteur `ink` = portion d'une heure, ici un quart), à côté de picto-marcheur.
> - **V3-b Durée en pas** : rangée de 1 à 5 empreintes de pas `ink` (ici 2 pleines, 3 vides en contour), une empreinte ≈ 10 minutes.
> - **V3-c Durée en jauge** : barre horizontale 240 × 16, remplie au quart, avec picto-maison à une extrémité et picto-marcheur sur le remplissage.
> - **V3-d Calcul en cours** : carte remplacée par le fond `ground` ; au centre, picto-marcheur qui marche sur place (3 positions), pas de roue de chargement, pas de sablier. Bouton « partir » estompé, non cliquable.
> - **V3-e Pas de réseau** : au centre, pictogramme « pas de réseau » (barres de signal barrées, dessinées en `ink` 6px) dans un disque `error` pâle 160 ; bouton « partir » remplacé par un bouton `ink` 328 × 96 avec l'épingle de BarreTrajet et une flèche de retour vers la barre. Note : vibration double, retour à V1 au toucher.
> - **V3-f Calcul impossible** : même gabarit que V3-e, avec le tracé cassé (deux segments `ink` séparés par une croix `error`).

### V7 Permission de localisation : 2 artboards

> **Page 2, V7 Permission.** Avant la fenêtre système du téléphone.
>
> - **V7-a Demande** : au centre, un téléphone dessiné en contour `ink` 4px (160 × 300) qui affiche une mini carte et l'épingle de position ; sous l'épingle, des ondes concentriques. En dessous, un faux bouton système (rectangle `surface` 200 × 56, contour `ink`) entouré d'un halo `success` qui pulse : « c'est là qu'il faut toucher ». Aucune main dessinée.
> - **V7-b Refusée** : le même téléphone, l'épingle barrée en `error`, et en bas le BoutonAide en grand (120) : « appelle quelqu'un ». Note : vibration double.

---

## Page 3 — Guidage

### V4 Guidage : 5 artboards

```
┌──────────────────────────── 360 ┐
│ BarreTrajet = jauge de progrès  │ 172  le marcheur avance
│ ICI ····[M]············ HÔPITAL   │      selon la progression
├─────────────────────────────────┤
│ [stop]                    (aide)   │ 64 + BoutonAide
│                                 │
│           ╭───────╮             │
│           │   ▲   │             │  disque 240, flèche 160
│           │   ┃   │             │  success / error
│           ╰───────╯             │
│                                 │
├─────────────────────────────────┤
│   bandeau carte, tracé, moi ●   │ 200
└─────────────────────────────────┘
```

> **Page 3, V4 Guidage.** La BarreTrajet du haut sert de **jauge de progression** : le marcheur est posé sur la piste à la position atteinte (ici 30 %), la piste parcourue est pleine, le reste en pointillé. Sous la barre, à gauche, un bouton « arrêter » (carré `ink` plein 28 dans un disque `surface` 64 cerclé `ink`, comme un bouton stop de lecteur vidéo) ; à droite, le BoutonAide. Au centre, un disque 240 cerclé 8px avec une flèche épaisse 160 (trait 28, extrémité large). En bas, un bandeau de carte 360 × 200, même style que V3, avec ma position (disque `ink` 20 dans un halo) et le tracé restant.
>
> Fais 5 artboards :
>
> - **V4-a Bonne direction** : disque cerclé `success`, flèche droite vers le haut, `success`. Note : vibration douce régulière, pas de son.
> - **V4-b Mauvaise direction** : tout l'écran entouré d'un cadre `error` 12px ; flèche demi-tour (U) `error`. Note : 3 vibrations courtes + son d'alerte.
> - **V4-c Tourner à gauche bientôt** : flèche courbe vers la gauche `ink` ; un arc de progression autour du disque se remplit quand le virage approche. Note : vibration longue + courte, qui s'intensifie à l'approche.
> - **V4-d Recherche du GPS** : flèche estompée (opacité 30 %), épingle avec ondes qui pulsent au centre du disque. Note : pas de vibration de direction.
> - **V4-e Presque arrivé** : la photo de l'hôpital grandit et remplace le disque (240 × 240, cadre `place-bleu` 6px), une petite flèche `success` en pastille. Note : motif de vibration « approche ».

### V5 Arrivé : 1 artboard

> **Page 3, V5 Arrivé.** Photo de l'hôpital en plein écran sous la marge haute (360 × 600), cadre `place-bleu` 12px, sceau `success` 120 avec coche au centre bas de la photo. En dessous, un bouton `ink` 328 × 96 avec, en blanc, une mini grille de 4 cartes (retour à mes lieux). Note : motif de vibration d'arrivée + son propre ; retour automatique après 30 s.

### V6 Aide : 1 artboard

> **Page 3, V6 Aide.** Par-dessus V4-a assombri (voile `ink` 70 %), une feuille `ground` qui occupe les 2/3 bas de l'écran, coins hauts `radius-md`. Au centre, la photo de l'accompagnateur (silhouette du composant BoutonAide) en disque 160 cerclé `ink` 4px. En dessous, un énorme bouton d'appel : disque `success` 120 avec un combiné blanc. En bas, un bouton `surface` cerclé `ink` 328 × 80 qui montre une mini BarreTrajet : « revenir au trajet ».

---

## Page 4 — Préparation (texte en français autorisé)

Typo Atkinson Hyperlegible Next, corps 17. Mêmes couleurs, fond `ground`, encre `ink`. Boutons principaux `ink` plein, texte `on-ink`, 56 de haut. Boutons secondaires contour `ink` 2px. Pas d'icônes décoratives.

```
P1 Liste                     P2 Placer                    P3 Apparence
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ ← Retour   Lieux │         │ ← Placer le lieu │         │ ← Apparence      │
│ [+ Ajouter un lieu]        │ [Adresse…        ]│         │ ┌──────┐ aperçu  │
│ [Envoyer à distance]       │  suggestions     │         │ │carte │ en      │
│ ─────────────────│         │ ┌──────────────┐ │         │ └──────┘ direct  │
│ ▣ maison   [M][P][S] │         │ │   CARTE      │ │         │ Pictogramme      │
│ ▣ hôpital  [M][P][S] │         │ │      (o)     │ │         │ ▦▦▦▦ (grille)    │
│ ▣ préfect. [M][P][S] │         │ └──────────────┘ │         │ Couleur ●●●●●●●● │
│ …                │         │ © OpenStreetMap  │         │ Photo [Prendre]  │
│ À propos         │         │ [   Suivant    ] │         │ [  Enregistrer  ]│
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

> **Page 4, Préparation.** 5 écrans, 360 × 800, en français, vouvoiement, phrases courtes.
>
> - **P1 Liste des lieux** : en-tête « Retour » (flèche + mot) à gauche, titre « Lieux ». Deux boutons pleine largeur : « Ajouter un lieu » (`ink`) et « Envoyer un lieu à distance » (contour). Puis la liste : vignette 64 (photo ou pictogramme sur sa couleur, cadre couleur 4px), puis trois boutons icône 48 avec libellé dessous : « Modifier », « Partager », « Supprimer ». Lien « À propos et crédits » en bas. États : **P1-a** avec 6 lieux, **P1-b** vide (« Aucun lieu. Ajoutez la maison en premier. »), **P1-c** confirmation de suppression (feuille du bas : « Supprimer ce lieu ? La photo sera effacée du téléphone. » + « Supprimer » `error` + « Annuler »).
> - **P2 Placer le lieu** : champ de recherche « Adresse » en haut ; sous lui, 3 suggestions (adresses réalistes à Paris) ; carte plein écran avec un repère `ink` déplaçable et le texte d'aide « Touchez la carte ou déplacez le repère pour viser l'entrée. » ; attribution « © OpenStreetMap » en bas à droite ; bouton « Suivant ». États : **P2-a** saisie avec suggestions, **P2-b** repère posé, **P2-c** aucun résultat (« Aucune adresse trouvée. Touchez la carte pour placer le lieu. »), **P2-d** pas de réseau (« Pas de connexion. La recherche et la carte ont besoin d'internet. » + « Réessayer »).
> - **P3 Apparence du lieu** : en haut, **aperçu en direct** de la CarteLieu telle que le voyageur la verra (158 × 172). Section « Pictogramme » : grille de 4 colonnes de tous les pictogrammes du design system avec leur libellé (« Maison », « Hôpital (croix) », « Hôpital (croissant) »…), le choisi entouré `ink` 3px. Section « Couleur » : 8 disques 44 des couleurs `place-*`, la choisie avec une coche. Section « Photo » : boutons « Prendre une photo » et « Choisir dans la galerie », conseil « Depuis le trottoir, face à l'entrée. » Bouton « Enregistrer ». Variante **P3-b Envoyer à distance** : pas de section photo, bouton « Partager le lien ».
> - **P4 Partager** : aperçu de la carte du lieu, phrase « La personne doit avoir l'app installée. La photo n'est pas envoyée. », bouton « Partager » qui montre la feuille de partage Android (WhatsApp, SMS, Gmail).
> - **P5 À propos et crédits** : sections « Confidentialité » (« Rien ne quitte ce téléphone, sauf la recherche d'adresse et la carte. »), « Pictogrammes » (crédit ARASAAC complet), « Cartes » (OpenStreetMap, OpenFreeMap), « Photos d'exemple » (crédits du groupe Photos).

---

## Page 5 — Web et icône

> **Page 5.**
>
> - **W1 Page du lien sans l'app** (360 × 800, page web mobile) : fond `ground`, icône de l'app 120 au centre haut. Schéma en 2 temps, de haut en bas (pas de gauche à droite) : 1) l'icône de l'app avec une flèche vers le bas dans un téléphone (installer), 2) une bulle de discussion avec un lien souligné et un halo (retoucher le lien). En bas, un grand bouton `ink` avec le logo du store (Play Store sur Android) et un bouton contour « Ouvrir l'app ». Aucun texte sauf le nom du store sur son logo.
> - **S1 Icône** : 3 propositions à 512 et à 48 px. Fond `ink`, épingle `ground` avec un marcheur, ou une case départ et une case arrivée reliées par des pointillés. Distincte de Google Maps (épingle multicolore) et de Waze (bulle). Aucune lettre.

---

## Revue

Après chaque page, envoie-moi le lien du canvas. Je relis chaque artboard avec l'agent `ux-sans-texte-reviewer` et la liste noire du design system, puis je te donne les corrections à coller dans Claude Design.
