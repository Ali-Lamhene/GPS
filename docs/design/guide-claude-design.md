# Utiliser Claude Design pour les maquettes

Mode d'emploi pour obtenir des maquettes fidèles au projet, pas un rendu générique. À lire avec `brief.md`.

## Ce qu'il faut savoir

- **Claude Design dessine sur un canvas** : une grande surface où chaque écran est un « artboard » (un cadre de 360 × 800 pour nous). On peut zoomer, ranger les artboards en **pages**, poser des **notes**, et tester un écran avec **Play** (les boutons réagissent).
- **Il ne connaît que ce qu'on lui donne.** Sans photos ni pictogrammes, il dessine des substituts : c'est ce qui a donné le style « jouet » de la première tentative.
- **Un design system lui donne la matière.** « GPS sans texte » (https://claude.ai/artifact/T8sKnYwYLZy4rM5vR8ZdXF) contient nos couleurs, la typo, les règles (README), les vraies photos, les pictogrammes ARASAAC noir et blanc et des composants de référence. Claude Design le lit avant de dessiner et réutilise ses fichiers.

## Mise en place (une fois)

1. **Ouvre le design system** et parcours-le : Overview (règles), Colors, Components (BarreTrajet, CarteLieu, EcranAccueil…), Assets (photos, pictogrammes). Si une règle te déplaît, dis-le-moi : je le corrige là, et toutes les maquettes suivront.
2. **Fais-en le design system par défaut, si l'option existe** (menu du design system ou réglages de Claude Design). Sinon, pas grave : le message d'ouverture du brief donne son lien, et c'est suffisant.
3. **Crée un nouveau canvas** plutôt que de retoucher l'ancien : dans claude.ai, demande « Crée un canvas Claude Design nommé GPS sans texte — maquettes v2 ». Garde l'ancien pour comparer, ou supprime-le.
4. **Vérifie que le design system est bien branché** : après le premier écran, le menu **Theme** du canvas doit montrer nos couleurs nommées (`ground`, `ink`, `place-ocre`…), pas des codes couleur nus. Sinon, redemande : « Installe le design system GPS sans texte sur ce canvas ».

## Travailler page par page

1. Colle le **message d'ouverture** (`brief.md`, section 0) seul. Attends la réponse.
2. Colle **un seul bloc** de page (Page 1, puis 2…). Ne colle jamais tout le brief d'un coup : plus la demande est grosse, plus il remplit avec du générique.
3. Regarde le résultat **en plein écran** (bouton PLAY puis « Play full screen ») : c'est la taille réelle d'un téléphone. Teste les écrans interactifs.
4. Corrige par petites demandes précises, une à la fois :
   - bien : « Sur V1-c, le halo de la case arrivée est trop faible : contour 3px `on-ink` et halo 12px. »
   - à éviter : « Fais plus joli. »
5. Pour comparer deux idées, demande **un artboard de plus** (« fais une variante V1-f avec… ») au lieu de remplacer l'existant.
6. Quand une page te convient, **envoie-moi le lien du canvas**. Je relis chaque écran (principes, liste noire, agent `ux-sans-texte-reviewer`) et je te renvoie les corrections prêtes à coller.

## Phrases utiles

- « Utilise la photo photo-hopital.jpg du design system, pas une autre image. »
- « N'invente pas de pictogramme : mets un cadre gris barré à la place et dis-moi lequel manque. »
- « Reprends le composant BarreTrajet du design system à l'identique. »
- « Aucun texte ni chiffre sur les écrans V, même dans une barre d'état. »
- « Ajoute une note jaune à côté de l'écran avec les vibrations et les sons. »
- « Range les artboards de cette page en ligne, dans l'ordre a, b, c. »

## Signaux d'alerte (à refuser tout de suite)

Dégradé, ombre molle, coins très ronds, émoji, illustration à plat ou 3D, personnage mignon, couleurs vives partout, texte ou chiffre chez le voyageur, image qui ne vient pas du design system. Réponse type : « Ceci enfreint la liste noire du design system (point X). Refais en respectant le README. »

## Ce que je n'ai pas pu vérifier

Je connais le format des canvas et des design systems, mais je n'ai pas vu tous les menus de Claude Design. Si un menu cité ici n'existe pas chez toi (« design system par défaut », « Theme »), dis-moi ce que tu vois et j'adapte.
