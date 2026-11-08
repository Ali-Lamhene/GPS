# 029 — L'adresse du lieu sur la carte d'aide

- **Statut** : livré
- **Date** : 2026-11-08
- **Persona** : voyageur (carte d'aide montrée à un passant), accompagnant (création du lieu)

## Besoin

Retour de terrain de l'utilisateur (2026-11-08, point 14) : la carte d'aide dit « je cherche une pharmacie » (le nom du pictogramme) au lieu de donner l'adresse. Un passant ne peut rien en faire. Décidé par l'utilisateur : afficher l'adresse, et pour un lieu qui n'en a pas, la demander à Photon.

## Parcours

1. Lieu trouvé par la recherche d'adresse (E30) : l'adresse de la suggestion choisie (rue, code postal, ville) est gardée avec le lieu.
2. Lieu créé « ici » ou par photo (E27 à E29) : à l'enregistrement, l'app demande **une fois** son adresse à Photon (géocodage inverse). Sans réponse en 5 s ou sans réseau, le lieu est enregistré sans adresse.
3. Lieu reçu par lien et accepté (spec 023) : même demande, une fois, au moment du ✓.
4. Carte d'aide vers le lieu : « Bonjour, je cherche une pharmacie, 14 quai du Port, 13002 Marseille. Pouvez-vous m'aider à trouver ce lieu, s'il vous plaît ? ». Sans nom : « je cherche l'adresse … ». Sans adresse : comme avant.

## Signaux

Inchangés pour le voyageur : l'adresse est du texte en français pour le passant (exception D9 de la carte d'aide).

## Cas limites

| Situation                                                  | Comportement attendu                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Lieu caché de la carte (domicile, famille, santé sensible) | **Aucune adresse** gardée ni demandée : une adresse lisible sur un téléphone saisi en dirait trop (D1). La carte d'aide garde le nom seul. |
| Lieu envoyé par lien par l'accompagnant                    | Pas de demande sur son téléphone : c'est le téléphone du voyageur qui la fait à l'acceptation.                                             |
| Pas de réseau, Photon lent ou en panne                     | Lieu enregistré sans adresse, sans attendre plus de 5 s.                                                                                   |
| Réponse de Photon malformée                                | Ignorée ; caractères de contrôle et de direction retirés, 200 caractères au plus.                                                          |
| Fichier des lieux avec une adresse abîmée                  | L'adresse est ignorée, le lieu est gardé.                                                                                                  |

## Données et confidentialité

- **Photon** (`photon.komoot.io`, déjà utilisé pour la recherche, spec 019) reçoit, **nouveau** : le point du lieu à 4 décimales (environ 10 m), une fois par lieu créé ou accepté, avec l'adresse IP. Pour un lieu créé « ici » ou par photo, ce point est la **position du téléphone à ce moment** : Photon apprend que cette IP se trouve, à cette heure, à environ 10 m de ce point. Pour un lieu reçu par lien, il apprend que ce téléphone s'intéresse à ce lieu. Accepté par l'utilisateur (2026-11-08). Jamais pour un lieu caché.
- L'adresse est gardée dans le fichier des lieux (stockage privé, exclu des sauvegardes, spec 016). Elle n'est pas dans le lien de partage.
- Aucune nouvelle dépendance ni permission.

## Hors périmètre

- Modifier l'adresse à la main.
- Demander l'adresse des lieux déjà enregistrés avant cette version (ils gardent le nom seul).
- Adresse des arrêts de transport : le nom de l'arrêt suffit au passant.

## Critères d'acceptation

- [x] Message d'aide avec nom et adresse, ou adresse seule (test).
- [x] Lecture de la réponse inverse de Photon, avec nettoyage (test).
- [x] Adresse gardée dans le fichier, jamais pour un lieu caché (test).
- [x] Lieu créé ici : une demande ; domicile : aucune (tests). Lieu reçu : adresse gardée (test).
- [ ] Sur le téléphone : créer un lieu « ici », ouvrir la carte d'aide vers lui, l'adresse s'affiche.

## Ajustements après la relecture `security-reviewer` (2026-11-08)

- Lien reçu : l'écran n'annonce plus l'échec avant la fin de la demande d'adresse (8 s au lieu de 4).
- Annuler pendant la demande d'adresse : rien n'est enregistré.
- La règle « lieu caché » est appliquée aussi à l'écriture du fichier et aux anciens fichiers sans marque « caché ».
- Adresses de la recherche et du fichier nettoyées des caractères de contrôle et de direction (n'importe qui peut modifier OpenStreetMap).

## À trancher (utilisateur)

- Pour un lieu créé « ici », Photon apprend où est le téléphone à ce moment. Accepter tel quel, ou demander l'adresse plus tard (au premier affichage de la carte d'aide, ou en Wi-Fi seulement) ?
- La règle ne regarde que le pictogramme : un domicile enregistré avec un pictogramme neutre (épingle) aura son adresse demandée et gardée. Faut-il un moyen de cacher un lieu à la création ?

## Hypothèses

- L'adresse renvoyée par Photon pour un point est assez juste pour un passant (précision de la rue et du numéro le plus proche).
- Un lieu « santé sensible » ou un domicile n'a pas besoin d'adresse sur la carte d'aide : le voyageur connaît en général le chemin de chez lui. **À confirmer par l'utilisateur.**
