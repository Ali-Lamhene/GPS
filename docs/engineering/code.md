# Règles de code

À lire avant d'écrire du code dans `src/`. Complète `AGENTS.md` (règles Expo) et `.claude/CLAUDE.md` (organisation du travail). La sécurité a son propre document : `securite.md`.

Le contexte décide de tout : téléphones Android d'entrée de gamme, souvent sans réseau, utilisés par des personnes stressées qui ne peuvent pas nous dire ce qui ne marche pas. Le code doit donc être simple, prévisible et testé.

## 1. Organisation des dossiers

```
src/
  app/                    routes Expo Router uniquement, fichiers minces
  features/
    traveller/            interface du voyageur (zéro texte, règle ESLint)
    social-worker/        partie préparation (texte autorisé)
  domain/                 logique métier pure : lieux, encodage du lien, distances, caps
  services/               effets de bord : stockage, GPS, son, vibration, réseau
  ui/                     design system : thème (tokens) et composants partagés
```

- **`src/app/`** : un fichier de route importe un écran de `features/` et le rend. Pas de logique, pas de style. Jamais de test ni d'utilitaire ici : chaque fichier est une route.
- **`src/domain/`** : TypeScript pur. Aucun import de `react`, `react-native` ou `expo-*`. C'est ce qui rend la logique testable sans téléphone.
- **`src/services/`** : chaque module natif (stockage, localisation, haptique, audio) est enveloppé dans un petit module à nous. Le reste du code dépend de cette enveloppe, pas du module Expo directement. On change de bibliothèque à un seul endroit, et les tests remplacent l'enveloppe.
- **`src/ui/`** : le thème et les composants issus du design system Claude Design « GPS sans texte » (CarteLieu, BarreTrajet, Confirmation, BoutonAide…). Suivre le skill `expo:expo-design-system`.
- Dans une feature : `components/`, `screens/`, `hooks/`, et `__tests__/` à côté du code testé.
- Imports par l'alias `@/` (`@/domain/place`), pas de `../../..`.

## 2. Composants

- Composants fonctions, un composant exporté par fichier, nom de fichier en `kebab-case.tsx`, composant en `PascalCase`.
- Un composant fait une chose. Au-delà d'environ 150 lignes ou de deux responsabilités, découper.
- Props typées par un `type XxxProps` nommé. Préférer la composition (`children`, sous-composants) à une accumulation de booléens (`isBig`, `isRed`, `withIcon`…). Les variations passent par des props `variant` / `size` / `state` (skill `expo:expo-design-system`).
- Pas de logique dans le JSX : calculs et décisions dans un hook ou dans `domain/`, le JSX ne fait qu'afficher.
- Un écran a un état explicite, modélisé par une union discriminée (`{ kind: 'loading' } | { kind: 'ready'; place: Place } | { kind: 'error'; reason: … }`), et chaque cas a son rendu. Pas de combinaisons de booléens `isLoading && !error`.

## 3. Style et design system

- Aucune couleur, taille, marge, rayon ou durée codée en dur dans un composant : tout vient des tokens du thème (`src/ui/theme`).
- `StyleSheet.create` en bas du fichier ; pas d'objets de style recréés à chaque rendu.
- Cibles tactiles du voyageur : au moins 64 dp (voir `docs/product/principes.md`).
- Tester chaque écran en lumière forte et en mode sombre si le thème le prévoit.

## 4. TypeScript

- `strict`, `noUncheckedIndexedAccess` : ne pas les contourner.
- Interdits (ESLint) : `any`, l'assertion non nulle `!`. Utiliser `unknown` puis vérifier, ou un garde de type.
- Pas de `as` pour forcer un type, sauf à une frontière documentée par un commentaire.
- Toute donnée qui vient de l'extérieur (lien, stockage, réseau, paramètres de route) est `unknown` jusqu'à sa validation par un schéma (voir `securite.md`).
- `switch` sur une union : exhaustif, avec un cas `default` qui vérifie `never`.

## 5. Erreurs

- Ne jamais avaler une erreur en silence (`catch {}`). Chaque erreur devient un état visible : pour le voyageur, un signal sans texte prévu par la spec ; pour l'accompagnateur, un message clair.
- Les fonctions de `domain/` qui peuvent échouer renvoient un résultat typé (`{ ok: true, value } | { ok: false, reason }`) plutôt que de lever une exception.
- Pas de `console.*` (ESLint) : voir `securite.md`.

## 6. Hooks et effets

- Toute logique avec effet de bord vit dans un hook (`use-xxx.ts`).
- Chaque abonnement (position GPS, boussole, écouteur de liens, minuteur) est arrêté dans la fonction de nettoyage de l'effet. Un abonnement GPS oublié vide la batterie du voyageur.
- Le React Compiler est activé (`app.json`) : ne pas ajouter `useMemo` / `useCallback` / `React.memo` par réflexe, seulement si une mesure le justifie.

## 7. Performance et hors connexion

- Cible : un Android d'entrée de gamme. Listes avec `FlatList` (ou FlashList si mesuré), images avec `expo-image`, photos redimensionnées à l'enregistrement.
- Animations sur le thread UI (Reanimated), skill `expo:expo-animation`.
- Toute fonctionnalité du voyageur marche sans réseau, sauf ce que la spec dit explicitement.

## 8. Tests

- Logique de `domain/` : tests unitaires d'abord, cas limites compris (lien abîmé, coordonnées hors bornes, format inconnu).
- Composants : `@testing-library/react-native`, recherche par rôle ou `accessibilityLabel` (l'interface voyageur n'a pas de texte à chercher). Tester le comportement, pas l'arbre.
- Services : tester avec l'enveloppe remplacée par un faux.
- Tests dans `__tests__/` à côté du code, nommés `<nom>-test.ts(x)`.

## 9. Dépendances

- `npx expo install <paquet>`, jamais `npm install` direct pour une dépendance de l'app.
- Préférer un module Expo officiel. Toute nouvelle dépendance est justifiée dans la spec ou le message de commit : à quoi elle sert, sa maintenance, si elle a du code natif, et **ce qu'elle envoie sur le réseau** (voir `securite.md`).

## 10. Nommage et commentaires

- Code, commentaires et commits en anglais ; specs et docs produit en français.
- Glossaire, pour garder un seul mot par notion :

| Français        | Code          |
| --------------- | ------------- |
| voyageur        | traveller     |
| accompagnateur  | social worker |
| lieu            | place         |
| trajet          | trip          |
| étape           | leg           |
| guidage         | guidance      |
| lien de partage | share link    |

- Un commentaire explique pourquoi, pas ce que fait le code. Renvoyer à la spec ou à la décision quand une règle en vient (`// D1: …`, `// Spec 001: …`).
