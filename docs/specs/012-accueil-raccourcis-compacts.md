# 012 — Accueil : raccourcis de lieux plus petits

- **Statut** : livré
- **Date** : 2026-11-04
- **Persona** : voyageur
- **Révise** : spec 011 (taille des tuiles du panneau du bas)

## Besoin

Première ouverture de l'app sur un vrai téléphone (build de dev Android) : le panneau des raccourcis de lieux, agrandi par la spec 011 d'après le navigateur, est trop grand et peu élégant. Il cache trop de carte. L'utilisateur veut seulement réduire sa taille, sans changer sa forme.

## Parcours

1. L'accueil garde la carte blanche flottante du bas, avec les mêmes raccourcis, dans le même ordre, avec le même rôle : toucher une tuile remplit le bout qui appelle (départ ou arrivée).
2. Les tuiles passent à **64 dp** (au lieu d'environ 117), de 56 à 64 dp selon l'écran, espacées de 8 à 14 dp : environ **quatre tuiles et demie** visibles. Taille et écart sont choisis pour que le bord coupe toujours la dernière tuile visible entre 40 % et 65 %, pour inviter à glisser, quelle que soit la largeur du téléphone.
3. Le panneau est plus fin : marges intérieures de 12 dp au lieu de 16. Il fait environ 100 dp de haut au lieu de 160.
4. Dans une tuile à photo, la pastille blanche du pictogramme passe de 30 à 26 dp (pictogramme de 16 dp, second canal d'un lieu à photo) ; dans une tuile sans photo, le pictogramme garde 45 % de la tuile. Coins de 16 dp au lieu de 18.
5. Une fois les deux bouts choisis : ✕ et ✓ inchangés (mêmes tailles qu'aujourd'hui).

## Signaux

Inchangés (spec 011) : bout à remplir par halo pulsé et contour épais ; lieu choisi par photo ou pictogramme dans la pastille, badge épingle / drapeau, son « select ».

## Cas limites

| Situation                  | Comportement attendu                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| Petit écran (320 × 640)    | tuiles à 56 dp minimum, la dernière coupée                                 |
| Grand écran (tablette)     | tuiles à 64 dp maximum, la rangée défile si les lieux dépassent            |
| Peu de lieux (2 ou 3)      | tuiles à gauche, sans étirement ; aucune coupée (rien à glisser)           |
| Lecture de droite à gauche | rangée jamais inversée (spec 006)                                          |
| Lieu caché de la carte     | jamais sa photo dans la tuile, seulement son pictogramme (règle existante) |

## Données et confidentialité

Aucun changement : aucune donnée, dépendance, permission ni appel réseau.

## Hors périmètre

- La pilule du chemin (pastilles de 56 dp) et les boutons « + » et accompagnant.
- La feuille de tous les lieux (ses tuiles restent à la taille de la spec 009).
- ✕ et ✓ une fois les deux bouts choisis.

## Critères d'acceptation

- [ ] Tuiles de 64 dp à 390 dp de large, 56 dp minimum à 320 dp ; la dernière tuile visible coupée entre 40 % et 65 % à 320, 360, 390, 393 et 412 dp.
- [ ] Panneau d'environ 100 dp de haut avec les tuiles.
- [ ] Toucher une tuile remplit toujours le bout qui appelle.
- [ ] Un test vérifie taille, écart et coupe de la dernière tuile (320, 360, 390, 393, 412, très large).
- [ ] Vérifié sur le téléphone de l'utilisateur (rechargement en direct) et dans le navigateur à 320 dp ; relu par `ux-sans-texte-reviewer`.

## Hypothèses

- 64 dp reste au-dessus de la cible tactile de 48 dp ; la photo plus petite reste reconnaissable. À observer en test avec des voyageurs (pouce stressé, plein soleil).
- Le panneau passe d'environ 100 dp (tuiles) à environ 88 dp (✕ et ✓) : le cadrage de la carte bouge un peu au moment du choix. Accepté.

## Ajustements après la relecture `ux-sans-texte-reviewer` (2026-11-04)

- Avec une taille fixe, la dernière tuile paraissait entière à 390 dp et cinq tuiles entières tenaient à 393 et 412 dp (Pixel, Galaxy A) : plus rien n'invitait à glisser. Taille et écart sont maintenant calculés à partir de la part visible de la dernière tuile.
- Pastille du pictogramme sur photo à 26 dp au lieu de 22 : un pictogramme de 14 dp au trait fin devenait illisible au soleil.
- À vérifier sur le téléphone en RTL forcé (spec 006) : la rangée horizontale ne doit pas s'ouvrir déjà défilée vers la fin. Existait avant cette spec.
- À tester sur le terrain : écarts de 8 dp avec un pouce stressé ; façade de 64 dp reconnue en plein soleil ; la tuile coupée suffit-elle à faire glisser ; la carte gagnée vaut-elle la perte de taille (comparer avec la version 011).

## Questions / réponses

- Taille : petites tuiles, environ 64 dp.
- « Peu élégant » : c'est surtout la taille ; on réduit seulement.
- Forme : carte blanche flottante gardée, plus fine.
