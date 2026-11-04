# 017 — Carte opérante : carte en ligne et vraie position

- **Statut** : validé (code fait, à vérifier sur le téléphone avec la prochaine build)
- **Date** : 2026-11-04
- **Persona** : voyageur (accueil et tous les écrans à carte), accompagnant (installation)
- **Révise** : D12 (tuiles embarquées) et D5 pour la carte ; spec 002 (archive de Marseille) ; spec 015 (« ici »)

## Besoin

La carte de l'app tourne sur des données de test : une archive du centre de Marseille embarquée et une position inventée. L'utilisateur veut, pour l'instant, le comportement simple des applis de GPS classiques (Google Maps) : une carte en ligne qui marche partout, et la vraie position du téléphone. La carte embarquée, utilisable sans réseau, reviendra plus tard dans une évolution.

## Décision produit (nouvelle D16, exception assumée à D1)

La carte se charge en ligne, tuile par tuile, depuis **OpenFreeMap** (gratuit, sans clé ni compte, usage par une app autorisé). Ce service reçoit l'adresse IP du téléphone et les zones affichées, donc où se trouve le voyageur et quand. Accepté par l'utilisateur le 2026-11-04 pour la première version ; à remplacer par une carte embarquée dans une évolution. Les lieux, les trajets et la position ne sont jamais envoyés en tant que tels : seules les tuiles demandées par la carte quittent le téléphone.

## Parcours

### Premier lancement

1. L'app s'ouvre et demande aussitôt la permission de localisation (fenêtre d'Android, en texte). En général, l'accompagnant installe l'app avec le voyageur et touche « Autoriser » pour lui. Seulement pendant l'utilisation de l'app, jamais en arrière-plan.
2. Dès la première position, la carte se centre sur le voyageur : point émeraude (dessin actuel), à l'échelle d'un quartier.

### Accueil

3. La carte suit les gestes comme aujourd'hui (un doigt déplace, deux zooment) ; le bouton de recentrage ramène sur la vraie position.
4. « Ici » vaut la vraie position du moment. Le « + » enregistre un nouveau lieu à la vraie position (E27).
5. Les épingles des lieux s'affichent à leur vraie place ; le cadrage montre le voyageur et ses lieux à moins de 2 km (règle actuelle).
6. Le point de position bouge quand le voyageur marche. La position n'est suivie que lorsque l'app est à l'écran.

### Localisation refusée ou désactivée

7. Pas de point de position. La carte montre les lieux du voyageur, ou la France entière s'il n'en a pas.
8. Les tuiles « ici » et « + » (panneau et colonne) sont grisées, avec un pictogramme de position barré. Un toucher redemande la permission (ou ouvre les réglages si Android ne la redemande plus).
9. Choisir des lieux enregistrés reste possible.

### Sans réseau

10. Les zones non chargées restent vides (fond crème). Position, lieux, épingles et boutons marchent.
11. Un petit nuage barré orange (`cloud_off`, signal de E25) apparaît en haut de l'accueil tant que le réseau manque, et disparaît au retour du réseau.

### Autres écrans à carte

12. Choix du transport, récapitulatif, guidage, arrivée, aide, nouveau lieu : même carte en ligne, centrée sur leurs points. Le trajet affiché reste celui de la démonstration jusqu'à la spec 003 (calcul d'un vrai trajet) : il peut ne pas correspondre aux lieux choisis.

## Signaux

| Information           | Canaux                                                                   |
| --------------------- | ------------------------------------------------------------------------ |
| Ma position           | point émeraude (actuel), carte centrée dessus                            |
| Position indisponible | pas de point, « ici » et « + » grisés avec pictogramme de position barré |
| Pas de réseau         | nuage barré orange en haut de l'accueil, zones vides                     |

## Cas limites

| Situation                             | Comportement attendu                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| Position pas encore trouvée           | carte sur les lieux ou la France ; « ici » et « + » grisés jusqu'au premier point |
| Position imprécise (intérieur)        | le point s'affiche quand même ; pas de cercle de précision dans cette spec        |
| Permission refusée « définitivement » | le toucher sur « ici » grisé ouvre les réglages de l'app                          |
| App en arrière-plan                   | suivi de la position arrêté ; repris au retour                                    |
| Lieu enregistré loin (autre ville)    | épingle à sa place ; le cadrage reste sur le voyageur (2 km)                      |
| Retour du réseau                      | les tuiles manquantes se chargent seules, le nuage disparaît                      |

## Données et confidentialité

- **OpenFreeMap** (`tiles.openfreemap.org`, HTTPS) reçoit : l'adresse IP, les tuiles affichées (zone et niveau de zoom), l'en-tête de l'app. Exception à D1 assumée (D16). Hôte déclaré dans le module unique des services réseau (`securite.md` §2).
- **Position** : `expo-location`, au premier plan seulement, méthode standard d'Android (fournisseur « fused » des services Google) : le réglage « Précision de la localisation Google » du téléphone décide de ce qui part chez Google, pas l'app. La position reste en mémoire, jamais enregistrée ni envoyée par l'app.
- **Permission** : `ACCESS_FINE_LOCATION` et `ACCESS_COARSE_LOCATION`, retirées de `blockedPermissions` ; `ACCESS_BACKGROUND_LOCATION` reste bloquée.
- **Réseau de MapLibre** : rouvert (il était coupé), limité à l'hôte d'OpenFreeMap par le style ; ses logs restent hors de la console.
- **Dépendances** : `expo-location` (natif, Expo officiel) et de quoi savoir si le réseau manque (`expo-network`, natif, Expo officiel). Nouvelle build nécessaire.
- L'archive de Marseille et le code qui la sert sont retirés de l'app.

## Hors périmètre

- Carte embarquée, hors connexion (évolution).
- Calcul d'un vrai trajet (spec 003) et guidage réel (spec 004) : cône de direction, recalcul.
- Cercle de précision, boussole.
- Recherche d'adresse (spec à venir).

## Critères d'acceptation

- [ ] Sur le téléphone de l'utilisateur, hors de Marseille : la carte de sa ville s'affiche, le point est à sa vraie position, et bouge en marchant.
- [ ] Premier lancement : la permission est demandée aussitôt ; « Autoriser » centre la carte sur le voyageur.
- [ ] Permission refusée : pas de point, « ici » et « + » grisés avec position barrée ; un toucher redemande la permission.
- [ ] Un lieu créé avec « + » se place à la vraie position.
- [ ] Mode avion : nuage barré orange, l'accueil reste utilisable ; il disparaît au retour du réseau.
- [ ] L'APK ne demande pas la localisation en arrière-plan (`aapt dump permissions`).
- [ ] Seul `tiles.openfreemap.org` est contacté par la carte (vérifié dans le navigateur et sur l'APK).
- [ ] Relu par `security-reviewer` et `ux-sans-texte-reviewer`.

## Ajustements après les relectures (2026-11-04)

`security-reviewer` :

- La carte ne peut joindre que `tiles.openfreemap.org` : toute autre adresse, même venue du TileJSON distant, est réécrite vers une adresse injoignable (téléphone et navigateur).
- Les requêtes de la carte portent un en-tête neutre (« MapLibre Native »), jamais le nom de l'app.
- Cache des tuiles : vidé à chaque lancement (décision de l'utilisateur) ; il sert pendant l'utilisation, puis ne laisse pas d'historique daté des zones regardées.
- Permissions bloquées en plus : `FOREGROUND_SERVICE_LOCATION`, `ACTIVITY_RECOGNITION` (les deux), `ACCESS_WIFI_STATE`.
- `securite.md` §2 et §6 mis à jour (hôte, exception « au premier lancement »).

`ux-sans-texte-reviewer` :

- Localisation du téléphone coupée (permission accordée) : « ici » barré ; un toucher ouvre l'interrupteur de localisation du téléphone. L'app n'ouvre jamais d'elle-même la fenêtre de Google, et jamais celle qui active la précision Google (elle enverrait les Wi-Fi alentour à Google).
- Position approximative seulement (Android 12+) : « ici » et « + » barrés ; un toucher redemande la position précise. Un lieu n'est jamais enregistré à un point approximatif.
- Retour de l'arrière-plan : l'ancien point est oublié jusqu'au prochain relevé ; « + » n'enregistre jamais un point périmé.
- Deux aspects : recherche en cours (cible grise, non barrée) et indisponible (cible barrée, `location_disabled`, même forme que « ici ») ; fond gris et pictogramme net, sans transparence, pour inviter au toucher.
- Toucher « ici » ou « + » sans position : son et vibration « indisponible » (deux notes graves descendantes, nouveau son), puis nouvelle demande.
- Le cadrage suit le voyageur par pas d'environ 100 m, pour ne pas reprendre la carte à chaque relevé.
- Nuage hors connexion plus visible (plein, disque blanc cerclé d'orange) et son « hors connexion » joué une fois à son apparition (deuxième canal, écart assumé à la spec).

À tester sur le terrain : fenêtre « Précise / Approximative » et « Uniquement cette fois » (que touche l'accompagnant ?), temps avant le premier point en intérieur, vue « France entière » sans point, nuage remarqué en marchant.

## Hypothèses

- Style OpenFreeMap « planet » (schéma OpenMapTiles), redessiné aux couleurs de la carte émeraude actuelle, toujours sans aucune étiquette ni texte.
- Le point émeraude actuel suffit ; pas de cercle de précision.
- Le cadrage de l'accueil garde sa règle des 2 km.

## Questions / réponses

- Carte embarquée ou en ligne : en ligne pour l'instant, embarquée dans une évolution.
- But : copier et simplifier le comportement des applis de GPS classiques.
- Permission : au premier lancement.
- Refus : carte sans point, « ici » et « + » grisés.
- Source de la position : comme Google Maps (fournisseur standard d'Android).
- Sans réseau : carte vide et nuage barré orange.
