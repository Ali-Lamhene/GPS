# 013 — Accueil : colonne de boutons et crédit de carte plus discret

- **Statut** : livré
- **Date** : 2026-11-04
- **Persona** : voyageur (accueil), accompagnant (bouton d'adresse)
- **Révise** : spec 011 (bouton de l'accompagnant collé au « + »), spec 009 (ⓘ de 34 dp)

## Besoin

Sur le téléphone, deux détails de l'accueil gênent l'utilisateur :

1. Le ⓘ du crédit OpenStreetMap est trop grand.
2. Les boutons ronds de droite sont éparpillés : l'accompagnant à gauche du « + », le recentrage au-dessus. Ils doivent former une seule colonne verticale.

## Parcours

1. En bas à droite de l'accueil, au-dessus du panneau des raccourcis, une colonne de boutons ronds, de haut en bas :
   - **recentrer** (cible, 40 dp, blanc chaud), seulement quand la carte a été déplacée ;
   - **accompagnant** (deux personnes, 36 dp, blanc chaud) : un toucher ouvre le formulaire d'adresse (E30) ;
   - **« + »** (48 dp, émeraude) : un toucher ouvre « nouveau lieu ici » (E27).
2. Les trois boutons sont centrés sur le même axe vertical, espacés de 12 dp. Le « + » reste à sa place actuelle, au-dessus du panneau, au bord droit.
3. Quand le recentrage apparaît ou disparaît, l'accompagnant et le « + » ne bougent pas.
4. Le ⓘ du crédit de carte passe de 34 à **24 dp**, sur **tous les écrans** qui montrent la carte, toujours en bas à gauche. Sa zone de toucher reste d'au moins 48 dp (marge invisible). Toucher le ⓘ déplie toujours « © OpenStreetMap, Protomaps », et le referme.
5. Les autres écrans gardent leur recentrage à sa place actuelle.

## Signaux

Inchangés : chaque bouton garde son pictogramme, sa couleur et son action.

## Cas limites

| Situation                        | Comportement attendu                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Carte non déplacée               | pas de recentrage ; l'accompagnant et le « + » restent à leur place                |
| Panneau en état ✕ / ✓ (plus bas) | la colonne suit le haut du panneau, comme le « + » aujourd'hui                     |
| Petit écran (320 × 640)          | la colonne ne touche pas la pilule du chemin en haut                               |
| Lecture de droite à gauche       | colonne toujours à droite, jamais inversée (comme la carte, spec 006)              |
| Crédit déplié                    | le texte reste lisible, la pilule s'allonge vers la droite sans couvrir la colonne |

## Données et confidentialité

Aucun changement : aucune donnée, dépendance, permission ni appel réseau. Le crédit reste du texte simple, sans lien vers un site (D9).

## Hors périmètre

- Les tailles des boutons de la colonne (gardées).
- La place du recentrage sur les autres écrans.

## Critères d'acceptation

- [ ] Sur l'accueil, de haut en bas : recentrer (si la carte a bougé), accompagnant, « + », centrés sur le même axe, espacés de 12 dp.
- [ ] Faire apparaître le recentrage (déplacer la carte) ne fait bouger ni l'accompagnant ni le « + ».
- [ ] ⓘ de 24 dp sur tous les écrans avec carte, zone de toucher d'au moins 48 dp ; il déplie et replie le crédit.
- [ ] Vérifié sur le téléphone de l'utilisateur et dans le navigateur à 320 dp ; relu par `ux-sans-texte-reviewer`.

## Hypothèses

- Écart de 12 dp entre les boutons de la colonne.
- Le « i » du ⓘ passe à 13 dp, en gras émeraude.
- Le cadrage de la carte garde environ 70 dp libres à droite, pour qu'aucune épingle de lieu ne tombe sous la colonne de boutons (relecture `ux-sans-texte-reviewer`) : toucher son lieu ne doit jamais ouvrir le formulaire d'adresse.

## Ajustements après la relecture `ux-sans-texte-reviewer` (2026-11-04)

- Marge droite du cadrage portée à environ 70 dp (ci-dessus).
- Navigateur : zone de toucher du ⓘ de MapLibre agrandie à 48 px.
- Test de l'ordre de la colonne (accompagnant au-dessus du « + »).
- À tester sur le terrain : erreurs de toucher entre recentrer et accompagnant en marchant ; ⓘ de 24 dp visible en plein soleil ; colonne et pilule du chemin sur un petit écran avec le panneau déplié.

## Questions / réponses

- Ordre de la colonne : recentrer, accompagnant, « + » (de haut en bas).
- Tailles des boutons : gardées (48, 40, 36 dp).
- ⓘ : 24 dp, partout où la carte s'affiche.
