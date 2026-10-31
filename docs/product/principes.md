# Principes de conception (interface du voyageur)

Ces principes s'appliquent à tout écran, son ou vibration destiné au voyageur. Ils sont vérifiés par la règle ESLint `gps/no-text-in-traveller-ui` (pour le texte) et par le sous-agent `ux-sans-texte-reviewer` (pour le reste).

1. **Zéro texte, zéro chiffre à lire.** Le sens passe par les pictogrammes, les photos, la couleur, la forme, le son et la vibration. Les distances et les durées sont des quantités visuelles (jauges, pas, cadrans), jamais des chiffres. Seules exceptions (D9) : identifiants de ligne, noms de station, carte d'aide en français pour un passant.
2. **Un écran, une décision.** Seulement ce dont le voyageur a besoin maintenant : le prochain mouvement. Pas de menu, pas de réglages, pas de saisie.
3. **Signaux redondants.** Chaque instruction passe par au moins deux canaux (flèche + vibration, couleur + son), pour résister au soleil, au bruit, au daltonisme.
4. **Grandes cibles tactiles, fort contraste.** Rien ne dépend de la lecture d'une carte.
5. **Rassurer d'abord.** Le voyageur sait toujours s'il va dans la bonne direction, et peut toujours demander de l'aide en un geste : la carte d'aide, à montrer à un passant (D10).
6. **Pictogrammes culturellement neutres.** Éviter les symboles qui n'ont de sens que dans une culture ou qui supposent de savoir lire (lettres, flèches légendées, drapeaux pour les langues).
7. **Confidentialité.** Le voyageur est une personne vulnérable, parfois surveillée par son pays d'origine : aucun compte, aucune donnée d'identité, aucun serveur qui stocke trajets ou positions, la position reste sur le téléphone sauf s'il la partage explicitement. Voir `decisions.md` (D1).

## Code

- L'interface du voyageur vit dans `src/features/traveller/`. Celle du travailleur social dans `src/features/social-worker/`.
- Dans `src/features/traveller/` et `src/ui/`, aucun texte affiché : pas de `Text` de React Native, pas de texte en dur dans le JSX. Les libellés d'accessibilité (`accessibilityLabel`) restent autorisés.
- Les exceptions D9 vivent dans des composants dédiés, listés nommément dans `eslint.config.js` : on n'en ajoute pas sans décision écrite.
