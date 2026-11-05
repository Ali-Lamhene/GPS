# 023 — Accepter ou refuser un lieu reçu par lien

- **Statut** : livré (vérifié dans le navigateur ; à vérifier sur téléphone, build `preview`)
- **Date** : 2026-11-05
- **Persona** : voyageur, seul (l'accompagnant n'est pas à côté de lui)
- **Révise** : spec 019, étape « Recevoir » (6) ; spec 001 D.3

## Besoin

Le code est public : n'importe qui sait fabriquer un lien de lieu. Aujourd'hui, toucher un lien ajoute le lieu sans question. Une personne mal intentionnée peut donc glisser chez le voyageur un faux « hôpital » posé sur un parking isolé, qui ressemble aux lieux de son accompagnant. Le voyageur ne sait pas lire et ne peut pas voir d'où vient un lieu.

Désormais, un lieu reçu n'entre qu'après un ✓ du voyageur. Il voit d'abord où se trouve le lieu, puis il accepte ou refuse. C'est à lui de juger. S'il refuse par erreur, il demande qu'on lui renvoie le lien. Les accompagnants expliquent aux voyageurs de ne pas ouvrir les liens d'inconnus (hors de l'app).

## Parcours

1. Le voyageur touche un lien de lieu (WhatsApp, SMS…). L'app s'ouvre sur l'écran de réception. Son « choisir » et sa vibration : une question l'attend.
2. L'écran montre la carte centrée sur le lieu, avec son épingle (pictogramme, sans photo : le lien n'en porte pas). Le point émeraude du voyageur y figure aussi quand il est assez proche pour tenir dans le même cadre.
3. En bas, les deux boutons de l'accueil : ✕ rond blanc à gauche, pilule ✓ émeraude à droite. En haut à droite, le bouton d'aide (D13).
4. ✓ : le lieu est gardé (spec 015). L'épingle avec la coche verte, son et vibration « enregistré », comme aujourd'hui. Puis retour à l'écran d'avant (un trajet en cours), sinon à l'accueil.
5. ✕ : rien n'est ajouté ni gardé. Son et vibration « choisir », sans croix rouge ni alerte : refuser n'est pas une erreur. Retour à l'écran d'avant, sinon à l'accueil.

## Signaux

| Information               | Canaux                                                            |
| ------------------------- | ----------------------------------------------------------------- |
| Une question t'attend     | carte et épingle, deux boutons connus, son « choisir », vibration |
| Lieu accepté et gardé     | épingle et coche verte qui grandit, son « enregistré », vibration |
| Lieu refusé               | l'écran se ferme, son « choisir », vibration                      |
| Lien abîmé ou forgé       | inchangé : croix rouge, son et vibration d'alerte (spec 019)      |
| Échec de l'enregistrement | inchangé : croix rouge, son et vibration d'alerte (spec 019)      |

## Cas limites

| Situation                                   | Comportement attendu                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Le voyageur ne répond pas                   | L'écran attend. Rien ne s'ajoute sans ✓.                                                                                                                                   |
| Bouton retour d'Android                     | Vaut ✕ : rien n'est ajouté.                                                                                                                                                |
| Lieu déjà gardé (même pictogramme à < 15 m) | Pas de question : épingle et coche directe, comme aujourd'hui. Rien d'ajouté.                                                                                              |
| Pas de réseau                               | L'épingle seule sur fond blanc chaud, sans carte. Les mêmes boutons.                                                                                                       |
| Position du voyageur inconnue ou lointaine  | La carte cadre le lieu seul.                                                                                                                                               |
| Lien reçu pendant un trajet                 | Après ✓ ou ✕, retour au trajet, qui n'a pas changé (spec 019).                                                                                                             |
| Lien abîmé, version future, forgé illisible | Inchangé : pas de question, croix rouge et alerte, puis retour (spec 019).                                                                                                 |
| ✓ mais l'enregistrement échoue              | Croix rouge et alerte (spec 019) ; le lieu n'est pas gardé.                                                                                                                |
| Aide                                        | Carte d'aide habituelle (D13), sans le lieu reçu : il n'est pas encore au voyageur. Le retour d'Android depuis l'aide ferme l'aide et revient à la question, sans refuser. |
| ✕ et ✓ touchés presque ensemble             | La première réponse compte : rien n'est gardé après ✕.                                                                                                                     |
| Un 2e lien arrive pendant la question       | Il est jeté à la fermeture de l'écran, jamais lu plus tard.                                                                                                                |
| Le voyageur bouge pendant la question       | La carte garde le cadre de l'ouverture ; seul son point bouge.                                                                                                             |

## Données et confidentialité

- Rien n'est gardé avant le ✓. Un lieu refusé n'est gardé ni dans les lieux ni dans un fichier de l'app. Seules les tuiles de sa zone restent dans le cache de la carte (stockage privé de l'app) jusqu'au prochain lancement, qui le vide (spec 017), comme pour toute carte affichée.
- La carte demande au serveur de tuiles (OpenFreeMap, D16), avec l'adresse IP, la zone du lieu reçu (et celle du voyageur s'il est à moins de 3 km), dès l'ouverture du lien et avant tout choix. **Risque accepté par l'utilisateur (2026-11-05)** : c'est l'expéditeur qui choisit cette zone ; un lieu piège posé dans un coin isolé peut servir de balise à qui lit les journaux du serveur (IP du voyageur, heure d'ouverture). Écarté : cadre de ville, ou épingle d'abord et carte sur demande. Aucun autre appel.
- Le lien reste lu une seule fois, depuis `+native-intent.tsx` (securite.md §3) ; l'écran n'agit qu'après un toucher du voyageur, jamais à l'ouverture.

## Hors périmètre

- Pas de trace des lieux refusés pour l'accompagnant, pas de compteur : le voyageur est responsable (décidé pour la bêta).
- Pas de marque « reçu par lien » sur les lieux acceptés.
- Le briefing des voyageurs par les accompagnants se fait hors de l'app.
- Pas de nouveau son.

## Critères d'acceptation

- [ ] Un lien de lieu nouveau ouvre l'écran de question : carte, épingle, ✕, ✓, aide ; son « choisir » et vibration (test).
- [ ] Rien n'est enregistré tant que ✓ n'est pas touché (test : aucun appel d'enregistrement à l'ouverture).
- [ ] ✓ garde le lieu, montre la coche et revient (test).
- [ ] ✕ et le bouton retour n'enregistrent rien et reviennent, sans croix rouge (test).
- [ ] Lieu déjà gardé : coche directe, pas de question (test).
- [ ] Lien abîmé : croix rouge, comme avant (test).
- [ ] Sur téléphone (build `preview`) : un lien reçu par WhatsApp ouvre la question ; ✓ ajoute le lieu à l'accueil ; ✕ n'ajoute rien.
- [ ] Relu par `ux-sans-texte-reviewer` et `security-reviewer`.

## Hypothèses

- Cadre de la carte : le lieu au centre ; le voyageur inclus seulement si les deux tiennent à une échelle de quartier (environ 3 km). Au-delà, le lieu seul. Cadre calculé une fois, à la première position connue.
- L'épingle d'un lieu normalement caché de la carte (maison, famille) s'affiche quand même sur cet écran : le voyageur doit voir ce qu'il accepte.

## Questions / réponses

- Que montre l'écran ? Carte centrée sur le lieu avec l'épingle ; l'épingle seule sans réseau.
- Quels boutons ? ✕ rond et pilule ✓, comme à l'accueil.
- Au refus ? Rien d'ajouté, retour discret, sans croix rouge. Pas de liste des refusés : le voyageur, seul, accepte ou demande qu'on lui renvoie le lien.
- Sans réponse ? L'écran attend ; le retour d'Android vaut ✕.
- Lien déjà reçu ? Pas de question, coche directe.
- Signal d'ouverture ? Son « choisir » et vibration, bouton d'aide présent.
- Relectures (2026-11-05) : carte dès l'ouverture malgré le risque de balise, accepté tel quel. Après ✓ : coche puis l'accueil, comme avant (ni arrivée choisie, ni tuile mise en avant). Pas de signal en plus pour « une question t'attend » : à observer en test.

## À observer en test avec des voyageurs

- Le voyageur seul comprend-il qu'une réponse est attendue, ou appuie-t-il sur retour par réflexe ? Sait-il retoucher le lien dans WhatsApp pour récupérer un lieu refusé ?
- Fait-il la différence entre un vrai lien et un faux posé à 2 km, puis à 50 km ?
- ✓ est-il compris comme « garder » ou « y aller » ? Retrouve-t-il le lieu sur l'accueil après la coche ?
- Le son et la vibration d'ouverture se perçoivent-ils à froid depuis WhatsApp, dans la rue ?
- Le petit « i » du crédit, juste au-dessus du ✕, est-il touché par erreur ?
- Un 2e lien touché pendant la question ouvre-t-il bien une nouvelle question (comportement de la navigation à vérifier sur téléphone) ?
