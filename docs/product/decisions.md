# Décisions produit structurantes

Décisions prises avec le porteur du projet. Elles conditionnent l'architecture. Toute spec doit les respecter ; les remettre en cause demande une discussion explicite.

## D1. Sécurité et confidentialité : aucune donnée d'identité (2026-10-29)

**Contexte.** Certains réfugiés accompagnés sont surveillés par les gouvernements de leur pays d'origine. Les associations qui les accompagnent sont souvent la cible d'attaques informatiques.

**Décision.** Ne prendre aucun risque et aucune responsabilité sur les données :

- Pas de compte, pas d'inscription, pas d'identifiant, ni pour le voyageur ni pour la personne qui prépare les trajets.
- Aucune collecte de donnée d'identité (nom, téléphone, e-mail, identifiant d'appareil, etc.).
- Pas de serveur à nous qui stocke des trajets, des adresses ou des positions. Pas de serveur de suivi.
- Pas d'outil d'analyse ni de suivi d'audience, pas de rapport de plantage qui envoie des données de l'appareil.
- La position du voyageur reste sur son téléphone.

**Conséquence.** Tout service tiers appelé par l'app doit être justifié dans la spec, avec les données qu'il reçoit.

## D2. Modes de déplacement (2026-10-29)

À pied, en transports en commun et en voiture.

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
