# 014 — Barres système d'Android et pictogramme clavier

- **Statut** : livré
- **Date** : 2026-11-04
- **Persona** : voyageur (tous les écrans), accompagnant (bouton d'adresse)
- **Révise** : spec 011 (pictogramme du bouton de l'accompagnant), spec 013

## Besoin

Sur le téléphone de l'utilisateur :

1. La barre de navigation d'Android (boutons ◁ ○ □ ou trait des gestes) passe par-dessus la carte : l'app dessine dessous (« bord à bord », imposé depuis Android 15).
2. La barre du haut (heure, batterie, réseau) n'est pas visible : ses icônes se perdent sur la carte. Le voyageur doit la voir, comme dans toute autre app.
3. Le pictogramme « deux personnes » du bouton de l'accompagnant parle moins qu'un **clavier** : ce bouton ouvre le formulaire où l'on tape une adresse.

## Parcours

1. Sur **tous les écrans**, le contenu de l'app (carte, panneaux, boutons) s'arrête sous la barre du haut et au-dessus de la barre du bas. Rien de l'app ne passe sous une barre système.
2. Derrière les deux barres, une bande **blanc chaud** (couleur des panneaux), avec des icônes système **foncées** : l'heure, la batterie et le réseau sont lisibles en haut ; les boutons ou le trait de navigation en bas.
3. La règle vaut aussi avec la navigation par gestes : l'app s'arrête au-dessus du trait.
4. Écrans sombres (métro hors connexion E21, photo du nouveau lieu E29) : les bandes prennent la couleur sombre de l'écran, avec des icônes système claires.
5. Le bouton de l'accompagnant (colonne de l'accueil, spec 013) montre un **clavier** (`keyboard`) au lieu de deux personnes. Même taille, même place, même action (formulaire d'adresse E30).

## Signaux

Inchangés.

## Cas limites

| Situation                                        | Comportement attendu                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| Téléphone en mode sombre                         | bandes blanc chaud et icônes foncées quand même (l'app reste claire) |
| Téléphone sans barre du bas (rare)               | pas de bande en bas ; le contenu va jusqu'au bord                    |
| Encoche ou caméra dans l'écran                   | la bande du haut couvre toute la hauteur de la barre d'état          |
| Passage d'un écran clair à E21 ou E29, et retour | les bandes et les icônes changent avec l'écran                       |
| Navigateur (développement)                       | aucun changement visible (pas de barres système)                     |

## Données et confidentialité

Aucune donnée, permission ni appel réseau. Aucune nouvelle dépendance prévue : `expo-status-bar` (déjà installé) règle les icônes de la barre du haut. Si les boutons de la barre du bas restent clairs sur le blanc chaud, il faudra `expo-navigation-bar` : nouvelle dépendance native, donc nouvelle build de dev et relecture `security-reviewer`, à décider avec l'utilisateur à ce moment.

## Hors périmètre

- Masquer les barres système (mode plein écran).
- Le reste du dessin des écrans.

## Critères d'acceptation

- [ ] Sur le téléphone de l'utilisateur, aucun élément de l'app sous la barre du bas ni sous la barre du haut, sur l'accueil, le choix du transport, le récapitulatif, le guidage, l'aide et l'arrivée.
- [ ] Heure, batterie et réseau lisibles en haut ; boutons ou trait de navigation lisibles en bas, sur bande blanc chaud.
- [ ] E21 et E29 : bandes sombres, icônes claires.
- [ ] Bouton de l'accompagnant avec le pictogramme clavier.
- [ ] Un test vérifie que les écrans ne reçoivent plus de marge haute ni basse des barres (le cadre les absorbe).
- [ ] Relu par `ux-sans-texte-reviewer`.

## Hypothèses

- Un seul cadre autour de toute l'app (dans `src/app/_layout.tsx`) peint les bandes et retire les marges des barres pour les écrans : leurs propres marges de sécurité tombent à zéro en haut et en bas, sans toucher à leur code.
- Le pictogramme `keyboard` de Material Symbols ne contient pas de lettres.

## Ajustements après la relecture `ux-sans-texte-reviewer` (2026-11-04)

- Limite connue : `expo-status-bar` ne règle que la barre du haut. Les boutons ou le trait de la barre du bas suivent le thème du téléphone (`userInterfaceStyle: "automatic"`). Téléphone en mode sombre : boutons clairs sur la bande blanc chaud, peu visibles. E21 et E29 : boutons foncés sur la bande sombre. Validé tel quel sur le téléphone de l'utilisateur (mode clair). Correction possible, avec une nouvelle build de dev : `userInterfaceStyle: "light"` et, pour E21 et E29, `expo-navigation-bar` (relecture `security-reviewer`). À décider avec l'utilisateur.
- Un écran sombre qui perd le premier plan ne rend les bandes au blanc chaud que si aucun autre écran sombre ne les a prises.
- À tester sur le terrain : bouton retour retrouvé en mode sombre ; le clavier compris comme « pas pour moi » ; limite entre bande blanc chaud et panneaux au soleil.

## Questions / réponses

- Barre gênante : celle du bas ; la barre du haut doit aussi devenir visible.
- Navigation par gestes : l'app s'arrête aussi avant le trait.
- Couleur des bandes : blanc chaud.
- Portée : tous les écrans.
- Bouton de l'accompagnant : pictogramme clavier.
