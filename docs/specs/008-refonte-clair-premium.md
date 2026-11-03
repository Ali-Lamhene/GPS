# 008 — Refonte visuelle « clair premium »

- **Statut** : livré
- **Partie visuelle remplacée par** : D15, maquette émeraude (2026-11-03)
- **Date** : 2026-11-02
- **Persona** : voyageur (toute l'interface), accompagnant pour ses écrans (E30)

Révise la spec 005 (départ par défaut, formes), la spec 007 (accueil, place du « + », couleurs) et remplace la maquette v7 (D11) comme référence visuelle. Référence : le labo `/dev/ui-lab`, écran « Accueil 2 », validé par l'utilisateur le 2026-11-02.

## Besoin

L'utilisateur trouve que l'app fait « maquette, mockup non fini » : chaque écran a son propre langage (rayons, panneaux, couleurs), les écrans sont vides et sans élément central, les pictogrammes sont posés à nu, la carte beige est trop chargée et les couleurs pâles semblent fades. Après l'analyse de 9 kits d'apps de navigation (Envato) et un labo de trois écrans témoins, il a retenu une direction **« clair premium »**, avec des pictogrammes **plats** (pas d'illustrations 3D) sur des **couleurs vives**.

Le voyageur doit aussi comprendre **quoi faire** en arrivant sur l'accueil : rien n'est choisi d'avance, l'app l'invite à choisir le départ, puis l'arrivée.

## Système visuel (toute l'app)

1. **Carte gris perle** : fond gris froid désaturé, routes blanches, eau et parcs pâles, sans aucun libellé. Seuls l'itinéraire et les marqueurs portent de la couleur. Elle remplace la carte beige de la spec 002 partout.
2. **Cartes flottantes** : tout panneau posé sur la carte est une carte blanche détachée des bords (marge de 14 dp), aux coins arrondis à 28 dp, avec une grande ombre douce. Plus de panneau collé au bord de l'écran.
3. **Boutons** :
   - action principale : pilule bleue pleine largeur, 64 dp de haut, bouts ronds, ombre bleutée ;
   - action secondaire (annuler, retour) : disque blanc de 64 dp ;
   - boutons sur la carte : disques de 56 dp (cible de 64 dp) ;
   - aide : disque sombre (encre), en haut à droite sur tous les écrans sauf l'accueil (D13 révisée).
4. **Couleurs** : un accent bleu (`#2F6BFF`) pour agir et pour ce qui attend un choix, une encre sombre (`#111827`), des gris. Vert et orange restent réservés à l'état du guidage. Les lieux portent la **couleur vive de leur famille**, en dégradé diagonal du clair vers le profond (maison orange, famille rose, santé sarcelle, administration indigo, études vert, travail violet, courses ambre, loisirs bleu ciel, autre bleu), jamais en teinte pastel.
5. **Pictogrammes** : Material Symbols pleins, une seule famille, toujours blancs sur la couleur du lieu ou de l'action, ou sombres sur fond blanc. Taille fixe selon l'emplacement.
6. **Lieux** : partout le même aspect (épingle, pastille du chemin, carte du carrousel, feuille des lieux, arrivée) : dégradé de la famille et pictogramme blanc, ou la photo du lieu avec le pictogramme dans un carré blanc. Un lieu caché de la carte (maison, famille) ne montre jamais sa photo à l'accueil (spec 005).
7. **Consigne de guidage** : une pilule sombre en haut de l'écran, avec un élément central très grand ; elle devient orange pour l'alerte « descends ».
8. **Mouvement** : les cartes montent en ressort à l'ouverture, la coche de l'arrivée apparaît en rebond, le halo appelle la case à remplir. Le réglage système « réduire les animations » est respecté.

## Parcours : l'accueil

1. Le voyageur ouvre l'app. La carte gris perle remplit l'écran, centrée sur sa position, avec ses lieux en **épingles aux couleurs de leur famille** (photo bordée de cette couleur si le lieu en a une).
2. **En haut**, une carte blanche porte le **chemin** : pastille de départ, pointillés, marcheur (disque sombre), pastille d'arrivée. Les pastilles font 76 dp ; une fois remplies, le symbole du bout (épingle pour le départ, drapeau pour l'arrivée) est dans leur coin.
3. **Rien n'est choisi** : les deux pastilles sont des cercles blancs à pointillés. La pastille de **départ appelle** : pointillés bleus, épingle bleue, halo bleu qui grandit et s'efface en boucle. L'arrivée attend, en gris.
4. **En bas**, un carrousel de **grandes cartes** : environ 75 % de la largeur de l'écran, au moins 200 dp de haut, coins de 26 dp, la suivante visible au bord, défilement qui s'arrête sur chaque carte. Pour le départ : une carte bleue « ici » (cible) en premier, puis les lieux. Une carte sombre « … » à la fin ouvre la feuille des lieux.
5. Une carte de lieu : dégradé de la famille, grand pictogramme blanc en haut à gauche, très grand pictogramme pâle qui déborde du coin bas droit, ombre de la couleur du lieu. Avec photo : la photo pleine carte, un voile de la couleur du lieu en bas, le pictogramme dans un carré blanc.
6. Le voyageur touche une carte (ou une épingle) : la pastille de départ se remplit. L'**appel passe à l'arrivée** ; les cartes proposent les lieux, sans celui du départ.
7. Il touche une carte : l'arrivée se remplit, le chemin passe en bleu, la carte trace le pointillé entre les deux. Les cartes laissent la place à un **disque blanc ✕** (vide l'arrivée, qui appelle de nouveau) et à la **pilule bleue ✓** (vers le choix du transport).
8. Toucher une pastille déjà remplie la rouvre : elle appelle de nouveau et les cartes proposent les lieux pour ce bout.
9. **« + » flottant** : disque bleu de 64 dp, en bas à droite, posé juste au-dessus des cartes (ou de ✕ ✓). Toucher : nouveau lieu « ici » (E27). Appui de 3 s : adresse de l'accompagnant (E30), anneau caché la première seconde, vibration (spec 007, inchangé).
10. Pas d'aide sur l'accueil (D13 révisée).

## Parcours : les autres écrans

Chaque écran garde son contenu et ses signaux actuels ; seule la forme change, selon le système ci-dessus.

- **Feuille des lieux (E02, E04)** : carte blanche flottante, tuiles de lieux aux couleurs de leur famille.
- **Choix du transport (E06)** : carte flottante en bas ; les modes en grandes tuiles (choisi : bleu plein, pictogramme blanc ; autres : blanc, pictogramme sombre) ; cadrans de durée et pilule ✓.
- **Récapitulatif (E07, E08)** : carte flottante ; chaque étape dans une ligne aux coins arrondis, pictogramme du mode dans un carré de couleur ; pilule de départ.
- **Guidage (E09-E23)** : pilule sombre en haut avec l'élément central de l'étape (virage : la flèche dans un anneau vert qui se vide à l'approche ; attente : le badge de ligne en grand ; alerte « descends » : pilule orange) ; l'étape suivante à droite, plus petite et plus pâle, sans flèche ; aide en disque sombre à droite ; en bas, carte flottante avec la frise des étapes (étape en cours cerclée de bleu, étapes faites pâlies, drapeau au bout) et le bouton écouter.
- **Métro hors connexion (E21)** : garde son thème sombre et calme ; la ligne et ses stations deviennent l'élément central, dans une carte aux coins de 28 dp ; pilule « je suis descendu ».
- **Aide (E24)** : la carte de situation et le message pour le passant dans des cartes flottantes ; pilules pour écouter et agrandir.
- **Problème de connexion (E25)** : pictogramme du problème en très grand dans un disque, pilule pour réessayer (elle ramène à l'écran précédent pour relancer).
- **Arrivée (E26)** : le lieu atteint est l'élément central (grande carte au dégradé de la famille ou photo), la coche verte apparaît en rebond, pilule bleue vers l'accueil.
- **Nouveau lieu (E27-E29) et adresse (E30)** : cartes flottantes et pilules ; le texte de E30 reste réservé à l'accompagnant.

## Signaux

| Information                      | Canaux                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| Ce qu'il faut choisir maintenant | pastille en pointillés bleus + halo bleu (un seul canal, voir Hypothèses)                  |
| Lieu choisi                      | pastille remplie (couleur ou photo) + chemin bleu + épingle agrandie + son `select`        |
| Je peux continuer                | ✕ et pilule bleue ✓ à la place des cartes                                                  |
| Virage proche                    | flèche + anneau qui se vide + flèche sur la carte + son et vibration de virage (inchangés) |
| Descendre                        | pilule orange + son et vibration d'alerte (inchangés)                                      |
| Arrivé                           | coche qui apparaît + lieu en grand + son d'arrivée (inchangé)                              |

## Cas limites

| Situation                            | Comportement attendu                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| Le voyageur touche « ✓ » sans départ | impossible : ✓ n'apparaît qu'une fois les deux bouts choisis                      |
| Départ choisi égal à l'arrivée       | l'arrivée se vide et appelle de nouveau                                           |
| Aucun lieu enregistré                | départ : la carte « ici » puis « … » ; arrivée : « … » seule, « + » visible       |
| Lieu caché de la carte avec photo    | carte au dégradé de la famille, jamais la photo, à l'accueil                      |
| Retour à l'accueil après un trajet   | rien n'est choisi, le départ appelle (nouveau trajet)                             |
| Réglage « réduire les animations »   | pas de halo animé ni de ressort : la pastille à remplir reste en pointillés bleus |
| Petit écran (320 dp)                 | cartes de 240 dp de large et 200 dp de haut                                       |
| Tablette ou grand navigateur         | cartes plafonnées en largeur, chemin et cartes centrés                            |

## Données et confidentialité

- Aucune nouvelle dépendance, permission, ni appel réseau. Dégradés dessinés avec `react-native-svg`, animations avec `react-native-reanimated`, déjà présents.
- La carte gris perle n'est qu'une autre palette du style embarqué : mêmes tuiles locales, rien n'est téléchargé.
- Les illustrations 3D Fluent du labo ne sont pas retenues : elles sont retirées du dépôt (plus d'obligation de mention MIT).
- Départ non choisi par défaut : la position n'est utilisée comme départ que si le voyageur touche « ici ».

## Hors périmètre

- Les sens de lecture de la spec 006 (rappel du trajet sans flèche, barre de progression) : spec à part, déjà validée, codée ensuite. La refonte n'ajoute aucune flèche de lecture.
- Le vrai GPS, le vrai calcul de trajet, MapLibre natif : la carte reste celle du navigateur.
- De nouvelles fonctions : seule l'apparence change, sauf le départ non choisi par défaut.

## Critères d'acceptation

- [ ] Toutes les cartes de l'app sont gris perle, sans libellé.
- [ ] À l'ouverture de l'accueil, ni départ ni arrivée ne sont choisis ; la pastille de départ appelle (pointillés bleus, halo), l'arrivée attend en gris.
- [ ] Les cartes du bas font environ 75 % de la largeur de l'écran et au moins 200 dp de haut ; « ici » est la première pour le départ.
- [ ] Après le départ, l'appel passe à l'arrivée ; après l'arrivée, ✕ et ✓ remplacent les cartes ; toucher une pastille remplie la rouvre.
- [ ] Le « + » flottant bleu est en bas à droite, au-dessus des cartes ; toucher ouvre E27, 3 s ouvrent E30.
- [ ] Épingles, pastilles, cartes, feuille des lieux et arrivée montrent le même lieu avec la même couleur de famille et le même pictogramme.
- [ ] Les deux couleurs de chaque dégradé de famille gardent un contraste d'au moins 3:1 avec le pictogramme blanc (test).
- [ ] Aucun panneau collé au bord de l'écran : cartes flottantes à 28 dp, pilules et disques comme décrit, sur tous les écrans.
- [ ] Guidage : pilule sombre en haut avec élément central ; pilule orange pour « descends » ; frise des étapes en bas.
- [ ] Arrivée : le lieu en grand, coche en rebond.
- [ ] Aucun texte ni chiffre hors exceptions D9 ; aucune flèche de lecture ajoutée.
- [ ] Testé dans le navigateur à 360 × 740 et 320 × 640, parcours complet accueil → arrivée, aide, connexion, nouveau lieu ; aucune requête hors de l'app.

## Hypothèses

- **Halo sans second canal** : à la demande de l'utilisateur (2026-11-02), l'appel de la pastille à remplir n'a ni son ni vibration. C'est une dérogation consciente à la règle des deux canaux ; à observer pendant les tests avec des voyageurs.
- Les couleurs vives de la maison et de la famille sont gardées à l'accueil : le pictogramme dit déjà la même chose ; la protection vient de l'absence d'épingle et de photo.
- Les couleurs claires des dégradés sont foncées si besoin pour garder 3:1 avec le blanc ; le rendu reste vif.
- La carte beige de la spec 002 est retirée ; les tests et le labo n'en ont plus besoin.
- Le labo `/dev/ui-lab` est retiré une fois l'accueil codé, comme le précédent.
- Le thème sombre du métro hors connexion (E21) est gardé : il a été choisi pour le calme sous terre (validé).
- Les rayons de 4, 8 et 16 dp de la spec 005 cèdent la place à ceux de ce système (28 dp pour les cartes, 26 pour les cartes de lieux, pilules et disques).
- L'utilisateur laisse Claude décider en autonomie du détail des écrans autres que l'accueil, dans ce système ; un point visuel suit la livraison.

## Questions / réponses

- Direction visuelle ? → « Clair premium » (labo du 2026-11-02).
- Pictogrammes : 3D (Fluent, génération IA) ou plats ? → Plats.
- Couleurs ? → Vives, pas de pastel fade.
- Disposition de l'accueil ? → Chemin en haut, cartes de lieux en bas, environ 75 % de largeur, au moins 200 px de haut.
- Départ par défaut ? → Aucun : l'app invite à choisir le départ, puis l'arrivée.
- Pastilles et « + » ? → Plus grands, pas sur la même ligne ; animation sur la pastille à remplir.
- Animation de saut ? → Non, le halo seul.
- Place et style du « + » ? → Flottant, bleu, en bas à droite.
- Carte « ici » ? → En premier dans le choix du départ.
- Second canal pour l'appel ? → Aucun.
- Couleur des lieux cachés ? → Couleur vive gardée.
- Épingles ? → Aux couleurs de famille.
- Reste de l'app ? → Uniformisé par Claude en autonomie, selon ce système.
