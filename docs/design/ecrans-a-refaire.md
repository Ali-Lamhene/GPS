# Écrans à refaire selon la direction émeraude

> **Document à donner à l'IA de maquettes** : `ecrans-actuels.pdf` (consignes, maquette de référence, captures de chaque écran tel qu'il est codé au 2026-11-03). Ce fichier-ci en est la version texte détaillée.

État au 2026-11-03. L'accueil est refait (spec 009, maquette `maquette-emeraude.png`). Ce document liste les écrans qui gardent encore l'interface bleue « clair premium » (spec 008). Pour chacun d'eux, une maquette est attendue ; chaque maquette donnera lieu à une spec (skill `feature`) avant le code.

## Comment fournir les maquettes

- **Un fichier par écran** (ou par état quand il est indiqué), au format portrait d'un téléphone, déposé dans `docs/design/` sous le nom donné dans chaque fiche (par exemple `maquette-transport.png`).
- **Même famille que l'accueil** : carte crème sans aucune étiquette, accent émeraude unique, blancs chauds, formes arrondies, ombres douces, pictogrammes Material Symbols au trait.
- **Zéro texte, zéro chiffre** pour le voyageur. Seules exceptions (D9) : identifiants de ligne (`C3`, `T2`, `M1`), noms réels des stations et arrêts, message d'aide en français destiné au passant, crédit ⓘ replié.
- **La carte est déjà en place** sur tous les écrans qui en ont une (crème, parcs verts, eau bleue, point de position émeraude) : la maquette peut la reprendre telle quelle.
- **Tailles** : les boutons et éléments gardent la taille dessinée dans la maquette, sans zone tactile élargie (D15).
- **Sens de lecture** (spec 006) : rien ne doit se lire seulement de gauche à droite. Le départ et l'arrivée se reconnaissent à leur symbole (épingle, drapeau), « maintenant » et « ensuite » à leur taille ou leur pâleur, pas à leur place.
- Les numéros `E06`… sont ceux de `docs/screens.md` ; ils ne doivent jamais apparaître dans l'interface.

## Vue d'ensemble

| Priorité | Écran                                         | Numéros             | Fichier attendu                            |
| -------- | --------------------------------------------- | ------------------- | ------------------------------------------ |
| 1        | Guidage (à pied, bus / tram, métro)           | E09 à E20, E22, E23 | `maquette-guidage-<état>.png` (voir fiche) |
| 2        | Choix du moyen de transport                   | E06                 | `maquette-transport.png`                   |
| 3        | Récapitulatif du trajet et détail d'une étape | E07, E08            | `maquette-recapitulatif.png`, `…-etape`    |
| 4        | Arrivée à destination                         | E26                 | `maquette-arrivee.png`                     |
| 5        | Aide contextuelle (message pour un passant)   | E24                 | `maquette-aide.png`                        |
| 6        | Métro sans réseau                             | E21                 | `maquette-metro-hors-connexion.png`        |
| 7        | Problème de connexion                         | E25                 | `maquette-connexion.png`                   |
| 8        | Nouveau lieu : position, pictogramme, photo   | E27, E28, E29       | `maquette-nouveau-lieu-<étape>.png`        |
| 9        | Adresse d'un nouveau lieu (accompagnant)      | E30                 | `maquette-adresse.png`                     |

La priorité suit l'usage : le guidage est l'écran que le voyageur regarde le plus longtemps. L'ordre peut changer à ta guise.

Déjà fait : accueil E01 à E05, feuille « tous les lieux » (E02, E04).

---

## 1. Guidage — E09 à E20, E22, E23

Un seul écran dont le contenu change à chaque étape du trajet. C'est le cœur de l'app.

**Aujourd'hui** : carte centrée sur le voyageur (point, cône de direction, tracé) ; en haut, la consigne dans une pilule sombre (orange pour « descends ») avec le grand pictogramme de l'étape et, pour un virage, une flèche dans un anneau vert qui se vide à l'approche ; en bas, une carte de progression flottante (barre du trajet aux deux bouts marqués, cadrans de durée restante, bouton écouter quand il y a un nom de station) ; bouton d'aide toujours en haut à droite.

**Doit montrer** :

- la consigne du moment, en grand, sur au moins deux canaux (pictogramme + couleur ; le son et la vibration existent déjà) ;
- ce qui vient ensuite, plus petit ou plus pâle ;
- la progression du trajet, aux deux bouts marqués par leur symbole, jamais inversée ;
- le temps restant en cadrans (un cadran par heure commencée, jamais de chiffres) ;
- le bouton d'aide, toujours au même endroit ;
- pour bus, tram, métro : l'identifiant de ligne dans ses couleurs officielles, et le nom de la station avec un bouton pour l'écouter.

**États à dessiner** (un fichier chacun, ou une planche qui les regroupe) :

| État                         | Fichier suggéré                 | Ce qui change                                            |
| ---------------------------- | ------------------------------- | -------------------------------------------------------- |
| Marcher tout droit           | `maquette-guidage-marche.png`   | état de base                                             |
| Virage à gauche / à droite   | `maquette-guidage-virage.png`   | flèche du virage, signal d'approche du coin              |
| Arriver à l'arrêt de bus     | `maquette-guidage-arret.png`    | pictogramme bus / tram, ligne                            |
| Attendre le bus              | `maquette-guidage-attente.png`  | ligne en grand, direction (nom du terminus)              |
| À bord                       | `maquette-guidage-a-bord.png`   | arrêts qui défilent, arrêt de descente                   |
| Descendre bientôt (alerte)   | `maquette-guidage-descends.png` | alerte forte, distincte de tout le reste                 |
| Descendu, reprendre à pied   | `maquette-guidage-descendu.png` | sortie du véhicule, suite à pied                         |
| Métro : entrée, quai, à bord | `maquette-guidage-metro.png`    | « M » officiel, ligne, station                           |
| Sortir de la station         | `maquette-guidage-sortie.png`   | escalier, vers la surface                                |
| Marche finale vers le lieu   | `maquette-guidage-final.png`    | le lieu d'arrivée (photo ou pictogramme) annoncé ensuite |

**À trancher dans la maquette** : la nuance de vert qui dit « tu es sur le bon chemin », distincte de l'émeraude des boutons (décidé : un autre vert) ; la couleur de l'alerte « descends » (aujourd'hui orange).

## 2. Choix du moyen de transport — E06

**Aujourd'hui** : le trajet tracé sur la carte ; trois grands choix exclusifs (à pied, transports en commun, voiture), le choix redessine le tracé et met à jour la durée ; une frise des modes successifs (à pied → bus → à pied) ; une pilule ✓ pour continuer ; un bouton retour ; aide en haut à droite ; rappel du départ et de l'arrivée en haut.

**Doit montrer** : les trois modes, celui choisi bien visible ; la durée totale en cadrans ; la suite des modes du trajet ; continuer ; retour ; aide.

**Fichier** : `maquette-transport.png`.

## 3. Récapitulatif du trajet et détail d'une étape — E07, E08

**Aujourd'hui** : la carte du trajet entier ; une liste d'étapes (pictogramme du mode, identifiant de ligne, cadran de durée par étape) ; toucher une étape l'ouvre (photo de l'arrêt, nom de la station à écouter) et la carte se cadre dessus ; un bouton pour démarrer le guidage ; retour à l'accueil ; aide.

**Doit montrer** : les étapes dans l'ordre, une étape ouverte à la fois, la durée de chaque étape et du total, démarrer.

**Fichiers** : `maquette-recapitulatif.png` (liste fermée) et `maquette-recapitulatif-etape.png` (une étape ouverte).

## 4. Arrivée à destination — E26

**Aujourd'hui** : la carte montre le voyageur sur l'épingle du lieu ; une carte met le lieu atteint en vedette (photo, ou pictogramme) avec un sceau vert qui apparaît en rebond, un son et une vibration de réussite ; un bouton pour revenir à l'accueil.

**Doit montrer** : une confirmation forte et rassurante, le lieu atteint, le retour à l'accueil. Un lieu privé (maison, famille) ne montre jamais sa photo.

**Fichier** : `maquette-arrivee.png`.

## 5. Aide contextuelle — E24

Plein écran, au-dessus de l'étape en cours ; le voyageur le montre à un passant.

**Aujourd'hui** : un court message en français adapté à l'étape (exception D9), une petite carte de la seule étape en cours (jamais le reste du trajet ni l'adresse d'un lieu privé, D13), un bouton pour le lire à voix haute, un bouton pour agrandir le texte, un bouton pour fermer.

**Doit montrer** : le message bien lisible pour un passant, la petite carte, écouter, agrandir, fermer évident. Prévoir aussi l'état agrandi (`maquette-aide-agrandi.png`).

**Fichier** : `maquette-aide.png`.

## 6. Métro sans réseau — E21

**Aujourd'hui** : écran sombre et calme sous terre ; la ligne dessinée comme une suite de stations (depuis le trajet enregistré), la station de descente en grand avec son nom et un bouton écouter, l'identifiant de ligne, un bouton « je suis descendu » que le voyageur touche lui-même, l'aide.

**Doit montrer** : que le réseau manque, sans texte ; où descendre ; écouter le nom ; confirmer la descente ; aide. Garder un thème sombre ou non : à décider avec la maquette.

**Fichier** : `maquette-metro-hors-connexion.png`.

## 7. Problème de connexion — E25

**Aujourd'hui** : un nouveau trajet demande internet et il n'y en a pas ; la carte embarquée montre quand même où est le voyageur ; un panneau avec un pictogramme « pas de réseau » et une seule action, réessayer (qui revient à l'écran précédent pour retenter) ; aide.

**Doit montrer** : l'absence de réseau sans texte, réessayer, aide.

**Fichier** : `maquette-connexion.png`.

## 8. Nouveau lieu — E27, E28, E29

Ouvert depuis le « + » de l'accueil : le voyageur garde l'endroit où il se trouve.

- **E27, position** : la carte avec la position actuelle au centre et son cercle de précision ; confirmer ou annuler. Fichier `maquette-nouveau-lieu-position.png`.
- **E28, pictogramme** : une grille de pictogrammes (maison, santé, démarches, études, travail, courses, loisirs…) sur la carte de l'endroit ; l'aperçu de l'épingle montre le choix ; continuer quand un pictogramme est choisi. Fichier `maquette-nouveau-lieu-pictogramme.png`.
- **E29, photo** : un viseur pour photographier le lieu (facultatif), prendre la photo ou passer. Fichier `maquette-nouveau-lieu-photo.png`.

## 9. Adresse d'un nouveau lieu (accompagnant) — E30

Côté accompagnant, ouvert par un appui de 3 secondes sur le « + » : **le texte y est autorisé** (D8).

**Aujourd'hui** : un champ pour taper l'adresse, des suggestions, fermer ; ensuite le voyageur choisit le pictogramme et la photo (E28, E29).

**Doit montrer** : le champ, les suggestions, valider, fermer. Peut rester plus sobre que les écrans du voyageur, mais dans la même famille visuelle.

**Fichier** : `maquette-adresse.png`.
