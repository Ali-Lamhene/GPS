# 038 — Un écran qui explique la permission avant la fenêtre du système

- **Statut** : livré (à voir sur le téléphone)
- **Date** : 2026-11-19
- **Persona** : voyageur (accompagné au premier lancement)

## Besoin

Deux permissions sont demandées aujourd'hui sans aucune préparation : la position (dès le démarrage, `LocationProvider`) et l'appareil photo (quand le déclencheur s'affiche, `photo-screen.tsx`). La fenêtre du système est en texte, dans la langue du téléphone : un voyageur qui ne lit pas ne sait pas pourquoi on lui demande, et peut refuser par réflexe. Un refus de la position retire « ici » ; Android cesse de redemander après un ou deux refus. `securite.md` §6 exige pour chaque permission « le parcours sans texte qui permet au voyageur de passer la fenêtre système » : cette spec l'écrit.

## Parcours

Deux écrans de même forme, un par permission, sans texte ni chiffre.

**Position (premier lancement)**

1. Au démarrage, si la position n'est pas accordée et qu'Android peut encore demander, l'accueil ne se montre pas encore : l'écran d'explication s'ouvre à la place. Il montre l'épingle à personnage « moi ici » (spec 027) sur une carte simplifiée, avec une grande flèche de la carte vers le téléphone qui « sait où je suis ». Un son doux et une vibration courte l'accompagnent à l'ouverture.
2. En dessous, un dessin simplifié et sans texte de la fenêtre du système, avec le choix « Pendant l'utilisation de l'app » entouré en vert. Le dessin n'est qu'une aide : l'accompagnant lit la vraie fenêtre.
3. Deux boutons l'un sous l'autre, pour que l'ordre ne dépende pas du sens de lecture : **✓** (continuer) grand en haut, **✗** (pas maintenant) plus petit dessous, qui se sent aussi (vibration et son de « ici » barré). Le geste retour d'Android vaut ✗.
4. ✓ : la fenêtre du système s'ouvre (`requestLocationAccess`). Si la position est accordée, l'accueil s'affiche. Si elle est refusée, l'accueil s'affiche avec « ici » barré (comportement actuel).
5. ✗ : l'accueil s'affiche sans demander la permission, « ici » barré.

**Appareil photo (première photo d'un lieu)**

1. Quand l'écran photo s'ouvre et que la permission n'est pas accordée et peut encore être demandée, l'écran d'explication s'affiche avant le déclencheur : un appareil photo, une flèche vers un lieu (le pictogramme du lieu), même dessin de la fenêtre du système avec « Pendant l'utilisation » surligné, mêmes ✓ et ✗.
2. ✓ : la fenêtre du système s'ouvre, puis l'écran photo s'affiche (caméra allumée si accordée).
3. ✗ : l'écran photo s'affiche sans caméra, avec le choix de photo du système et la photo de rue, comme aujourd'hui sans permission. Le lieu garde son pictogramme.

**Refus définitif (les deux permissions)** : Android ne redemande plus. L'écran d'explication garde la même forme, mais le dessin du système est remplacé par un dessin des réglages (l'interrupteur de la permission à activer). ✓ ouvre les réglages de l'app (`openLocationSettings`), ✗ ferme sans rien faire.

**Retour sur « ici » barré** : toucher « ici » barré rouvre l'écran de la position (au lieu de l'ouverture directe de la fenêtre ou des réglages actuelle).

## Signaux

| Information                                   | Canaux                                                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| « L'app a besoin de savoir où tu es »         | Image (épingle « moi ici », flèche vers le téléphone) + son doux et vibration courte à l'ouverture        |
| « L'app a besoin de l'appareil photo »        | Image (appareil photo, flèche vers le lieu) + son doux et vibration courte                                |
| Quel choix toucher dans la fenêtre du système | Dessin avec le bon choix entouré en vert (forme et couleur)                                               |
| Accepter / reporter                           | ✓ vert et ✗ gris, grands, formes différentes (pas la couleur seule) ; son de validation et vibration au ✓ |
| Il faut aller dans les réglages               | Dessin d'un interrupteur (forme) + vibration au ✓ qui ouvre les réglages                                  |

## Cas limites

| Situation                                            | Comportement attendu                                                                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Position déjà accordée au lancement                  | Aucun écran d'explication ; l'accueil s'affiche tout de suite                                                                                                  |
| ✗ au premier lancement                               | Accueil avec « ici » barré. Au démarrage suivant, l'écran revient tant que la position n'est pas accordée ; rien n'est mémorisé, l'état vient de la permission |
| Position approximative accordée                      | Traitée comme aujourd'hui (`coarse`) : « ici » barré, retour par l'écran                                                                                       |
| Interrupteur de position du téléphone coupé          | Comportement actuel (`openLocationSwitch`), hors de cet écran                                                                                                  |
| App passée en arrière-plan sur l'écran d'explication | Au retour, l'état de la permission est relu : s'il a changé, l'écran se ferme                                                                                  |
| Fenêtre du système refusée                           | Retour à l'accueil (ou à l'écran photo), « ici » barré ; l'écran revient sur « ici » barré                                                                     |
| Appareil sans caméra utilisable                      | Comportement actuel de l'écran photo, hors de cet écran                                                                                                        |

## Données et confidentialité

Rien n'est stocké : l'écran se base sur l'état de la permission donné par le système. Rien ne quitte le téléphone. Aucune nouvelle dépendance, aucune nouvelle permission (les deux existent déjà, voir `app.json`). Les images sont des dessins embarqués dans l'app.

## Hors périmètre

- Bouton d'aide sur ces écrans : choix d'Ali (2026-11-19), écart assumé au principe « l'aide à un geste » pour garder une seule décision par écran.
- Écran de permissions pour l'iPhone (plus tard, avec iOS).
- Explications des permissions côté Play Console et textes natifs de `app.json`.
- La fenêtre du système elle-même (impossible à changer).
- Photos ou captures réelles de la fenêtre Android.
- Texte ajouté à l'écran (D9 : zéro texte).

## Critères d'acceptation

- [ ] Premier lancement, position non accordée : l'écran de la position s'affiche avant la fenêtre du système (à voir sur le téléphone, données de l'app effacées).
- [ ] ✓ ouvre la fenêtre du système ; ✗ ouvre l'accueil sans fenêtre.
- [ ] Position déjà accordée : aucun écran d'explication.
- [ ] « Ici » barré rouvre l'écran ; avec refus définitif, ✓ ouvre les réglages.
- [ ] Écran photo : l'écran d'explication s'affiche avant le déclencheur, ✗ laisse le choix de photo du système.
- [ ] Aucun texte ni chiffre sur ces écrans (ESLint `gps/no-text-in-traveller-ui`).
- [ ] Son et vibration à l'ouverture et au ✓ (au moins deux canaux).
- [ ] `npm run check` passe ; relecture `ux-sans-texte-reviewer` et `security-reviewer` sans blocage.

## Hypothèses

- Le dessin de la fenêtre du système est une aide : son emplacement exact varie selon la version d'Android ; le choix « Pendant l'utilisation de l'app » existe depuis Android 11.
- Au refus définitif, l'écran garde ✗ qui ferme sans rien faire.
- Le son et la vibration de l'écran réutilisent ceux déjà en place (`playCue`) ; pas de nouveau son.
- Les pictogrammes sont ceux de l'app (épingle « moi ici », appareil photo, ✓ et ✗) ; seul le dessin de la fenêtre du système et celui des réglages sont nouveaux.
- Lecture seule des états de permission : `currentLocationAccess` et `useCameraPermissions`, sans nouveau service.

## Questions / réponses

- Périmètre : position et appareil photo (recommandé retenu).
- Moment : premier lancement et après un refus, sans rien stocker (recommandé retenu).
- Bouton : ✓ et ✗ (Ali a choisi les deux, pas le ✓ seul recommandé).
- Fenêtre du système : dessin simplifié avec le bon choix surligné (recommandé retenu).
- Après relecture UX (2026-11-19) : boutons l'un sous l'autre (choix d'Ali) ; pas de bouton d'aide (choix d'Ali) ; dessin du haut conforme à la spec (téléphone avec carte et épingle, ou appareil photo puis pictogramme du lieu) ; couverture neutre pendant la lecture de la permission ; sur l'écran photo, le déclencheur grisé rouvre l'explication après ✗.
- ✗ au premier lancement : l'écran revient au démarrage suivant (recommandé retenu).
- Refus définitif : ✓ ouvre les réglages avec un dessin des réglages (recommandé retenu).

## À voir sur le téléphone

- Le dessin de la fenêtre du système ressemble-t-il assez à la vraie (l'emplacement de « Pendant l'utilisation » varie selon la version d'Android) ?
- Position approximative (`coarse`) : « ici » barré puis ✓ ouvre-t-il bien la fenêtre pour la position précise ? Sinon prévoir le mode réglages.
- Pas de clignotement de l'accueil ni de la caméra avant l'écran.
- Retour Android sur l'écran : vaut ✗.
- Lecture sur le plus petit écran, en grande police.
