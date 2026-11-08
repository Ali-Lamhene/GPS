# 027 — Plus aucune cible : « moi ici » et les vrais lieux sur le chemin du guidage

- **Statut** : livré
- **Date** : 2026-11-08
- **Persona** : voyageur

## Besoin

Retours de terrain de l'utilisateur (2026-11-05, points 6, 10 et 11) :

- le bouton de recentrage est une cible ; il devrait être une épingle (point 6) ;
- **plus aucune cible dans l'app** (précisé par l'utilisateur) ;
- le chemin du bas du guidage montre des pictogrammes génériques (épingle, drapeau) au lieu des lieux de départ et d'arrivée (point 10) ;
- les points du chemin doivent se remplir au fil du déplacement, pour donner une idée de la distance restante (point 11).

## Parcours

1. Partout où l'app montrait la cible (position actuelle « ici » dans les raccourcis et la pilule de l'accueil, bouton de recentrage de la carte), elle montre maintenant **l'épingle avec un personnage** (« moi, ici »). Position indisponible : le **personnage barré** (au lieu de la cible barrée ; Material Symbols n'a pas d'épingle à personnage barrée, et l'épingle simple barrée voudrait dire « pas de départ »).
2. Le bouton de recentrage de la carte porte cette épingle. Il garde sa place et son comportement.
3. Guidage, chemin du bas : aux deux bouts, les **disques des lieux** de départ et d'arrivée, comme dans la pilule de l'accueil (photo ou pictogramme du lieu, badge épingle pour le départ, badge drapeau pour l'arrivée). Le temps restant reste sous le départ. Un départ « ici » s'affiche en **disque de départ neutre** (épingle simple), jamais avec l'épingle « moi » : pendant la marche, le voyageur n'est plus au départ.
4. Les points du chemin se remplissent en émeraude au fil de la progression (c'était déjà le cas depuis la spec 021) ; les points faits sont maintenant **plus gros** (9 dp au lieu de 6) en plus d'être plus foncés, pour se voir d'un coup d'œil.

## Signaux

| Information                | Canaux                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Moi, ici                   | Épingle avec personnage (forme), émeraude (couleur) ; sur la carte, le point émeraude cerclé de blanc reste inchangé |
| Départ / arrivée du trajet | Photo ou pictogramme du lieu, badge épingle ou drapeau                                                               |
| Chemin parcouru            | Points émeraude plus gros (forme et taille) et plus foncés (couleur)                                                 |

## Cas limites

| Situation                                  | Comportement attendu                                             |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Départ « ici »                             | Disque de départ avec l'épingle à personnage et le badge épingle |
| Lieu caché de la carte (domicile, famille) | Pas de photo, pictogramme seul (règle de la spec 005)            |
| Position introuvable                       | Épingle à personnage grisée ; refusée ou coupée : épingle barrée |

## Données et confidentialité

Rien de nouveau : aucun appel, aucun stockage. Le pictogramme « ici » n'est jamais enregistré ni partagé.

## Hors périmètre

- Le point émeraude du voyageur sur la carte ne change pas.
- Le pictogramme de la carte d'ensemble (« cadrer tout le trajet ») ne change pas : ce n'est pas une cible.

## Critères d'acceptation

- [x] Plus aucune icône cible (`my_location`, `location_disabled`) dans le code.
- [x] Guidage : les disques « Départ » et « Arrivée » sont dans le chemin du bas (test).
- [x] Les points faits suivent la progression (test : à mi-chemin, la moitié des points).
- [ ] Sur le téléphone : l'épingle à personnage est-elle comprise comme « moi » ? Se distingue-t-elle de l'épingle simple du départ ?
- [ ] Sur le terrain : le remplissage des points se voit-il en marchant ?

## Ajustements après la relecture `ux-sans-texte-reviewer` (2026-11-08)

- Position indisponible : personnage barré (`person_off`) au lieu de l'épingle simple barrée.
- Guidage : départ « ici » en disque neutre (test).
- À voir sur le terrain : l'épingle à personnage sert à la fois à la tuile « ici » (choisir le départ) et au bouton de recentrage ; « je cherche la position » et « prêt » ne diffèrent que par le gris (défaut hérité de la cible) ; à la taille du badge, le personnage se voit peu (essayer la variante pleine si besoin) ; la pilule du guidage gagne environ 18 dp de hauteur.

## Hypothèses

- Épingle simple = départ ; épingle à personnage = moi. Le point 6 demandait « une épingle » : l'épingle à personnage garde un seul sens par symbole (règle déjà notée le 2026-11-05).
- 12 points sur tout le trajet : un point se remplit tous les 8 % du trajet environ. Pas de changement du nombre de points.
