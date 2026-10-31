# 002 — Carte d'abord : refonte visuelle

- **Statut** : validé
- **Date** : 2026-10-31
- **Persona** : voyageur

## Besoin

La première implémentation de la maquette v7 (D11) donne une impression de prototype ou de jeu : carte dessinée à la main, pages crème vides dès qu'on quitte l'accueil, gris partout, coins très ronds, icônes énormes, illustrations générées par IA. Le voyageur doit avoir en main un outil qui inspire confiance, comme une vraie app de navigation (Waze sert d'inspiration, sans reprendre son logo, sa mascotte ni ses couleurs), tout en restant sans texte.

## Parcours

Deux **écrans témoins** d'abord, dans le navigateur, validés par l'utilisateur avant de généraliser aux autres écrans du trajet (E06, E07-E08, E21, E24-E27).

1. **Accueil (E01-E05)** : une vraie carte du quartier autour de la position du voyageur remplit l'écran, légèrement atténuée. Le chemin vertical départ → arrivée (règle 3 de `docs/screens.md`) flotte au-dessus, avec les mêmes tuiles et le même comportement qu'aujourd'hui. Le bouton d'aide est un bouton rond blanc avec ombre. La feuille des lieux monte par-dessus la carte.
2. **Guidage (E09-E23, E17)** : la carte occupe tout l'écran et suit le voyageur. Le tracé du trajet est épais, bordé de foncé, coloré selon le mode (marche, couleur de la ligne de bus ou de métro). Le voyageur est un point pulsé avec un cône de direction. La consigne flotte en haut dans un bandeau (vert, orange pour descendre). Un panneau compact flotte en bas : temps restant (cadrans en anneau), progression, écouter, aide.
3. Sur la carte, le voyageur peut zoomer ou déplacer avec deux doigts ; un gros bouton rond « ma position » apparaît alors et recentre la carte.

## Signaux

Inchangés par rapport à la maquette v7 (sons et vibrations de `src/services/feedback.ts`). La carte ajoute un canal visuel (tracé et position), sans en retirer.

| Information              | Canaux                                                              |
| ------------------------ | ------------------------------------------------------------------- |
| Où je suis               | point pulsé + cône de direction sur la carte                        |
| Par où aller             | tracé coloré sur la carte + pictogramme de consigne + son/vibration |
| La carte ne me suit plus | bouton « ma position » qui apparaît                                 |

## Cas limites

| Situation                          | Comportement attendu                                                    |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Position hors de la zone embarquée | fond de carte uni (couleur du sol), tracé et position toujours dessinés |
| Fichier de carte illisible         | même fond uni ; l'écran reste utilisable                                |
| Carte déplacée par erreur          | bouton « ma position » visible tant que la carte n'est pas recentrée    |
| Grande taille de police système    | aucun effet : la carte n'a aucun texte                                  |

## Données et confidentialité

- **Fond de carte embarqué** : un fichier PMTiles du centre de Marseille, extrait de la carte publique Protomaps (données OpenStreetMap), livré dans l'app (`assets/`). Aucune tuile, police ni image n'est téléchargée à l'usage : rien ne quitte le téléphone (D1).
- **Style sans étiquettes** : aucun nom de rue, de lieu ni de ligne sur la carte (principe zéro texte) ; donc aucune police de caractères à charger.
- **Crédit OpenStreetMap** (licence ODbL) : un petit bouton ⓘ dans un coin de la carte ; le texte « © OpenStreetMap » ne s'affiche qu'en le touchant. **Nouvelle exception de texte, à ajouter à D9.**
- **Nouvelles dépendances** : `maplibre-gl` (affichage web), `pmtiles` (lecture du fichier). Pour le téléphone, `@maplibre/maplibre-react-native` viendra à la généralisation (code natif, build de développement). À relire par `security-reviewer` : aucun appel réseau, pas de télémétrie.
- **Photos** : plus aucune illustration (guidage, récapitulatif, aide). Seule la photo qu'un voyageur prend lui-même d'un nouveau lieu (E29) reste.

## Hors périmètre

- La carte sur téléphone (MapLibre natif) : à la généralisation, après validation des témoins.
- Le mode nuit de la carte.
- Le vrai GPS, le vrai calcul d'itinéraire, la vraie carte hors de la zone embarquée (specs 003 et 004).
- Les écrans autres que l'accueil et le guidage, tant que les témoins ne sont pas validés.

## Critères d'acceptation

- [ ] L'accueil et le guidage affichent une vraie carte de Marseille sans aucun texte ni chiffre (hors exceptions D9 et crédit ⓘ), avec le réseau coupé.
- [ ] Le trajet de démo suit de vraies rues et de vraies lignes, dans de vraies couleurs de lignes RTM.
- [ ] Au guidage, la carte se centre sur le voyageur à chaque étape ; le tracé, le point pulsé et le cône sont visibles.
- [ ] Après un déplacement à deux doigts, le bouton « ma position » apparaît et recentre la carte.
- [ ] Plus aucune illustration générée par IA dans l'app.
- [ ] Aucune requête réseau dans l'onglet réseau du navigateur au chargement des deux écrans, hors serveur de développement.
- [ ] L'utilisateur juge l'ensemble « fini, friendly, pas jouet » sur les deux écrans témoins.

## Hypothèses

- Zone embarquée : environ 3 × 3 km autour du trajet de démo, zoom maximal 15 à 16 (agrandi au-delà), fichier de 5 à 15 Mo.
- Trajet de démo choisi par Claude dans le centre de Marseille, même découpage qu'aujourd'hui (marche, bus, marche, métro M1, marche), avec de vraies stations ; à valider sur les témoins.
- Palette plus vive proposée directement sur les écrans témoins (bleu plus lumineux, un accent chaud), validée à l'œil par l'utilisateur ; elle s'écarte de la maquette v7 sur les couleurs, à consigner dans `decisions.md` une fois validée.
- Le style de carte « clair et chaleureux » est écrit à la main (fond crème, parcs verts, eau bleue, rues blanches bordées de gris, bâtiments légers, lignes de métro et tram en couleur).
- Les témoins tournent dans le navigateur ; le rendu téléphone sera vérifié à la généralisation.

## Questions / réponses

- Trajet de démo ? → Vrai trajet à Marseille, vraies lignes et stations.
- Crédit OpenStreetMap ? → Petit bouton ⓘ, texte au toucher.
- Déplacer la carte ? → La carte suit ; zoom et déplacement à deux doigts ; bouton « ma position » pour recentrer.
- Accueil ? → Vraie carte atténuée, chemin vertical par-dessus.
- Couleurs ? → Palette plus vive, proposée sur les témoins.
- Fond de carte ? → Clair et chaleureux.
- Téléchargement de l'outil `pmtiles` et de la zone ? → Autorisé par l'utilisateur.
- Photos ? → Aucune illustration ; les PNG d'origine restent hors du dépôt.
