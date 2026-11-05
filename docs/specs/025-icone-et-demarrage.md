# 025 — Icône et écran de démarrage

- **Statut** : livré (rendus vérifiés ; à voir sur téléphone avec la build `preview`)
- **Date** : 2026-11-05
- **Persona** : voyageur et accompagnant

## Besoin

L'app portait encore l'icône et l'écran de démarrage du modèle Expo (« A » bleu). Il lui faut une icône que le voyageur reconnaît sans lire, et qui ne dit rien de plus qu'« une app de trajets » à qui regarde le téléphone.

## Choix de l'utilisateur (2026-11-05)

Sur planches de propositions (`docs/design/icone/propositions.html`, `docs/design/demarrage/propositions.html`) :

- **Icône : A**, l'épingle émeraude (#037C6D) au point blanc chaud, sur fond blanc chaud (#FBF8F6). La même épingle que sur les cartes de l'app et sur la page des liens.
- **Écran de démarrage : 4**, l'épingle blanc chaud au point émeraude, sur fond émeraude plein.

## Réalisation

- Sources vectorielles dans `assets/icon-sources/` (SVG), rendues en PNG 1024 × 1024 dans `assets/images/`.
- Android : icône adaptative, épingle sur fond blanc chaud, à l'intérieur de la zone sûre ; version monochrome pour les icônes à thème (Android 13 et plus).
- Écran de démarrage (`expo-splash-screen`) : fond #037C6D, image 120 dp au centre. Android 12 et plus impose une image au centre sur une couleur unie.
- Icône iOS : la même image (`icon`), le dossier Icon Composer du modèle Expo est retiré.
- Favicon de la version web : l'icône A en 48 px.

## Données et confidentialité

Aucune donnée, aucun appel. Les images sont dans l'app.

## Hors périmètre

- Pas d'icône distincte pour la build de développement (« Yalla map dev » garde la même icône ; son nom la distingue).
- Pas d'écran de démarrage sombre : l’app reste en mode clair (`userInterfaceStyle: "light"`, spec 018).
- Pas d'animation de démarrage.

## Critères d'acceptation

- [x] Icône et écran de démarrage rendus et vérifiés en image (cercle d'Android, petite taille, monochrome, écran de démarrage à 390 × 844).
- [ ] Sur téléphone (build `preview`) : icône sur l'écran d'accueil d'Android, icône à thème, écran de démarrage émeraude au lancement à froid.
- [x] Relu par `security-reviewer` (app.json).

## Hypothèses

- Le passage du démarrage émeraude à l'accueil crème est voulu (choix 4), même s'il est plus marqué qu'avec un fond clair.
