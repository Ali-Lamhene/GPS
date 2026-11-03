# 011 — Accueil : retours d'usage et catalogue de pictogrammes

- **Statut** : validé
- **Date** : 2026-11-03
- **Persona** : voyageur (accueil), accompagnant (bouton d'adresse, choix du pictogramme)
- **Révise** : spec 009 (tailles de l'accueil), spec 007 (appui de 3 s sur « + », tuile « … »), spec 005 (rouvrir un bout touché), spec 001 (liste des pictogrammes)

## Besoin

Après essai de l'accueil émeraude, l'utilisateur demande cinq changements :

1. La pilule du chemin et ses pastilles de départ et d'arrivée sont trop petites.
2. Le panneau des raccourcis doit prendre plus de place.
3. L'accompagnant n'a pas de moyen visible d'ajouter une adresse : l'appui caché de 3 s sur « + » n'est pas trouvé.
4. Toucher le départ ou l'arrivée doit ouvrir la liste de tous les lieux ; le lieu choisi remplit ce bout.
5. Les 12 pictogrammes actuels ne couvrent pas les lieux réels d'un voyageur (chez un ami, mairie, avocat, médecin, ophtalmologue…). Il faut un vrai catalogue.

## Parcours

### Accueil

1. La pilule du chemin est plus grande : pastilles de **56 dp** (au lieu de 42), pilule d'environ **72 dp** de haut. Même dessin : épingle ····· drapeau, halo sur le bout qui appelle, photo ou pictogramme du lieu choisi avec son badge.
2. **Toucher une pastille** (départ ou arrivée), vide ou remplie, ouvre la **feuille de tous les lieux** pour ce bout. Toucher un lieu le met dans ce bout, ferme la feuille et joue le son « select ». Pour le départ, « ici » (ma position) est en tête de la feuille. Pour l'arrivée, le lieu de départ est grisé. Toucher le fond ou le retour Android ferme la feuille sans rien changer. (Remplace « toucher un bout le rouvre » des specs 005 et 007.)
3. Le panneau du bas est plus grand : tuiles d'environ **110 dp**, deux tuiles et demie visibles, le panneau prend environ un quart de l'écran. Les tuiles restent des **raccourcis** : elles remplissent le bout qui appelle, comme avant. La tuile « … » disparaît : les pastilles ouvrent déjà tous les lieux.
4. Une fois les deux bouts choisis : ✕ et ✓ comme avant, dans le panneau agrandi.
5. **Bouton de l'accompagnant** : un petit rond blanc (pictogramme `edit_location_alt`, épingle et crayon) collé au « + », visible en permanence. Un toucher ouvre le formulaire d'adresse (E30). L'appui de 3 s sur le « + » disparaît : un toucher sur le « + » ouvre toujours « nouveau lieu ici » (E27).

### Choisir un pictogramme (E28)

6. La grille montre tout le catalogue ci-dessous, **groupé par famille**, dans une liste qui défile. Les familles sont séparées par un trait fin, sans titre écrit ; l'ordre des familles est celui du tableau.
7. La tuile choisie reste émeraude pleine ; l'épingle d'aperçu montre le pictogramme ; ✓ actif dès qu'un pictogramme est choisi.
8. Chaque pictogramme a un nom en français lu par le lecteur d'écran (pour l'accompagnant) ; aucun texte affiché.

## Catalogue de pictogrammes

Pictogrammes Material Symbols (au trait, émeraude), tous présents dans la police embarquée (vérifié). Les lieux marqués **caché** n'ont pas d'épingle sur la carte d'accueil et ne montrent jamais leur photo à l'ouverture, sauf si l'accompagnant décide le contraire (règle existante, élargie à « chez un ami »).

| Famille             | Lieu (nom lu)              | Pictogramme             |
| ------------------- | -------------------------- | ----------------------- |
| Chez soi et proches | maison — **caché**         | `home`                  |
|                     | famille — **caché**        | `family_restroom`       |
|                     | chez un ami — **caché**    | `group`                 |
|                     | hébergement, foyer         | `night_shelter`         |
|                     | hôtel                      | `hotel`                 |
|                     | immeuble, logement         | `apartment`             |
| Santé               | hôpital                    | `local_hospital`        |
|                     | urgences                   | `emergency`             |
|                     | médecin                    | `stethoscope`           |
|                     | ophtalmologue              | `ophthalmology`         |
|                     | dentiste                   | `dentistry`             |
|                     | pédiatre                   | `pediatrics`            |
|                     | maternité, sage-femme      | `pregnant_woman`        |
|                     | gynécologue                | `gynecology`            |
|                     | cardiologue                | `cardiology`            |
|                     | ORL, audition              | `hearing`               |
|                     | kinésithérapeute           | `physical_therapy`      |
|                     | psychologue                | `psychology`            |
|                     | laboratoire, prise de sang | `bloodtype`             |
|                     | vaccination                | `vaccines`              |
|                     | pharmacie                  | `local_pharmacy`        |
| Démarches           | mairie                     | `location_city`         |
|                     | préfecture, administration | `account_balance`       |
|                     | tribunal                   | `gavel`                 |
|                     | avocat                     | `balance`               |
|                     | dossier, papiers           | `description`           |
|                     | titre de séjour, carte     | `badge`                 |
|                     | police                     | `local_police`          |
|                     | poste                      | `local_post_office`     |
|                     | banque                     | `savings`               |
|                     | distributeur de billets    | `local_atm`             |
| Aide et social      | association                | `handshake`             |
|                     | accueil de jour, aide      | `volunteer_activism`    |
|                     | centre social, groupe      | `diversity_3`           |
|                     | distribution alimentaire   | `food_bank`             |
|                     | repas                      | `soup_kitchen`          |
|                     | douches                    | `shower`                |
|                     | laverie                    | `local_laundry_service` |
|                     | vestiaire, vêtements       | `checkroom`             |
| Études et enfants   | école                      | `school`                |
|                     | cours, livres              | `menu_book`             |
|                     | bibliothèque               | `local_library`         |
|                     | crèche                     | `child_care`            |
|                     | garde d'enfants            | `stroller`              |
|                     | aire de jeux               | `toys`                  |
| Travail             | travail                    | `work`                  |
|                     | agence pour l'emploi       | `business_center`       |
|                     | chantier                   | `construction`          |
| Courses et services | supermarché                | `shopping_cart`         |
|                     | magasin                    | `storefront`            |
|                     | boutique                   | `shopping_bag`          |
|                     | coiffeur                   | `content_cut`           |
|                     | restaurant                 | `restaurant`            |
|                     | café                       | `local_cafe`            |
|                     | téléphone, réparation      | `phone_iphone`          |
| Transports          | gare                       | `train`                 |
|                     | gare routière              | `directions_bus`        |
|                     | métro                      | `subway`                |
|                     | tramway                    | `tram`                  |
|                     | aéroport                   | `local_airport`         |
|                     | port, bateau               | `directions_boat`       |
|                     | taxi                       | `local_taxi`            |
|                     | parking                    | `local_parking`         |
| Loisirs             | parc                       | `park`                  |
|                     | plage                      | `beach_access`          |
|                     | salle de sport             | `fitness_center`        |
|                     | football                   | `sports_soccer`         |
|                     | piscine                    | `pool`                  |
|                     | musée                      | `museum`                |
|                     | spectacle                  | `theater_comedy`        |
| Lieux de culte      | mosquée                    | `mosque`                |
|                     | église                     | `church`                |
|                     | synagogue                  | `synagogue`             |
|                     | temple hindou              | `temple_hindu`          |
|                     | temple bouddhiste          | `temple_buddhist`       |
| Autre               | lieu important             | `favorite`              |
|                     | autre lieu                 | `location_on`           |

Exclus volontairement : consulat et ambassade du pays d'origine (D1 : un pictogramme dédié trahirait un lien avec ce pays) ; pictogrammes qui contiennent des lettres (`translate`, `atm`, `euro`).

## Signaux

| Information                    | Canaux                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Bout à remplir                 | halo pulsé, contour émeraude épais (inchangé)                                  |
| Lieu choisi dans un bout       | photo ou pictogramme dans la pastille, badge épingle / drapeau, son « select » |
| Feuille ouverte pour quel bout | épingle ou drapeau en tête de la feuille (inchangé)                            |
| Pictogramme choisi             | tuile émeraude pleine, épingle d'aperçu                                        |

## Cas limites

| Situation                                                               | Comportement attendu                                                               |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Toucher l'arrivée avant d'avoir un départ                               | la feuille s'ouvre pour l'arrivée ; le départ reste à remplir et appelle ensuite   |
| Toucher une pastille déjà remplie                                       | la feuille s'ouvre ; choisir un autre lieu le remplace ; fermer ne change rien     |
| Choisir pour l'arrivée le lieu du départ                                | impossible : grisé dans la feuille (règle existante)                               |
| Petit écran (320 × 640)                                                 | tuiles à 96 dp minimum, deux tuiles et demie visibles ; la carte garde de la place |
| Lien de partage reçu avec un pictogramme inconnu (version plus récente) | le lieu prend `location_on` (autre lieu)                                           |
| Lieu existant avec un ancien pictogramme                                | inchangé : tous les anciens pictogrammes restent dans le catalogue                 |
| Lecture de droite à gauche                                              | pilule et tuiles jamais inversées (spec 006)                                       |

## Données et confidentialité

- Le pictogramme d'un lieu reste son nom Material Symbols, stocké et transmis dans le lien de partage (spec 001) comme aujourd'hui ; aucun nouveau champ.
- « Chez un ami » rejoint maison et famille parmi les lieux cachés de la carte par défaut.
- Aucun pictogramme de consulat ou d'ambassade (D1). Les lieux de culte sont visibles comme les autres (choix de l'utilisateur, 2026-11-03).
- Aucune nouvelle dépendance, permission ni appel réseau.

## Hors périmètre

- Les couleurs par famille (abandonnées, D15) : les familles servent seulement à ranger la grille.
- La recherche d'un pictogramme par mot (l'accompagnant fait défiler).
- Les vrais lieux enregistrés sur le téléphone (spec 001, étape 4).

## Critères d'acceptation

- [ ] Pastilles de la pilule à 56 dp ; pilule d'environ 72 dp.
- [ ] Tuiles d'environ 110 dp, deux tuiles et demie visibles à 390 dp, 96 dp minimum à 320 dp ; plus de tuile « … ».
- [ ] Toucher le départ ou l'arrivée ouvre la feuille de tous les lieux pour ce bout ; un lieu choisi remplit ce bout et ferme la feuille ; fermer ne change rien.
- [ ] Petit bouton accompagnant à côté du « + » : un toucher ouvre E30 ; plus d'appui de 3 s sur le « + ».
- [ ] E28 : les 77 pictogrammes du catalogue, groupés par famille dans l'ordre du tableau, séparés par un trait, sans texte ; chacun a son nom en français pour le lecteur d'écran.
- [ ] « Chez un ami » est caché de la carte par défaut, comme maison et famille ; un test le vérifie.
- [ ] Un test vérifie que chaque pictogramme du catalogue a un code dans `GLYPHS`, une famille et un nom.
- [ ] Vérifié dans le navigateur (390, 360, 320 dp) ; relu par `ux-sans-texte-reviewer`.

## Hypothèses

- Pictogrammes : `group` pour « chez un ami », `balance` (balance de justice) pour l'avocat, `gavel` (marteau) pour le tribunal, `location_city` pour la mairie et `account_balance` pour la préfecture. Certains (ophtalmologue, cardiologue, ORL) sont abstraits : la photo du lieu reste le premier repère ; à observer en test.
- Le bouton de l'accompagnant fait environ 36 dp, accolé au « + » côté intérieur de l'écran.
- La feuille de tous les lieux garde sa grille actuelle, aux tuiles de la spec 009.

## Questions / réponses

- Tailles : nettement plus grand (pastilles 56 dp, tuiles environ 110 dp).
- Accompagnant : petit bouton visible à côté du « + », un toucher ; plus d'appui de 3 s.
- Tuiles : gardées comme raccourcis, sans « … ».
- Grille des pictogrammes : une liste qui défile, groupée par famille.
- Lieux de culte : proposés, visibles comme les autres.
- Lieux cachés par défaut : maison, famille, chez un ami.
- Consulat, ambassade : pas de pictogramme.
