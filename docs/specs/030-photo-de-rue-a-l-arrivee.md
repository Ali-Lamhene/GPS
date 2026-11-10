# 030 — Photo de rue du lieu d'arrivée (Panoramax)

- **Statut** : livré
- **Date** : 2026-11-08
- **Persona** : voyageur

## Besoin

Retour de terrain de l'utilisateur (2026-11-08, point 17) : un voyageur qui ne lit pas ne reconnaît pas le bâtiment d'arrivée, d'où l'intérêt de photos de rue « comme Google ». Google est écarté (payant au-delà d'un quota, photos interdites de garder, destination envoyée à Google, contraire à D1). Source retenue avec l'utilisateur : **Panoramax**, photos de rue libres (IGN, OpenStreetMap France), sans clé ni compte.

## Parcours

1. Quand le voyageur quitte l'accueil vers le choix du transport (E06), en même temps que le calcul du trajet, l'app cherche sur Panoramax une photo prise à moins de 50 m **tournée vers le lieu d'arrivée**, la plus proche parmi 20 (retour terrain du 2026-11-10 : Panoramax ne trie pas par distance). Une fois par couple départ-arrivée.
2. Trouvée : l'image est **téléchargée une seule fois**, tout de suite (pendant qu'il y a du réseau), et gardée **en mémoire seulement** (adresse `data:`), sans cache disque. Aucune requête réseau n'est faite en approche de l'arrivée.
3. Guidage, dernière marche vers le lieu (« aller au lieu ») : une carte photo (environ 168 × 124 dp, bord émeraude, badge avec le pictogramme du lieu) apparaît en fondu au-dessus du bout « arrivée » de la pilule, à droite dans tous les sens de lecture. Le bouton de recentrage remonte au-dessus d'elle.
4. Écran d'arrivée (E26) : le grand disque du lieu montre la photo de rue, avec le pictogramme du lieu dans un disque blanc cerclé d'émeraude (56 dp) en bas.
5. Une photo à 360° est recadrée sur le quart tourné vers le lieu, l'horizon au milieu ; une photo plate est cadrée sur le lieu.

## Signaux

| Information                          | Canaux                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| « Voilà à quoi ressemble l'arrivée » | Photo de rue (image), bord émeraude et badge drapeau (forme, couleur) ; la carte et la pilule restent inchangées |

## Cas limites

| Situation                                                                                       | Comportement attendu                                                              |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Le lieu a sa propre photo (prise par l'accompagnant)                                            | Elle reste ; aucune demande à Panoramax                                           |
| Lieu caché de la carte (domicile, famille, santé sensible)                                      | Aucune demande, aucune photo (D1)                                                 |
| Aucune photo à moins de 50 m, ou photo qui regarde ailleurs                                     | Rien ne s'affiche ; écrans comme avant                                            |
| Pas de réseau, Panoramax lent (plus de 8 s)                                                     | Rien ne s'affiche                                                                 |
| Image hébergée ailleurs que sur les serveurs Panoramax connus, licence inconnue, réponse abîmée | Ignorée                                                                           |
| App fermée pendant le trajet                                                                    | La photo est perdue (mémoire seulement) ; elle sera redemandée au prochain calcul |

## Données et confidentialité

- **Panoramax** (`api.panoramax.xyz`) reçoit : le point d'arrivée à 4 décimales (environ 10 m), une fois par trajet, et l'adresse IP. C'est la même information que Transitous reçoit déjà (D17), envoyée à un service de plus.
- **Serveur de l'image** (`panoramax.ign.fr` ou `panoramax.openstreetmap.fr`, liste fermée dans `src/services/hosts.ts`) : l'adresse IP et l'image demandée, qui désigne un endroit proche de l'arrivée. L'IGN **redirige vers son stockage chez OVH** (`panoramax-storage-public-fast.s3.gra.perf.cloud.ovh.net`), qui reçoit aussi l'IP et l'image. Une image servie par un autre hôte final est jetée (la requête l'a toutefois déjà atteint).
- Requêtes sans cache HTTP (`Cache-Control: no-store`), comme désormais celles de Transitous et Photon.
- Rien n'est écrit sur le téléphone : l'image reste en mémoire, pour qu'un téléphone fouillé ne montre pas où le voyageur allait.
- Visages et plaques sont floutés par Panoramax à la publication.
- Licences : etalab-2.0 et CC-BY-SA 4.0 (ou plus libres) seulement ; crédit général dans l'espace accompagnant (E30).
- Aucune nouvelle dépendance (`expo-image` déjà présent), aucune permission.

## Hors périmètre

- Photo de rue sur le récapitulatif (E07-E08) ou sur l'accueil.
- Choisir une autre photo, zoomer, tourner dans le panorama.
- Garder la photo pour le hors connexion (contraire au « rien sur le disque »).
- Photos des arrêts de transport.

## Critères d'acceptation

- [x] Lecture de la réponse : photo plate tournée vers le lieu, panorama recadré, hôte, protocole et licence refusés (tests).
- [x] Demandée une fois avec le trajet (test).
- [x] Carte photo seulement à la dernière marche (tests).
- [ ] Sur le téléphone, à Marseille, Paris ou Lyon : la photo apparaît en approche de l'arrivée et sur l'écran d'arrivée, recadrée sur le bon bâtiment.
- [ ] Sur le terrain : le voyageur reconnaît-il le bâtiment grâce à la photo ?

## Ajustements après les relectures (2026-11-08)

`security-reviewer` : redirection IGN vers OVH déclarée et hôte final vérifié ; un seul téléchargement (le cache mémoire d'expo-image aurait pu redemander l'image en fin de marche, depuis l'IP du voyageur, près de l'arrivée) ; `no-store` sur toutes les requêtes ; photo revérifiée contre la règle « lieu caché ».

`ux-sans-texte-reviewer` : badge au pictogramme du lieu (le drapeau n'est plus le signe de l'arrivée depuis la spec 027) ; carte au-dessus du bout « arrivée », à droite, sans changer de côté en lecture de droite à gauche, sans masquer le ⓘ de la carte ; apparition en fondu ; étiquette pour lecteur d'écran ; pictogramme plus grand sur E26.

## Décidé par l'utilisateur (2026-11-08)

- Stockage OVH de l'IGN accepté (menace précisée dans D1) : photos IGN et OpenStreetMap France gardées.
- Crédit général dans l'espace accompagnant pour l'instant ; crédit par photo (CC-BY-SA) à revoir avant la publication sur les stores.
- Photos anciennes gardées ; à observer sur le terrain.

## Hypothèses

- La photo la plus pertinente est la première renvoyée par Panoramax qui regarde le lieu (Panoramax trie par distance).
- Un quart de tour (90°) du panorama suffit à cadrer un bâtiment depuis la rue.
