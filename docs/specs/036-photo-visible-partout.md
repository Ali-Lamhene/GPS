# 036 — La photo d'un lieu, visible partout où le lieu apparaît

- **Statut** : livré en autonomie (brief du 2026-11-17, fiche 3/6 validée par l'utilisateur) ; à voir sur le téléphone
- **Date** : 2026-11-17
- **Persona** : voyageur (et accompagnant pour la liste)
- **Révise** : spec 005 (photo sur les raccourcis et les épingles d'accueil seulement), 010 (épingles de départ et d'arrivée sans photo)

## Besoin

Un lieu qui a une photo la montre **partout où il apparaît**. Aux retours du 2026-11-10, le besoin avait été compris comme « photo sur les épingles à l'arrivée » : c'est plus large. Un lieu sans photo garde son pictogramme.

## Inventaire : où un lieu apparaît

| #   | Endroit                                                                           | Composant                                                     | Avant                | Maintenant          |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------- | ------------------- |
| 1   | Épingles des lieux, carte d'accueil                                               | `PlacePin` (natif), `createPlacePin` (web) via `MapPin.photo` | photo                | photo (test ajouté) |
| 2   | Pastilles du chemin, accueil                                                      | `WayCard` → `EndDisc` → `PlaceFace`                           | photo                | photo               |
| 3   | Pastilles du chemin, choix du transport et récapitulatif                          | `WayCard`                                                     | photo                | photo               |
| 4   | Pastilles du chemin, guidage (pilule du bas)                                      | `ProgressPanel` → `EndDisc`                                   | photo                | photo (test ajouté) |
| 5   | Feuille des lieux (liste pour choisir)                                            | `SheetPlaceTile` → `PlaceFace`                                | photo                | photo               |
| 6   | Liste des lieux de l'accompagnant                                                 | `PlacesScreen` → `PlaceFace`                                  | photo                | photo               |
| 7   | Écran d'arrivée, grand disque                                                     | `ArrivedScreen` → `PlaceFace`                                 | photo                | photo (test ajouté) |
| 8   | Carte d'arrivée : épingle d'arrivée                                               | `DestinationPin`                                              | **pictogramme seul** | photo               |
| 9   | Carte du choix du transport et du récapitulatif : épingles de départ et d'arrivée | `TripOverviewMap` → `OriginPin`, `DestinationPin`             | **pictogramme seul** | photo               |
| 10  | Carte du guidage : épingle d'arrivée                                              | `GuidanceScreen` → `DestinationPin`                           | **pictogramme seul** | photo               |
| 11  | Carte d'aide (passant) : épingle d'arrivée, dernier tronçon                       | `HelpSituationMap`                                            | **pictogramme seul** | photo               |
| 12  | Carte de consigne : petite pastille « ce qui vient » à la dernière marche         | `InstructionCard`                                             | **pictogramme seul** | photo               |
| 13  | Carte d'aide : photo du lieu cherché                                              | `HelpScreen`                                                  | photo                | photo               |

## Ne change pas

- Un lieu **reçu par lien** n'a pas de photo : elle ne voyage pas dans le lien (spec 019, sécurité). Ses épingles gardent leur pictogramme.
- Épingles de **création** (position, pictogramme) : le lieu n'a pas encore de photo.
- Photo de rue (Panoramax, spec 030) : inchangée. Sur l'écran d'arrivée, la photo du voyageur passe avant celle de la rue.
- Une adresse web n'est jamais chargée comme photo : seuls les fichiers locaux (`isLocalPicture`).
- Épingle native : toujours le composant `Image` de React Native, qui ne met rien en cache disque (correctif `af5c457`).

## Comportement

- Épingle avec photo : la photo dans la tête ronde, le pictogramme dans un petit disque blanc en bas à gauche (comme les épingles d'accueil, spec 009).
- Carte de consigne : la pastille « ce qui vient » de la dernière marche montre la photo (pictogramme dans un disque de 28 dp), à pleine opacité, au lieu du pictogramme seul.
- Épingle native avec photo : le grand pictogramme reste sous la photo (relecture UX : si la photo charge lentement ou manque, l épingle dit encore le lieu).
- Sans photo : rien ne change.

## Hypothèses

- La carte d'aide montre déjà la photo du lieu à un passant (§ 13) : sa carte la montre donc aussi sur l'épingle, sans nouvelle exposition.
- La pastille « ce qui vient » (§ 12) n'affiche la photo que pour le lieu d'arrivée (les autres symboles sont des gestes : sortir, tout droit…).

## Tests

Épingles natives (arrivée et départ avec et sans photo, lieu enregistré), `TripOverviewMap`, `GuidanceScreen`, `ArrivedScreen` (carte et disque), `ProgressPanel`, `InstructionCard`, `situationLayers`.

## À voir sur le téléphone

Épingles Android avec photo (correctif `af5c457`, jamais vu sur téléphone) ; épingles de départ et d'arrivée avec photo sur les trois cartes du trajet.
