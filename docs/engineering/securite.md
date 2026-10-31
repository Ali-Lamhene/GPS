# Règles de sécurité

À lire avant d'écrire du code qui touche au stockage, au réseau, aux liens, aux permissions ou à la configuration native. Traduit en règles de code la décision D1 (`docs/product/decisions.md`). L'agent `security-reviewer` vérifie ces règles avant chaque commit concerné.

## 1. Menaces

Ce qu'on protège : où va le voyageur et où il vit (lieux, trajets, positions), qui l'accompagne (numéro et photo de l'accompagnateur, si la spec du bouton d'aide les retient : question ouverte 6 de `docs/status.md`).

Contre qui :

- **Un État qui surveille** : interception réseau, demandes aux services tiers, logiciels espions.
- **Une association piratée** : rien chez nous à voler, c'est le but de D1.
- **Un téléphone pris ou fouillé** (police, passeur, entourage) : téléphone déverrouillé, l'app ouverte montre les lieux.
- **Un lien piégé** : quelqu'un fabrique un lien de partage malveillant et l'envoie au voyageur.
- **Une autre app sur le téléphone** : interception des liens, lecture des fichiers partagés, du presse-papiers ou des logs.

## 2. Ce qui quitte le téléphone

- Seuls les services listés dans la section « Données et confidentialité » d'une spec validée sont appelés. Pour chacun : ce qu'il reçoit (y compris l'adresse IP).
- HTTPS uniquement. Pas de trafic en clair (`http://`).
- Les hôtes appelés sont centralisés dans un seul module de `src/services/` : pas d'URL éparpillée dans le code.
- L'accueil et le guidage du voyageur n'appellent aucun service sauf si une spec le dit.
- Interdits par principe : analytics, rapport de plantage, publicité, notifications push distantes, configuration à distance. La liste des paquets interdits est dans `eslint/forbidden-packages.js`. Elle est vérifiée par ESLint (imports) et par un test sur `package.json` (une dépendance native s'active même sans import).
- EAS Update (`expo-updates`), si on l'ajoute un jour, interroge un serveur Expo à chaque lancement : à justifier dans une spec avant de l'installer.
- Aucun secret dans le code : tout ce qui commence par `EXPO_PUBLIC_` est lisible dans l'app publiée. Si un service exige une clé privée, il ne peut pas être appelé depuis l'app.

## 3. Lien de partage et liens profonds

Le lien de partage est une **entrée non fiable** : n'importe qui peut en fabriquer un.

- Décodage dans `src/domain/`, validé par un schéma strict (version du format, bornes des coordonnées, pictogramme dans la liste connue, couleur dans la palette). Tout le reste est refusé.
- Taille maximale vérifiée avant décodage.
- Jamais d'`eval`, de `new Function`, ni d'URL construite à partir du contenu du lien (ESLint interdit les deux premiers).
- Lien invalide : rien n'est ajouté, signal d'erreur prévu par la spec 001. Aucune trace du contenu dans les logs.
- Les liens publiés sont des liens `https://` vérifiés (Android App Links, iOS Universal Links). Le schéma `gps://` peut être réclamé par une autre app : il ne sert qu'en développement et ne doit jamais transporter un lieu.
- Expo Router rend toutes les routes accessibles par lien profond. Une route ne doit **jamais agir à l'ouverture** (ajouter, supprimer, appeler, partager) à partir de ses paramètres sans validation et sans le parcours prévu par la spec. Les routes de la partie préparation ne doivent pas être ouvrables par un lien externe pour contourner l'appui long caché (D8).

## 4. Données sur le téléphone

- Tout est stocké dans le stockage privé de l'app. Rien dans un stockage partagé (galerie, Téléchargements, cartes SD).
- Numéro de l'accompagnateur, s'il est un jour enregistré : `expo-secure-store` (Keystore / Keychain).
- Lieux et trajets : stockage privé de l'app. Le chiffrement au repos est une question ouverte (voir plus bas).
- Photos : copiées dans le stockage privé, métadonnées EXIF (dont la position) supprimées avant enregistrement (spec 001).
- Pas de stockage plus long que nécessaire : une donnée temporaire (photo choisie puis abandonnée, fichier de partage) est supprimée dès qu'elle ne sert plus.
- Sauvegarde Android : `android.allowBackup` à `false` dans `app.json`, sinon les données partent dans la sauvegarde Google du compte du téléphone.
- Presse-papiers : ne jamais y copier un lieu ou une position sans action explicite de l'accompagnateur.

## 5. Logs

- Pas de `console.*` dans `src/` (ESLint). Les logs Android (`adb logcat`) sont lisibles par d'autres outils et finissent dans les rapports de bug.
- Jamais de coordonnées, de lien de partage, de numéro de téléphone dans un message d'erreur.

## 6. Permissions

- Demander une permission au moment où elle sert, pas au lancement.
- Localisation : au premier plan seulement, tant qu'aucune spec n'exige l'arrière-plan.
- Les permissions inutiles ajoutées par des bibliothèques sont retirées avec `android.blockedPermissions` dans `app.json`.
- Chaque permission demandée figure dans la spec, avec le parcours sans texte qui permet au voyageur de passer la fenêtre système (qui, elle, contient du texte).

## 7. Dépendances

- Avant d'ajouter un paquet : est-il maintenu, a-t-il du code natif, que contacte-t-il sur le réseau, quelles permissions ajoute-t-il ? La réponse va dans la spec ou le commit.
- `npm run audit` (CI) bloque les failles hautes et critiques. Une exception dans `audit-ci.jsonc` est commentée et datée.
- Pas de WebView qui charge une page distante.

## 8. Vérification avant commit

Lancer l'agent `security-reviewer` pour tout changement qui touche : `package.json`, `app.json`, `src/services/`, le décodage du lien, les routes, les permissions ou le stockage.

## Questions ouvertes

1. Chiffrer les lieux et trajets au repos (SQLite chiffré, clé dans le Keystore) ? Utile si le téléphone est volé verrouillé ; inutile s'il est fouillé déverrouillé.
2. Téléphone fouillé : faut-il un moyen rapide d'effacer ou de cacher les lieux ?
3. Bloquer les captures d'écran (`FLAG_SECURE`) sur certains écrans de la partie préparation ?
