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

## D3. Qui crée les trajets (2026-10-29)

- Le voyageur ne saisit rien. Un tiers (travailleur social, proche, bénévole) prépare les trajets pour lui.
- Le voyageur garde une petite collection de trajets utiles (par exemple domicile vers médecin).
- Le tiers envoie un **lien** (ou un QR code). L'ouvrir crée le trajet chez le voyageur.
- Les données du trajet sont **encodées dans le lien lui-même**. Aucun serveur ne les garde.

## D4. Calcul d'itinéraire et suivi (2026-10-29)

- L'itinéraire est calculé **au moment de la préparation**, côté tiers, par un service public gratuit, puis envoyé tout prêt dans le lien.
- Le téléphone du voyageur suit sa position GPS **en local** et sait où il en est dans le trajet (progression, écart, arrivée).
- Le téléphone du voyageur n'appelle un service d'itinéraire que pour recalculer (par exemple s'il se perd). À préciser dans la spec concernée.

## D5. Hors connexion (2026-10-29)

Les trajets enregistrés sont stockés sur le téléphone du voyageur et utilisables sans internet. Rien n'est sauvegardé en ligne.

## D6. Carte (2026-10-29)

Une carte est toujours affichée, **en plus** des signaux sans texte (flèche, photos, jauge, sons, vibrations). Le tracé du chemin aide même sans savoir lire. Le guidage ne dépend jamais de la lecture de la carte.

## D7. Gratuit et libre uniquement (2026-10-29)

Projet non commercial. Seulement des services et bibliothèques gratuits, de préférence libres : OpenStreetMap, MapLibre, moteurs d'itinéraire libres (OSRM, Valhalla, GraphHopper), transports en commun via des services ouverts (Transitous / MOTIS, données GTFS). Pas de Google Maps ni d'API payante.
