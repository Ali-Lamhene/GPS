# 007 — Accueil « carte flottante » et bouton « + »

- **Statut** : livré
- **Partie visuelle remplacée par** : D15, maquette émeraude (2026-11-03)
- **Date** : 2026-11-02
- **Persona** : voyageur (et accompagnant pour l'ajout d'une adresse)

Révise la spec 005 (panneau du bas, raccourcis, palette), la spec 001 (entrée dans la partie préparation) et la décision D13 (aide sur l'accueil).

## Besoin

Après la spec 005, les raccourcis de l'accueil restent jugés trop petits ou trop vides : deux rangées, grille, puis carrousel de vignettes de 72 dp. Un labo dans le navigateur (`/dev/home-lab`) a comparé trois accueils inspirés des meilleures maquettes d'apps de cartes. L'utilisateur a retenu **F « Carte flottante »** : la carte reste entière, et une carte blanche arrondie flotte au-dessus du bas de l'écran, avec le chemin et un carrousel de grandes vignettes photo.

Ajouter un lieu est aujourd'hui caché dans la feuille des lieux, avec une tuile « Accompagnant · appui 3 s » qui montre du texte au voyageur (question ouverte 11). Un bouton **« + »** sur l'accueil devient la seule entrée pour ajouter un lieu :

- le voyageur, qui ne sait pas lire, le touche pour garder l'endroit où il est ;
- l'accompagnant ouvre l'ajout d'une adresse par un appui long, que le voyageur ne doit pas pouvoir ouvrir par hasard, pour ne pas tomber sur du texte.

## Parcours

### Accueil

1. Le voyageur ouvre l'app. La carte remplit tout l'écran, sans voile, centrée sur sa position, avec ses lieux en épingles (spec 005, inchangé).
2. En haut à droite, un **bouton rond blanc « + »**, à la place et à la taille du bouton d'aide. **Pas de bouton d'aide sur l'accueil** : il n'y a pas encore de trajet, la carte d'aide n'aurait rien de précis à montrer. L'aide revient en haut à droite dès le choix du transport (E06).
3. En bas, une **carte blanche flottante**, détachée des bords (marge de 12 dp), coins très arrondis, ombre douce. Elle contient :
   - le **chemin** : pastille de départ (épingle de localisation sur bleu pâle), pointillés et marcheur au milieu, pastille d'arrivée vide (cercle pointillé avec le drapeau) qui pulse ;
   - un **carrousel de grandes vignettes** (environ trois vignettes visibles, la dernière coupée au bord pour montrer qu'on peut glisser ; leur largeur plafonne à 160 dp sur tablette), un peu plus hautes que larges, puis une vignette « … » qui ouvre la feuille des lieux. Jamais inversé : premier lieu à gauche (spec 006).
4. Une vignette montre :
   - **la photo du lieu** quand il en a une, avec son pictogramme blanc sur une petite pastille de la couleur de sa catégorie, dans le coin bas ;
   - sinon une **tuile illustrée** : fond de la couleur de la catégorie, grand pictogramme pâle qui déborde du coin, pictogramme blanc au centre.
   - Un lieu caché de la carte (maison, famille) montre toujours la tuile illustrée, jamais sa photo (spec 005).
5. Le voyageur touche une vignette ou une épingle : le lieu remplit la pastille d'arrivée (sa photo ou sa couleur, drapeau en coin), le pointillé et le marcheur passent en bleu, l'épingle grossit, le son `select` joue. Le carrousel laisse la place à un **bouton ✕** (annuler) et une **barre bleue ✓** (continuer vers E06).
6. Toucher la pastille de départ ou d'arrivée, ou « … », ouvre la **feuille des lieux**. La feuille ne sert plus qu'à choisir : les tuiles « + position » et « Accompagnant · appui 3 s » en sont retirées.

### Bouton « + »

7. **Toucher « + »** (voyageur) ouvre directement le parcours « nouveau lieu ici » (E27 position, E28 pictogramme, E29 photo), déjà codé.
8. **Appui long de 3 s sur « + »** (accompagnant) : un anneau se remplit autour du bouton, le téléphone vibre, puis le formulaire d'adresse (E30) s'ouvre. Aucun texte n'annonce ce geste au voyageur. Un appui relâché entre 1 et 3 s ne fait rien, ni ouverture de E27 ni texte ; relâché avant 1 s, c'est un toucher.
9. À la fin des deux parcours, retour à l'accueil. Le nouveau lieu est **seulement gardé** : il apparaît dans le carrousel (et en épingle s'il n'est pas caché de la carte), l'arrivée reste telle qu'elle était.

### Couleurs, dans toute l'app

10. La palette du labo remplace celle de la maquette v7 dans le thème (`src/ui/theme`), donc sur tous les écrans : bleu d'action `#2F6BFF`, encre `#111827`, encre secondaire `#6B7280`, gris de fond `#F3F4F6`, filets `#E5E7EB`, bleu pâle `#E8EEFF`. Le vert du guidage et l'orange de l'alerte ne changent pas.
11. **Une couleur par famille de pictogrammes** (logement, famille, santé, administration, études, travail, courses, loisirs, autre), assez soutenue pour que le pictogramme blanc ait un contraste d'au moins 3:1.

## Signaux

| Information                     | Canaux                                                                  |
| ------------------------------- | ----------------------------------------------------------------------- |
| Mes lieux                       | photo ou tuile illustrée + pictogramme + couleur de catégorie + épingle |
| Ce qu'il reste à choisir        | pastille d'arrivée vide qui pulse, drapeau                              |
| Lieu choisi                     | pastille d'arrivée remplie + chemin bleu + épingle agrandie + son       |
| Je peux continuer               | ✕ et barre bleue ✓ à la place du carrousel                              |
| Ajouter un lieu ici             | bouton « + » ; parcours E27-E29 (inchangé)                              |
| Entrée accompagnant (appui 3 s) | anneau qui se remplit + vibration à la fin                              |

## Cas limites

| Situation                                       | Comportement attendu                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Le voyageur maintient « + » 3 s par hasard      | le formulaire d'adresse s'ouvre ; retour Android ou bouton retour ramène à l'accueil     |
| Le voyageur relâche avant 3 s                   | rien ne s'ouvre, l'anneau se vide                                                        |
| Aucun lieu                                      | carrousel réduit à « … » ; le chemin reste ; « + » pour ajouter                          |
| Peu de lieux (moins de trois)                   | vignettes puis « … », rien à faire glisser                                               |
| Lieu sans photo, ou reçu par lien               | tuile illustrée                                                                          |
| Maison, famille avec photo                      | tuile illustrée dans le carrousel ; photo seulement une fois choisie, et dans la feuille |
| Pictogramme sans famille connue (`location_on`) | couleur « autre » (bleu d'action)                                                        |
| Petit écran (320 dp)                            | environ deux vignettes et demie visibles                                                 |
| Lecteur de droite à gauche                      | carrousel et chemin jamais inversés (spec 006)                                           |

## Données et confidentialité

- Aucune nouvelle donnée, dépendance, permission ni appel réseau. Couleurs et tuiles illustrées calculées sur le téléphone à partir du pictogramme.
- Le lieu créé reste dans la mémoire de l'app comme aujourd'hui ; la sauvegarde sur le téléphone arrive avec la spec 001.
- La photo d'un lieu caché de la carte n'apparaît jamais dans le carrousel, visible dès l'ouverture de l'app.
- Partie préparation : toujours sans code (D8), mais plus aucun texte visible pour l'annoncer.

## Hors périmètre

- Les formes des autres écrans (arrondis, boutons en pilule) : elles restent celles de la spec 005 jusqu'au point UI qui suit cette spec. Seules les couleurs changent partout.
- Le vrai GPS : en démo, la position est toujours connue ; le cas « position inconnue » au toucher de « + » arrive avec la spec 004.
- La sauvegarde durable des lieux et la case « ne pas montrer sur la carte » (spec 001).
- Les épingles sur téléphone (MapLibre natif).

## Critères d'acceptation

- [ ] L'accueil n'a pas de bouton d'aide ; un bouton rond « + » est en haut à droite, à sa place.
- [ ] Toucher « + » ouvre E27 ; à la fin de E29, retour à l'accueil, le nouveau lieu est dans le carrousel, l'arrivée n'a pas changé.
- [ ] Un appui de 3 s sur « + » remplit un anneau, fait vibrer et ouvre E30 ; relâché entre 1 et 3 s, rien ne s'ouvre. Au retour, le lieu est gardé, l'arrivée n'a pas changé.
- [ ] La feuille des lieux ne contient plus de tuile d'ajout ni le texte « Accompagnant ».
- [ ] La carte flottante montre le chemin et un carrousel de grandes vignettes : photo + pastille de catégorie, ou tuile illustrée ; puis « … ».
- [ ] La maison montre sa tuile illustrée, jamais sa photo, dans le carrousel.
- [ ] Toucher une vignette ou une épingle remplit l'arrivée et remplace le carrousel par ✕ et ✓ ; ✓ mène à E06 ; ✕ vide l'arrivée.
- [ ] L'aide est toujours en haut à droite de E06 et des écrans suivants.
- [ ] Nouvelle palette visible sur tous les écrans ; chaque couleur de catégorie a un contraste d'au moins 3:1 avec le blanc (test).
- [ ] Le labo `/dev/home-lab` n'existe plus.
- [ ] Aucun texte ni chiffre sur l'accueil ; testé dans le navigateur à 360 × 740 et 320 × 640, aucune requête hors de l'app.

## Hypothèses

- Dimensions reprises du labo F, retenu tel quel : carte flottante arrondie à 28 dp, vignettes arrondies à 18 dp, ✓ en barre aux bouts ronds de 64 dp de haut (cible tactile minimale, au lieu des 60 dp du labo). Elles dérogent à la règle « 16 dp au plus » de la spec 005, sur l'accueil seulement, en attendant le point UI.
- Familles et couleurs : maison (orange), famille (corail), santé (sarcelle), administration et mairie (indigo), études et bibliothèque (vert), travail (violet), courses et marché (ambre foncé), loisirs, sport et plage (cyan foncé), autre (bleu d'action). Teintes exactes réglées au code pour atteindre 3:1.
- L'anneau de l'appui long reste invisible pendant la première seconde, puis se remplit, en gris (pas le bleu de « continuer ») : un voyageur qui pose le doigt brièvement ne voit rien d'intrigant. Relâché avant que l'anneau se voie (1 s), l'appui compte comme un toucher et ouvre E27 : un doigt lent ou tremblant n'a jamais « rien ».
- La fin de l'appui de 3 s fait vibrer (150 ms) avec le son de sélection : nouveau signal `hold`.
- Le « + » joue le son `select` au toucher, comme les autres choix.
- Le nouveau lieu prend sa place dans l'ordre de la spec 001 : maison d'abord, puis du plus récent au plus ancien.
- Le travail non commité du 2026-11-01 (épingle `location_on` au départ, essais de raccourcis) part dans le même commit.

## Questions / réponses

- Quel accueil parmi les trois du labo ? → F « Carte flottante ».
- Supprimer « les tests » ? → Les variantes du labo ; une fois F sur l'accueil, tout le labo est supprimé.
- Où va l'aide sur l'accueil ? → Pas d'aide à l'accueil ; elle revient dès E06 (révise D13).
- Que fait « + » ? → Le voyageur ajoute sa position ; l'accompagnant ajoute une adresse, par un accès que le voyageur ne doit pas ouvrir facilement.
- Verrou de l'accompagnant ? → Appui long de 3 s sur le même « + », anneau, vibration, aucun texte.
- Tuiles d'ajout de la feuille des lieux ? → Retirées.
- Lieu sans photo ? → Tuile illustrée en secours ; jamais de photo générique ; maison et famille jamais en photo à l'accueil.
- Palette ? → Toute l'app, par le thème.
- Contraste des tuiles illustrées ? → Teintes plus soutenues, au moins 3:1 avec le pictogramme blanc.
- Après la création d'un lieu par « + » ? → Toujours seulement gardé, l'arrivée ne change pas.
