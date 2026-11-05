# 019 — Lien de partage et recherche d'adresse

- **Statut** : validé (autonomie donnée par l'utilisateur le 2026-11-04 ; hypothèses ci-dessous)
- **Date** : 2026-11-04
- **Persona** : accompagnant (adresse, envoi), voyageur (réception)
- **Réalise** : spec 001, parties B (adresse), C (envoyer) et D (recevoir)

## Parcours

### Trouver une adresse (accompagnant, E30)

1. Le clavier de l'accueil ouvre E30. L'accompagnant tape une adresse ou un nom ; après une courte pause, des suggestions arrivent de Photon (OpenStreetMap), les plus proches de la position du téléphone d'abord.
2. Il touche une suggestion. Deux boutons : « Garder sur ce téléphone » (le téléphone du voyageur) et « Envoyer par lien au voyageur » (son propre téléphone).
3. Sans réseau : « Pas de connexion… Réessayez. » Sans résultat : « Aucune adresse trouvée. Essayez autrement. »

### Garder

4. Choix du pictogramme (E28), photo (E29), enregistrement (spec 015), avec le nom de la suggestion pour la carte d'aide et le point exact de la suggestion.

### Envoyer

5. Choix du pictogramme (E28), puis ✓ ouvre la feuille de partage du téléphone (WhatsApp, SMS…) avec le lien. Rien n'est gardé sur ce téléphone ; retour à l'accueil.

### Recevoir (voyageur)

6. Le voyageur touche le lien. L'app s'ouvre sur un écran blanc chaud : le lieu est ajouté aussitôt, sans question ; coche verte qui grandit, son et vibration « enregistré » ; puis l'accueil.
7. Le même lien deux fois : aucun doublon (même pictogramme à moins de 15 m) ; même confirmation.
8. Lien abîmé, d'une version future ou forgé : rien n'est ajouté ; croix rouge, son et vibration d'alerte ; puis l'accueil.

## Format du lien

`https://ali-lamhene.github.io/gps/lieu#1/<latitude>/<longitude>/<pictogramme>` : version, point à 5 décimales (environ 1 m), nom du pictogramme du catalogue. Rien d'autre : ni nom, ni adresse, ni photo. La partie après `#` n'est envoyée à aucun serveur. Décodage strict (`src/domain/share-link.ts`) : longueur maximale, version, bornes, nombres, pictogramme connu ; tout le reste est refusé.

## Données et confidentialité

- **Photon** (`photon.komoot.io`, HTTPS) reçoit le texte tapé, la position du téléphone arrondie à environ 1 km pour classer les résultats, et l'adresse IP. Seulement depuis E30 (accompagnant), jamais depuis les écrans du voyageur. Le champ de saisie interdit au clavier d'apprendre l'adresse.
- **Messagerie** : le lien entier (point à 1 m, pictogramme) passe par la messagerie choisie dans la feuille de partage ; par SMS, l'opérateur le lit en clair ; WhatsApp peut le garder dans sa sauvegarde. E30 conseille une messagerie chiffrée.
- **Lien** : seul le contenu ci-dessus. Le lieu reçu ne porte pas de nom ; la carte d'aide utilise le nom du pictogramme.
- **Liens entrants** : tous passent par `src/app/+native-intent.tsx`. Seul un lien de lieu atteint son écran ; il y est transmis une seule fois (jamais relu plus tard), puis validé. Un autre lien ouvre l'accueil au démarrage et ne change rien si l'app est déjà ouverte (un trajet en cours reste). Reçu pendant un trajet, l'écran revient au trajet après la coche.
- Rien n'est gardé sur le téléphone de l'accompagnant après un envoi.

## Ajustements après les relectures (2026-11-04)

- Écran de réception : l'épingle du lieu reçu avec la coche (on voit quel lieu est arrivé) ; croix rouge si rien n'arrive en 4 s ; retour à l'écran précédent (un trajet en cours) plutôt qu'à l'accueil.
- Envoi : bouton « envoyer » (avion en papier) ; fermer la feuille de partage sans envoyer garde le brouillon ; un seul envoi à la fois.
- Un lien reçu pendant la préparation d'un lieu ne perd pas ce brouillon.
- Tous les hôtes déclarés dans `src/services/hosts.ts` ; `securite.md` §2 à jour.

## À trancher (relecture `security-reviewer`)

- Lien forgé : n'importe qui peut envoyer un lien qui ajoute un lieu sans question (spec 001 D.3). Faut-il marquer les lieux reçus dans la partie préparation, ou une validation ?
- Lien lisible en clair dans la messagerie : brouiller le contenu, ou réduire la précision pour « maison » ?
- Domaine neutre plutôt que `ali-lamhene.github.io/gps/lieu`, qui nomme le développeur et la fonction de l'app.
- Une app relancée depuis les apps récentes peut relire le lien d'origine (Android) : sans effet aujourd'hui (pas de doublon), **bloquant dès que la suppression de lieux existe** (petit plugin natif à écrire avec cette spec).
- Le schéma `gps://` reste déclaré dans la build publiée.

## Hors périmètre

- Ajuster le point sur une carte après la recherche (spec 001 B.3) : le point de la suggestion est pris tel quel.
- ~~La page web du lien quand l'app n'est pas installée, et le fichier `assetlinks.json`~~ : publiés le 2026-11-05 sur le dépôt `ali-lamhene.github.io` (épingle seule, sans texte ; empreinte de la clé EAS).
- Mise en évidence du lieu reçu sur l'accueil (pulsation).

## Critères d'acceptation

- [x] Encodage et décodage testés, dont liens abîmés, hors bornes, version future, pictogramme inconnu, trop longs.
- [x] Pas de doublon pour un même lieu reçu deux fois (test).
- [x] E30 : suggestions, absence de réseau, absence de résultat (tests).
- [x] Envoi : feuille de partage avec le lien, rien de gardé (test).
- [ ] Sur téléphone (build « preview », vrai nom de paquet) : un lien envoyé par WhatsApp ouvre l'app et ajoute le lieu.
- [ ] Relu par `security-reviewer` et `ux-sans-texte-reviewer`.

## Hypothèses

- Pas d'étape « ajuster sur la carte » pour l'instant : les adresses de Photon tombent en général sur le bâtiment.
- Le lieu reçu prend le nom de son pictogramme pour la carte d'aide (le lien n'en porte pas).
