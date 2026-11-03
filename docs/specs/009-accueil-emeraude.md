# 009 — Accueil « carte urbaine émeraude »

- **Statut** : livré
- **Date** : 2026-11-03
- **Persona** : voyageur
- **Référence visuelle** : `docs/design/maquette-emeraude.png` (D15)
- **Révise** : la partie visuelle de l'accueil des specs 005, 007 et 008, et le style de la carte (spec 002, spec 008)

## Besoin

L'interface « clair premium » (spec 008) manque de personnalité : formes et couleurs génériques. L'utilisateur a fourni une maquette de l'accueil (D15) qui fait foi. Cette spec refait **l'accueil seulement** selon cette maquette ; les autres écrans suivront dans d'autres specs. Le comportement de l'accueil ne change pas (spec 008 : rien de choisi au départ, le départ appelle puis l'arrivée, épingles et tuiles pour choisir, « + » pour ajouter un lieu) ; seul son aspect change.

## Parcours

1. Le voyageur ouvre l'app. Il voit une **carte crème** sans aucun texte : sol crème, espaces verts en aplat vert tendre, eau bleu vif, rues blanches, voies ferrées hachurées. Sa position est un **point émeraude** avec un halo.
2. En haut, une **pilule blanche** flottante : à un bout le rond du **départ** (épingle `location_on`), à l'autre le rond de l'**arrivée** (drapeau), reliés par une ligne de **points émeraude** tous remplis (un simple chemin, sans autre sens). Le rond à remplir **appelle** : un halo émeraude grandit et s'efface autour de lui, d'abord le départ, puis l'arrivée.
3. Sur la carte, ses lieux sont des **épingles en goutte** : goutte blanche bordée d'émeraude avec le pictogramme émeraude au trait, ou, si le lieu a une photo, la photo dans la goutte avec un petit pictogramme dans un coin. Le lieu choisi est plus grand et bordé d'émeraude plein. Toucher une épingle remplit le bout qui appelle (comme aujourd'hui).
4. En bas, un **panneau blanc** aux grands arrondis, sans poignée (rien ne se tire), montre des **tuiles carrées** (environ 3,5 à l'écran) qui défilent : « ici » en premier pour le départ, puis les lieux, puis « … » (tous les lieux, ouvre la feuille des lieux). Une tuile est soit la photo du lieu avec un petit pictogramme dans un coin, soit un fond blanc avec le pictogramme émeraude au trait. La tuile du lieu choisi est entourée d'émeraude. La dernière tuile visible est coupée par le bord, pour inviter à glisser.
5. Quand un lieu est choisi, son rond dans la pilule montre sa **photo ou son pictogramme**, avec un petit **badge épingle ou drapeau** qui garde le sens départ / arrivée reconnaissable à son symbole (spec 006). Entre les deux bouts choisis, un tracé émeraude en pointillés relie départ et arrivée sur la carte.
6. Les deux bouts choisis : les tuiles laissent la place à **✕** (rond blanc, annuler l'arrivée) et à une **pilule ✓ émeraude pleine** (continuer vers le choix du transport).
7. Boutons ronds flottants : **ⓘ** blanc en bas à gauche (crédit OpenStreetMap replié, D9) ; **« + » émeraude plein** en bas à droite au-dessus du panneau (toucher : nouveau lieu ici ; appui de 3 s : adresse de l'accompagnant, comme la spec 007) ; **recentrer** (cible) blanc au-dessus du « + », seulement après que le voyageur a déplacé la carte (spec 002).

## Signaux

| Information                      | Canaux                                                                                      |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Où je suis                       | point émeraude, halo                                                                        |
| Mes lieux                        | forme (goutte), pictogramme, photo                                                          |
| Quel bout remplir                | halo animé autour du rond (sans son ni vibration, choix déjà fait avec la spec 008)         |
| Bout choisi                      | photo ou pictogramme du lieu dans le rond, badge épingle / drapeau, son « select » existant |
| Lieu choisi sur la carte / tuile | taille, bordure émeraude pleine                                                             |
| Continuer / annuler              | ✓ émeraude plein, ✕ blanc (forme + couleur)                                                 |

## Cas limites

| Situation                                | Comportement attendu                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Lieu sans photo                          | goutte et tuile blanches au pictogramme émeraude au trait                        |
| Lieu caché de la carte (maison, famille) | pas d'épingle ; tuile au pictogramme seul, jamais sa photo (règle existante)     |
| Peu de lieux                             | tuiles alignées sans défilement, « … » en dernier                                |
| Beaucoup de lieux                        | défilement horizontal, ordre de la spec 001 ; sens non inversé en arabe / persan |
| Petit écran (320 dp)                     | environ 3 tuiles visibles, la dernière coupée                                    |
| Fichier de carte illisible               | fond crème uni, épingles et panneau toujours là (spec 002)                       |
| Grande taille de police système          | aucun effet : pas de texte (sauf crédit ⓘ déplié)                                |
| Mouvement réduit (accessibilité)         | halo fixe et pâle au lieu de pulser (règle existante)                            |

## Données et confidentialité

Aucun changement : rien de nouveau stocké, rien ne quitte le téléphone, aucune nouvelle dépendance ni permission. La carte reste l'archive embarquée (spec 002).

## Hors périmètre

- Les autres écrans (choix du transport, récapitulatif, guidage, métro, aide, arrivée, nouveau lieu, connexion) : leur interface reste « clair premium » bleue jusqu'à leurs propres specs, posée sur la nouvelle carte crème.
- La nuance de vert du guidage (« bon chemin »), distincte de l'émeraude : spec du guidage.
- Les couleurs par famille de lieux restent dans le code tant que d'autres écrans s'en servent ; l'accueil ne les utilise plus.
- Arbres dessinés dans les parcs (aplat seul, D15).

## Critères d'acceptation

- [ ] La carte est crème (`#F8F1EE`), parcs `#D6E4A4`, eau `#8BCBEF`, rues blanches, voies ferrées hachurées, sans aucun texte, sur tous les écrans qui ont une carte.
- [ ] Le point de position est émeraude avec halo sur tous les écrans ; le cône de direction du guidage aussi.
- [ ] La pilule du haut : rond départ (épingle), points émeraude tous remplis, rond arrivée (drapeau) ; le rond à remplir pulse en émeraude ; un bout choisi montre la photo ou le pictogramme du lieu avec son badge.
- [ ] Les épingles sont des gouttes : blanches au trait sans photo, photo avec petit pictogramme sinon ; le lieu choisi est plus grand et bordé d'émeraude plein ; toucher une épingle choisit le lieu comme avant.
- [ ] Le panneau du bas montre des tuiles carrées d'environ 84 dp, « ici » en premier pour le départ, « … » en dernier ; la tuile choisie est entourée d'émeraude ; on peut faire défiler.
- [ ] Une fois les deux bouts choisis : ✕ blanc et pilule ✓ émeraude ; ✓ mène au choix du transport, ✕ efface l'arrivée.
- [ ] ⓘ en bas à gauche, « + » émeraude en bas à droite, recentrer au-dessus du « + » après un déplacement de la carte.
- [ ] Pictogrammes de l'accueil au trait (Material Symbols « outlined »).
- [ ] Aucune couleur de famille à l'accueil : émeraude, blanc, crème et les couleurs de la carte seulement.
- [ ] Vérifié dans le navigateur à 390 × 844, 360 × 740 et 320 × 640, puis sur le téléphone (build de dev) ; relu par `ux-sans-texte-reviewer`.
- [ ] Les tests existants de l'accueil passent toujours (comportement inchangé).

## Hypothèses

- **Tailles** reprises de la maquette (image de 838 px pour un écran d'environ 390 dp, soit environ ÷ 2,15) : pilule d'environ 52 dp de haut, ronds des bouts d'environ 40 dp, épingles d'environ 42 dp (choisie environ 60 dp), tuiles d'environ 84 dp, ⓘ environ 34 dp, recentrer environ 37 dp, « + » environ 48 dp. Pas de zone tactile élargie (principe 4 révisé, D15).
- **Couleurs** relevées sur la maquette : émeraude `#037C6D` (blanc dessus : contraste d'environ 5:1), halo `#B4D8D1`, surfaces blanc chaud `#FBF8F6`. Arrondis : panneau environ 28 dp, tuiles environ 18 dp, pilule entièrement arrondie.
- La feuille « tous les lieux » (ouverte par « … ») prend les mêmes tuiles et les mêmes couleurs.
- L'ⓘ du navigateur (contrôle de MapLibre) est restylé en rond blanc comme celui du téléphone.
- Ombres douces et chaudes, comme la maquette ; pas de dégradé.

## Questions / réponses

- Pictogrammes : au trait, comme la maquette (pas les pleins).
- Carte : crème partout dès maintenant (un seul style de carte), même sous les écrans pas encore refaits.
- Points de la pilule : tous remplis, simple chemin (le dégradé de la maquette est une erreur de génération).
- Recentrer : seulement après un déplacement de la carte (comportement actuel).
- Bout à remplir : halo pulsé émeraude.
- Bout choisi : photo ou pictogramme du lieu, avec badge épingle / drapeau.
- Tuiles : taille de la maquette, « ici » en premier, « … » en dernier.
- Deux bouts choisis : ✕ blanc et pilule ✓ émeraude, à la place des tuiles.
- Photo : garde un petit pictogramme dans un coin (tuiles et épingles).
- Couleurs par famille : abandonnées à l'accueil, tout en émeraude (confirmé).
- Point de position : émeraude sur tous les écrans.
- Épingles : tout lieu avec photo a son épingle photo ; le lieu choisi est plus grand et bordé d'émeraude plein.

## Ajustements de la relecture `ux-sans-texte-reviewer` (2026-11-03)

- Le rond à remplir se distingue aussi au repos : contour émeraude épais ; l'autre rond vide a un contour et un pictogramme gris (comme le drapeau gris de la maquette). Le halo reste.
- Badge épingle / drapeau d'un bout choisi : 22 dp, pictogramme de 15 dp (la maquette ne le dessine pas).
- Tuiles : 70 à 92 dp, pour qu'environ 40 % de la quatrième reste visible à 320 dp.
- Navigateur : ⓘ au « i » émeraude, comme sur le téléphone.
