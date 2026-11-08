# Décisions produit structurantes

Décisions prises avec le porteur du projet. Elles conditionnent l'architecture. Toute spec doit les respecter ; les remettre en cause demande une discussion explicite.

## D1. Sécurité et confidentialité : aucune donnée d'identité (2026-10-29)

**Contexte.** Les voyageurs sont des réfugiés déjà en France, accompagnés par des associations. Les associations et le projet peuvent être la cible d'attaques informatiques, y compris de gouvernements étrangers qui chercheraient à relier une personne à ses déplacements.

**Précision de l'utilisateur (2026-11-08) sur la menace visée.** Les précautions servent d'abord à ce qu'aucun serveur à nous ne garde de données qui relient une personne (nom, prénom, adresse…) à ses déplacements : rien à pirater chez nous, donc rien qui intéresse un gouvernement étranger. Le public visé est d'abord des personnes illettrées, pas des personnes recherchées. Un État étranger ne peut pas obtenir d'un opérateur français l'identité derrière une adresse IP. En conséquence, les services tiers sans compte (Transitous, Photon, Panoramax, tuiles) peuvent recevoir des positions et des adresses IP quand une fonctionnalité le demande, en le déclarant dans la spec.

**Décision.** Ne prendre aucun risque et aucune responsabilité sur les données :

- Pas de compte, pas d'inscription, pas d'identifiant, ni pour le voyageur ni pour la personne qui prépare les trajets.
- Aucune collecte de donnée d'identité (nom, téléphone, e-mail, identifiant d'appareil, etc.).
- Pas de serveur à nous qui stocke des trajets, des adresses ou des positions. Pas de serveur de suivi.
- Pas d'outil d'analyse ni de suivi d'audience, pas de rapport de plantage qui envoie des données de l'appareil.
- La position du voyageur reste sur son téléphone.

**Conséquence.** Tout service tiers appelé par l'app doit être justifié dans la spec, avec les données qu'il reçoit.

## D2. Modes de déplacement (2026-10-29, révisée le 2026-11-05)

À pied et en transports en commun. La voiture a été retirée par l'utilisateur après les premiers essais (spec 026) : le public ne conduit pas, et un conducteur ne doit pas regarder un écran.

## D3. Le lieu est l'objet central (2026-10-29)

- Le voyageur possède une collection de **lieux** : maison, hôpital, préfecture, chez Maurice… Chaque lieu a des coordonnées, un pictogramme, une couleur et, si possible, une photo.
- Le voyageur ne saisit rien au clavier. Il compose un trajet en choisissant un lieu de départ et un lieu d'arrivée (toucher ou glisser les pictogrammes et photos).
- Un lieu se crée de deux façons :
  - **sur le téléphone du voyageur**, par une personne qui sait lire (accompagnateur, ami), dans la partie préparation (D8) ; la photo est prise ou choisie là et ne quitte jamais ce téléphone ;
  - **à distance** : l'accompagnateur tape une adresse sur son propre téléphone et partage un **lien**. Le voyageur touche le lien et le lieu est créé automatiquement chez lui. Exemple : l'adresse d'une convocation OFPRA.
- Le lieu partagé par lien est **encodé dans le lien lui-même** (coordonnées, pictogramme, couleur ; pas de photo, pas de nom). Aucun serveur ne le garde. Le téléphone de l'accompagnateur ne garde rien après le partage.

## D4. Calcul d'itinéraire et suivi (2026-10-29, révisée le même jour)

- Un trajet nouveau est calculé **depuis le téléphone du voyageur, avec internet**, par un service public gratuit (OpenStreetMap). Le service reçoit les coordonnées de départ et d'arrivée, aucune identité (il voit l'adresse IP).
- Les trajets déjà calculés sont conservés **uniquement sur le téléphone du voyageur** et marchent sans internet.
- Le téléphone du voyageur suit sa position GPS **en local** et sait où il en est dans le trajet (progression, écart, arrivée).

## D5. Hors connexion (2026-10-29)

Les trajets enregistrés sont stockés sur le téléphone du voyageur et utilisables sans internet. Rien n'est sauvegardé en ligne.

## D6. Carte (2026-10-29)

Une carte est toujours affichée, **en plus** des signaux sans texte (flèche, photos, jauge, sons, vibrations). Le tracé du chemin aide même sans savoir lire. Le guidage ne dépend jamais de la lecture de la carte.

## D8. Préparation des trajets dans la même app (2026-10-29)

- Une seule app. Elle contient l'interface du voyageur et une partie « préparation » réservée aux personnes qui créent les trajets.
- On y entre par un appui long caché sur l'accueil, pour que le voyageur n'y tombe pas par hasard.
- La personne qui prépare y crée des lieux (D3) : recherche d'adresse ou point touché sur la carte, pictogramme, couleur, photo. Elle peut aussi partager un lieu par lien.
- Le lien est un lien `https://` vers une page web statique gratuite (sans données), qui ouvre l'app. Le lieu est dans la partie après `#`, jamais envoyée au serveur.
- Le voyageur n'a jamais besoin d'aller dans la partie préparation. Cette partie peut contenir du texte.

## D7. Gratuit et libre uniquement (2026-10-29)

Projet non commercial. Seulement des services et bibliothèques gratuits, de préférence libres : OpenStreetMap, MapLibre, moteurs d'itinéraire libres (OSRM, Valhalla, GraphHopper), transports en commun via des services ouverts (Transitous / MOTIS, données GTFS). Pas de Google Maps ni d'API payante.

Exception acceptée : le compte Apple développeur (99 $ par an), nécessaire pour publier sur iPhone.

## D9. Texte dans l'interface du voyageur : trois exceptions (2026-10-31)

L'interface du voyageur reste sans texte ni chiffre (`principes.md`), sauf ces exceptions, les seules autorisées :

1. **Identifiants officiels des lignes** (`C3`, `T2`, `M`, `M1`) : le voyageur les compare à la signalétique du réseau.
2. **Noms réels des stations et arrêts** : même raison, avec un bouton pour écouter le nom.
3. **Carte d'aide contextuelle** : un court message en français, destiné au passant à qui le voyageur montre son téléphone, pas au voyageur.
4. **Crédit OpenStreetMap de la carte** (ajouté le 2026-10-31, spec 002) : replié derrière un petit bouton ⓘ, le texte « © OpenStreetMap, Protomaps » ne s'affiche qu'au toucher. La licence ODbL l'impose.

Ces exceptions sont codées dans des composants dédiés, listés nommément dans `eslint.config.js`. La règle `gps/no-text-in-traveller-ui` s'applique partout ailleurs.

## D10. Pas de bouton d'appel (2026-10-31)

Pas de bouton pour appeler un proche ou l'accompagnateur. L'aide, toujours à un geste, est la **carte d'aide contextuelle** (D9) : un message en français adapté à l'étape en cours, à montrer à un passant ou à faire lire à voix haute. Aucun numéro de téléphone n'est enregistré dans l'app.

## D11. Maquette de référence (2026-10-31, remplacée par D15)

La maquette Claude Design « Navigation sans lecture v7 » (https://claude.ai/design/p/f7239f2c-c8b8-40e7-9b22-92f09ecce9e6, fichier `Navigation sans lecture v7.dc.html`, 30 écrans) et `docs/screens.md` sont la référence visuelle et fonctionnelle. En cas de conflit avec le design system « GPS sans texte » ou avec `docs/design/brief.md` et `ecrans.md`, **la maquette v7 prévaut** : fond crème, noir, bleu d'action, icônes Material Symbols Rounded, police Roboto Flex, cadrans de durée.

Première implémentation : interface statique fidèle, données factices, sans GPS ni calcul d'itinéraire réel. Les specs 002 (composer un trajet) et 003 (guidage) viendront avant de brancher la logique réelle.

## D12. Carte d'abord (2026-10-31, spec 002)

Une vraie carte, sans aucune étiquette, sert de fond aux écrans du trajet ; l'interface flotte dessus. Les tuiles d'une zone sont embarquées dans l'app (PMTiles, données OpenStreetMap) : rien n'est téléchargé à l'usage. Plus aucune illustration générée par IA. Palette plus vive que la maquette v7 (bleu plus lumineux, vert émeraude, orange plus franc, surfaces blanches) : elle prévaut sur les couleurs de la maquette v7 une fois validée sur les écrans témoins. La palette est remplacée par D15 ; le reste de D12 reste valable.

## D13. Aide : une seule place, et une carte limitée à l'étape (2026-11-01)

- Le bouton d'aide est **toujours en haut à droite**, au même endroit et à la même taille sur tous les écrans du voyageur, guidage et métro hors connexion compris : le voyageur le retrouve sans chercher.
- Révision du 2026-11-02 (spec 007) : **sauf sur l'accueil**, où il n'y a pas encore de trajet et où le bouton « + » (ajouter un lieu) prend sa place. L'aide revient en haut à droite dès le choix du transport (E06).
- Avant le départ, le message d'aide est celui de la première étape : l'arrêt à prendre en transport, le lieu d'arrivée à pied. Une fois parti, il suit l'étape en cours.
- La petite carte de la carte d'aide (E24) ne montre au passant que **l'étape en cours** : la position du voyageur, le tronçon en cours et l'arrêt ou le lieu à trouver. Jamais le reste du trajet ni le lieu d'arrivée, sauf sur le dernier tronçon. Un inconnu ne voit donc pas où se trouve un lieu privé (maison, famille).

## D14. France d'abord, vue aérienne IGN (2026-11-01)

- L'app vise la France au lancement. Les données (fond de carte, transports en commun, adresses) peuvent donc venir de sources françaises ouvertes.
- Si une vue aérienne (« satellite ») est ajoutée, elle viendra de l'IGN (BD ORTHO, Géoplateforme, licence Etalab 2.0), embarquée ou téléchargée par zone, jamais chargée tuile par tuile pendant le trajet (D1). À spécifier avant de la coder.

## D15. Maquette « carte urbaine émeraude » (2026-11-03)

L'interface « clair premium » (spec 008) manque de personnalité : formes et couleurs génériques, comme sorties d'une bibliothèque de composants. La maquette `docs/design/maquette-emeraude.png` (écran d'accueil) **fait foi** pour la direction visuelle. Elle remplace la maquette v7 (D11), la palette de D12 et la partie visuelle des specs 002, 005, 007 et 008. Les règles qui la contredisent sont révisées :

- **Carte** : sol crème chaud, espaces verts en aplat vert tendre (pas d'arbres dessinés), eau bleu vif, voies ferrées hachurées. Toujours sans étiquette ni téléchargement (D12).
- **Couleur** : un seul accent, émeraude, pour les épingles, les tuiles, la sélection, la position et le bouton « + ». Les couleurs par famille de lieux (spec 008) disparaissent ; le pictogramme ou la photo distingue les lieux.
- **Guidage** : le vert qui dit « c'est le bon chemin » est gardé, dans une nuance distincte de l'émeraude de l'interface.
- **Cibles** : boutons et épingles à la taille dessinée dans la maquette, sans zone tactile élargie. Le minimum de 64 dp est abandonné (principe 4 révisé).
- **Formes** : pilule blanche flottante en haut, épingles en goutte à contour (ou avec la photo du lieu), panneau du bas blanc aux grands arrondis avec des tuiles qui défilent, boutons ronds blancs, « + » plein émeraude, pictogrammes au trait.
- **Restent valables** : D9 (dont le bouton ⓘ du crédit de la carte), D12 hors palette (carte embarquée, sans étiquette, aucune illustration générée), D13, la règle du sens de lecture (spec 006).
- Les photos de la maquette sont des exemples ; dans l'app, ce sont les photos prises pour chaque lieu.
- La maquette ne montre que l'accueil : la spec de refonte en déduit les autres écrans.
- Les anciens documents de conception (`docs/design/brief.md`, `ecrans.md`, `guide-claude-design.md`, `references.md`) sont supprimés (historique dans git). Le design system Claude Design « GPS sans texte » est supprimé (2026-11-03).

Ordre de travail décidé le 2026-11-03 : nettoyage du dépôt, MapLibre natif (carte sur téléphone), refonte visuelle selon cette maquette (spec à écrire), puis app entièrement fonctionnelle (les données de démonstration restent jusque-là).

## D16. Carte en ligne et vraie position, comme les applis de GPS classiques (2026-11-04, spec 017)

Pour la première version, l'app copie et simplifie le comportement des applis de GPS classiques (Google Maps) : la carte se charge en ligne, tuile par tuile, depuis **OpenFreeMap** (gratuit, sans clé ni compte), et la position vient du téléphone (fournisseur standard d'Android, au premier plan seulement).

- **Exception assumée à D1** : OpenFreeMap reçoit l'adresse IP du téléphone et les zones affichées, donc où se trouve le voyageur et quand. Les lieux, les trajets et la position ne sont pas envoyés en tant que tels.
- **Révise D12 et D5 pour la carte** : plus de tuiles embarquées pour l'instant ; sans réseau, la carte reste vide, le reste de l'app marche. La carte embarquée, utilisable sans réseau, reviendra dans une évolution.
- La permission de localisation est demandée au premier lancement, en général en présence de l'accompagnant.

## D17. Calcul des trajets par Transitous (2026-11-04, spec 021)

Les trajets (à pied, transports) sont calculés par **Transitous** (`api.transitous.org`), service communautaire gratuit et libre, depuis le téléphone du voyageur (D4). Il reçoit le départ, l'arrivée, l'heure et l'adresse IP, et l'en-tête nomme l'app (condition d'usage). Choisi par Claude en autonomie (2026-11-04) : seul service sans clé ni compte qui couvre les transports en commun français ; à confirmer par l'utilisateur. Conditions : projet sous licence libre et non commercial, lien vers ses sources de données.

**Recalcul en cours de route (2026-11-08, spec 031)** : accepté tel quel par l'utilisateur. Quand le voyageur se perd, sa position du moment (environ 10 m) part à Transitous, 6 fois au plus par trajet ; ces requêtes sont reliables entre elles en une trace partielle et datée. Raison donnée : aucun compte ni identité dans l'app, donc pas de lien direct vers une personne. Limite connue : l'adresse IP reste reliable à un abonné par son opérateur.

## D18. Licence GPL-3.0 et dépôt public (2026-11-05)

Le projet est sous licence **GPL-3.0-or-later** (fichier `LICENSE`, champ `license` de `package.json`), choisie par l'utilisateur, seul auteur et détenteur des droits. Toute version modifiée et distribuée doit publier son code sous la même licence : personne ne peut fermer une copie. Le dépôt `Ali-Lamhene/GPS` devient public, ce qui remplit la condition de Transitous (D17). Aucune licence libre n'interdit l'usage commercial : la condition « non commercial » de Transitous porte sur le projet, qui reste gratuit (D7).

- Sécurité : le code public ne fragilise pas D1, qui ne repose sur aucun secret ; il permet aux associations de vérifier que l'app n'envoie rien. Avant publication, l'historique a été réécrit pour que les commits portent l'adresse anonyme GitHub (`78800250+Ali-Lamhene@users.noreply.github.com`, réglée pour ce dépôt seulement) et non l'adresse personnelle de l'auteur ; le dépôt GitHub a été recréé pour qu'aucune ancienne référence ne la garde. Aucun secret trouvé dans l'historique.
- Copies piégées : la licence permet à n'importe qui de publier une version modifiée. La parade est une source officielle unique (stores, APK signée par la clé du projet) connue des associations, à fixer avant la première diffusion.
- Contributions : tant que l'utilisateur est le seul auteur, il peut publier sur l'App Store. Si des contributeurs extérieurs arrivent, leur faire accepter un accord de contribution avant de fusionner leur code.
- Compatibilité : Material Symbols (Apache 2.0), MapLibre (BSD) et les photos CC BY / CC BY-SA sont compatibles. Les pictogrammes ARASAAC (CC BY-NC-SA) ne le sont pas : ne pas les réintroduire.

## D19. Nom commercial « Yalla map » (2026-11-05)

L'app s'appelle **Yalla map** (nom sous l'icône ; « Yalla map dev » pour la build de développement), choisi par l'utilisateur. D'abord « Yalla », puis « Yalla map » le même jour, pour ne pas se confondre avec d'autres apps nommées « Yalla » ; l'utilisateur a vérifié sur TMview qu'aucune marque « Yalla » active en France ne couvre les logiciels ou les trajets (classes 9, 39, 42). Le dépôt `Ali-Lamhene/GPS`, le dossier de travail et le projet EAS (`slug` « GPS ») gardent leur nom.

- Identifiant Android : `io.github.alilamhene.yalla` (`.dev` pour la build de développement), au lieu de `org.gpssanstexte.app` qui disait la fonction de l'app à qui regarde les réglages d'un téléphone fouillé. Fondé sur le domaine `ali-lamhene.github.io`, déjà au projet. Changé avant toute build distribuée : nouvelle clé de signature EAS et nouvelle empreinte dans `assetlinks.json`.
- Schéma de lien : aucun dans la build publiée, qui ne s'ouvre que par les liens `https://` vérifiés ; `yalla-dev://` dans la build de développement. Expo Router 58 démarre sans schéma (repli sur « / »), à confirmer au premier lancement de la build `preview` (démarrage, lien https à froid et à chaud).
- En-tête envoyé à Transitous (D17) : `YallaMap/1.0 (otakumi.factory@gmail.com)`. Ses conditions demandent le nom, la version et un contact (e-mail ou site) ; ni le nom ni l'adresse ne disent à quoi sert l'app. Un test le vérifie.
- Limite assumée : l'identifiant `io.github.alilamhene.yalla` mène au compte GitHub, dont le dépôt public `GPS` décrit le but de l'app. Le nom et l'identifiant trompent un regard rapide, pas une recherche de deux clics. Risque jugé très limité par l'utilisateur pour la bêta, menée en France (2026-11-05) ; levé par le vrai domaine ensuite. Un identifiant fondé sur un domaine neutre ne peut venir qu'avant la première diffusion : l'identifiant ne change plus ensuite.
- Liens de partage sur un chemin neutre, `https://ali-lamhene.github.io/l/#…` (au lieu de `/gps/lieu`), changé avant toute diffusion. L'identifiant qui mène au compte GitHub est accepté pour la bêta (décidé le 2026-11-05).
- Homonymes : « Yalla » est aussi le nom d'apps grand public (chat vocal Yalla, Yalla Ludo) ; « map » distingue l'app dans un magasin d'apps. Avant la publication au Play Store, refaire la recherche TMview (territoires FR, EM, WO ; classes 9, 39, 42) et, au moindre doute, demander l'avis d'un conseil en propriété industrielle.
