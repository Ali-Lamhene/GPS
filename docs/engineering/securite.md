# Règles de sécurité

À lire avant d'écrire du code qui touche au stockage, au réseau, aux liens, aux permissions ou à la configuration native. Traduit en règles de code la décision D1 (`docs/product/decisions.md`). L'agent `security-reviewer` vérifie ces règles avant chaque commit concerné.

## 1. Menaces

Public : des personnes réfugiées **déjà en France**, accompagnées par des associations, qui ne savent pas lire. Ce ne sont pas des personnes recherchées, et elles utilisent déjà Google Maps et des services du même genre. Le but n'est pas de ne laisser aucune trace nulle part : c'est de leur simplifier la vie avec au moins autant de confidentialité qu'une app grand public (précision de l'utilisateur dans D1, 2026-11-08).

Ce qu'on protège avant tout : **un lien entre une identité (nom, prénom, adresse…) et des déplacements**, que quelqu'un pourrait voler chez nous ou chez une association.

Contre qui, par ordre d'importance :

- **Un piratage visant le projet ou une association** (un gouvernement étranger, par exemple) : il ne doit rien y avoir chez nous à voler. Pas de compte, pas de donnée d'identité, pas de serveur à nous, aucun traceur. C'est le cœur de D1.
- **Un lien piégé** : quelqu'un fabrique un lien de partage malveillant et l'envoie au voyageur.
- **Une autre app sur le téléphone** : interception des liens, lecture des fichiers partagés, du presse-papiers ou des logs.
- **Un téléphone pris ou fouillé** (entourage, vol) : téléphone déverrouillé, l'app ouverte montre les lieux. Précautions raisonnables seulement (lieux cachés de la carte, rien hors du stockage privé).

Ce qui n'est **pas** une menace visée : qu'un service tiers sans compte (Transitous, Photon, Panoramax, tuiles de carte) reçoive une position et une adresse IP quand une fonctionnalité en a besoin. Un État étranger ne peut pas obtenir d'un opérateur français l'identité derrière une adresse IP. Ces appels sont acceptés **à condition d'être déclarés** dans la spec (ce qu'ils reçoivent) et ci-dessous.

## 2. Ce qui quitte le téléphone

- Seuls les services listés dans la section « Données et confidentialité » d'une spec validée sont appelés. Pour chacun : ce qu'il reçoit (y compris l'adresse IP).
- HTTPS uniquement. Pas de trafic en clair (`http://`).
- Les hôtes appelés sont centralisés dans un seul module de `src/services/` : pas d'URL éparpillée dans le code.
- Hôtes, tous déclarés dans `src/services/hosts.ts` : `tiles.openfreemap.org` (tuiles de la carte, D16 : IP et zones affichées), `photon.komoot.io` (recherche d'adresse, partie accompagnant, spec 019 : texte tapé, position à environ 1 km, IP ; et adresse d'un lieu créé ou accepté, une fois, spec 029 : point du lieu à environ 10 m, IP), `ali-lamhene.github.io` (page et vérification du lien de partage ; aucun autre dépôt du compte ne doit s'appeler `l` ni avoir GitHub Pages activé, sinon il remplacerait la page de repli `l/` ; jamais appelée par l'app ; Android, par les services Google, y lit `/.well-known/assetlinks.json` à l'installation et à chaque mise à jour : Google et l'hébergeur apprennent que cet appareil ou cette IP a installé une app liée à ce domaine). `api.transitous.org` (calcul des trajets, D17, spec 021 : départ et arrivée à environ 10 m ; recalcul quand le voyageur s'est perdu, spec 031 : sa position en cours de route à environ 10 m, 6 fois au plus par trajet, requêtes reliables entre elles en une trace partielle et datée ; heure, IP, en-tête « YallaMap/1.0 » avec une adresse de contact neutre, comme ses conditions l'exigent (D19)). `api.panoramax.xyz` (photo de rue de l'arrivée, spec 030 : point d'arrivée à environ 10 m, une fois par trajet, IP ; jamais pour un lieu caché ou qui a sa propre photo ; et photo proposée à la création d'un lieu, spec 033 : point du lieu à environ 10 m, une fois par ouverture de l'écran photo E29, IP, **lieux cachés compris** par choix de l'utilisateur ; la photo choisie est réencodée sans métadonnées et gardée comme une photo prise) et les serveurs d'images Panoramax `panoramax.ign.fr` (qui redirige vers son stockage `panoramax-storage-public-fast.s3.gra.perf.cloud.ovh.net`) et `panoramax.openstreetmap.fr` (IP, image demandée ; image téléchargée une fois et gardée en mémoire seulement ; spec 033 : la photo choisie pour un lieu est écrite brièvement dans le cache, dossier `StreetPhoto` vidé à l'ouverture et à la sortie de E29, avant d'être réencodée sans métadonnées). Requêtes réseau de l'app en `Cache-Control: no-store`. Pages de crédit (spec 024) : `transitous.org/sources/` et `www.openstreetmap.org/copyright`, jamais appelées par l'app, ouvertes dans le navigateur seulement quand l'accompagnant touche un lien de crédit : le site reçoit l'IP du téléphone et ce que le navigateur envoie à tout site (cookies, statistiques du site visité) ; la visite reste dans l'historique du navigateur. Seuls `src/services/credits.ts` (pages fixes) et `location.ts` (réglages) peuvent ouvrir une adresse : ESLint interdit `Linking`, `expo-linking` et `expo-web-browser` ailleurs. La position du téléphone passe par le fournisseur standard d'Android (services Google), réglé par le téléphone, pas par l'app.
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
- Les liens publiés sont des liens `https://` vérifiés (Android App Links, iOS Universal Links). La build publiée ne déclare **aucun schéma** (D19) : seuls les liens `https://` vérifiés l'ouvrent. Sans schéma, Expo Router (`getRootURL`) attrape l'erreur d'`expo-linking` et part de « / ». La build de développement déclare `yalla-dev://`, pour le client de développement ; un schéma peut être réclamé par une autre app, il ne transporte jamais un lieu.
- Expo Router rend toutes les routes accessibles par lien profond. Une route ne doit **jamais agir à l'ouverture** (ajouter, supprimer, appeler, partager) à partir de ses paramètres sans validation et sans le parcours prévu par la spec. Les routes de la partie préparation ne doivent pas être ouvrables par un lien externe pour contourner l'appui long caché (D8).

## 4. Données sur le téléphone

- Tout est stocké dans le stockage privé de l'app. Rien dans un stockage partagé (galerie, Téléchargements, cartes SD).
- Secret éventuel (aucun aujourd'hui, D10 exclut tout numéro de téléphone) : `expo-secure-store` (Keystore / Keychain).
- Lieux et trajets : stockage privé de l'app. Le chiffrement au repos est une question ouverte (voir plus bas).
- Photos : copiées dans le stockage privé, métadonnées EXIF (dont la position) supprimées avant enregistrement (spec 001).
- Photos des lieux : jamais dans un cache disque. `expo-image` en `cachePolicy="memory"` ; les épingles de la carte utilisent l'image de React Native, qui lit un fichier local sans en écrire de copie. Jamais d'adresse web dans ces composants (`isLocalPicture`).
- Pas de stockage plus long que nécessaire : une donnée temporaire (photo choisie puis abandonnée, fichier de partage) est supprimée dès qu'elle ne sert plus.
- Aucune sauvegarde ni aucun transfert (spec 016) :
  - Android : `android.allowBackup` à `false` dans `app.json` (sauvegarde Google, Android 11 et moins), et règles d'extraction du plugin `plugins/with-no-data-extraction.js` qui excluent tous les domaines de la sauvegarde en ligne et du transfert direct (Android 12 et plus).
  - iPhone : `modules/backup-exclusion` marque Documents et Application Support « exclus de la sauvegarde » (iCloud et ordinateur) à chaque lancement.
  - Une bibliothèque qui pose ses propres règles de sauvegarde les écraserait : `expo-secure-store`, si on l'ajoute, se configure avec `configureAndroidBackup: false`.
- Presse-papiers : ne jamais y copier un lieu ou une position sans action explicite de l'accompagnateur.

## 5. Logs

- Pas de `console.*` dans `src/` (ESLint). Les logs Android (`adb logcat`) sont lisibles par d'autres outils et finissent dans les rapports de bug.
- Jamais de coordonnées, de lien de partage, de numéro de téléphone dans un message d'erreur.
- MapLibre Native écrit ses erreurs dans logcat (`Log.e`), avec parfois des numéros de tuile, donc la zone regardée. On ne peut pas les couper sans modifier la bibliothèque : accepté, ses logs ne passent plus par la console JS (`src/ui/map/native-map-setup.ts`).

## 6. Permissions

- Demander une permission au moment où elle sert, pas au lancement. Exception : la localisation est demandée au premier lancement, en général en présence de l'accompagnant (D16, spec 017).
- Localisation : au premier plan seulement, tant qu'aucune spec n'exige l'arrière-plan. `expo-location` passe par les services Google Play (fournisseur « fused ») ; l'app n'ouvre jamais la fenêtre Google « activer la précision », qui enverrait les Wi-Fi alentour à Google. Décision du 2026-11-12 : on garde ce fournisseur plutôt que le GPS seul. En ville, le GPS seul dérive davantage et met plus longtemps à trouver la position (arrivée à 15 m, alerte à 15 m) ; ce que Google reçoit dépend du réglage « Précision de la localisation Google » du téléphone, que les voyageurs ont déjà pour Google Maps (menace visée : aucune donnée chez nous, D1).
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
