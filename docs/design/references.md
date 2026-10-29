# Références et enseignements

Recherches menées pour concevoir les écrans. Chaque enseignement est sourcé ; on ne garde que ce qui change une décision de conception.

## 1. Pictogrammes ARASAAC (revue visuelle, 2026-10-29)

Planche de comparaison construite à partir de l'API publique (`api.arasaac.org/v1/pictograms/fr/search/<mot>`, images `static.arasaac.org/pictograms/<id>/<id>_300.png`) et revue à l'écran.

**Constats**

1. **Deux familles de style coexistent.**
   - Bâtiments illustrés en couleur (ex. hôpital 3116, école 3082, mairie 3060, gare 3099) : riches, mais les détails disparaissent en petit, et les façades sont espagnoles (boîte aux lettres jaune de Correos, devantures).
   - Série « cadre maison + symbole » (ex. hôpital 6523, pharmacie 6497, école 6454, gare 6494, courrier 6464, bureau 28311) : un contour de maison noir, un seul symbole au centre. Lisible en petit, homogène, et le cadre dit « c'est un lieu ».
   - **Décision proposée** : utiliser la série « cadre maison + symbole » pour tous les lieux. Une seule grammaire visuelle, lisible à la taille d'une pastille.
2. **Les emblèmes sont religieux ou culturels.** Hôpital et pharmacie existent en variantes croix rouge (6523), croissant rouge (36205, 36836) et étoile de David (36210, 36837). Pour certains voyageurs, la croix est un symbole chrétien ; pour d'autres, c'est le seul signe médical connu. **Proposition** : la personne qui prépare choisit la variante adaptée au voyageur ; par défaut, un symbole neutre (lit, ambulance, stéthoscope) à valider en test.
3. **Écarter les pictogrammes anxiogènes.** La recherche « poste » renvoie des policiers (32332) et des menottes (32414). Police, uniformes, menottes, barreaux : à bannir pour un public qui a pu fuir des violences d'État. Même vigilance pour « tribunal » (marteau, juge).
4. **Certains pictogrammes contiennent du texte ou des objets nationaux.** Formulaires avec « FORMULARIO » (9092, 9173), cartes d'identité espagnoles (16169), drapeaux (école 34161). Interdits dans l'interface du voyageur (principes 1 et 6).
5. **La recherche par mot est bruyante.** « travail » renvoie surtout l'accouchement, « centre social » des bougies et un enterrement, « lieu de culte » une tombe. La liste des pictogrammes doit être **choisie à la main, identifiant par identifiant**, et figée dans le code.
6. **Manques** : pas de « préfecture » ni d'« OFPRA ». Candidats : guichet avec personne qui attend (5103), bureau dans un cadre maison (28311). Pas de bon pictogramme « laverie » ni « banque alimentaire » dans la série cadre maison : à composer (cadre maison + symbole existant), en respectant la licence CC BY-NC-SA (œuvre dérivée, même licence, crédit).

**Candidats retenus pour la planche des maquettes** (à confirmer visuellement en test) : maison 6964, ami 25790, hôpital 6523 / 36205, pharmacie 6497 / 36836, médecin 2467, administration / préfecture 5103 ou 28311, école 6454, gare 6494, arrêt de bus 2499, supermarché 6618, courrier 6464, banque 6055, parc 2434.

## 2. Typographie de la partie préparation

**Atkinson Hyperlegible Next** (Braille Institute, licence SIL Open Font License 1.1, disponible sur Google Fonts). Dessinée pour la lisibilité des personnes malvoyantes : formes de lettres très différenciées (I, l, 1 ; O, 0). Cohérente avec le projet, gratuite, et évite la typographie par défaut des maquettes générées (Inter, Poppins).

## 3. Études et applications

Fiabilité : **[solide]** étude empirique lue ; **[modéré]** petit échantillon, résumé seul ou public voisin ; **[anecdotique]** page produit, forum. Non trouvé : évaluations publiées de refugee.info, Gherbtna, Ankommen, InfoAid ; guide UNHCR ; étude sur le beacon de Soundscape.

### 3.1 Interfaces sans texte

- **Photo pour un lieu précis, dessin pour une catégorie.** Les dessins semi-abstraits et les photos sont bien mieux compris que les icônes abstraites. Une icône générique suffit pour « un hôpital » ; pour « cet hôpital », il faut sa photo. Confirme la carte photo + pictogramme. [solide] — Medhi, Sagar, Toyama, _Text-Free User Interfaces for Illiterate and Semiliterate Users_, ITID 4(1), 2007, https://ocw.mit.edu/courses/mas-965-nextlab-i-designing-mobile-technologies-for-the-next-billion-users-fall-2008/8ccecb3eacd514b7ea0255f5158de907_MITMAS_965F08_medhi2007.pdf
- **L'abstraction échoue.** Flèches animées non comprises (des petites voitures, si) ; couleurs lues littéralement ; maison dessinée vue comme une hutte ; une grille de coches et de croix non comprise ; un pictogramme d'action doit montrer le mouvement. → Tester chaque pictogramme ; ne pas faire reposer un état sur ✓ / ✗ seuls. [solide] — Medhi 2007.
- **L'aide permanente rassure.** Un bouton d'aide vocale présent partout raccourcit les tâches et sert de réassurance (consulté 3 ou 4 fois avant d'agir). La voix en langue maternelle motive. [solide] — Medhi 2007.
- **Les chiffres 0 à 9 étaient reconnus** et conservés par les auteurs. Notre règle « zéro chiffre » est plus stricte : à rediscuter pour les numéros de ligne de bus. [modéré] — Medhi 2007.
- **Hiérarchie et défilement.** Sur 90 personnes, 56 n'arrivent pas à naviguer dans des menus hiérarchiques, 48 ne comprennent pas le défilement vertical (elles ignorent qu'il y a du contenu dessous) ; beaucoup ont peur de « casser » le téléphone. Vidéo d'introduction et médiateur humain recommandés. [solide] — Medhi et al., _Designing Mobile Interfaces for Novice and Low-Literacy Users_, ACM ToCHI 18(1), 2011, https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ToCHI2711_Medhi.pdf
- **Gestes implicites.** Une interface « sans clic » (survol de 3 s) a dérouté et a été retirée. Aucune étude du glisser-déposer chez des personnes non lettrées ; chez des personnes âgées novices, il reste utilisable si la zone de dépôt est large. → Toucher comme geste principal, glisser en option. [modéré] — Medhi 2011 ; Motti, Vigouroux, Gorce, IHM 2014, https://pure.ul.ie/en/publications/drag-and-drop-for-older-adults-using-touchscreen-devices-effects-/
- **Voix + image** accélère la compréhension, mais une représentation plus riche n'est pas forcément mieux comprise. [modéré] — Medhi, Prasad, Toyama, WWW 2007, https://archives.iw3c2.org/www2007/paper764.php.html

### 3.2 Guidage par repères

- **On s'oriente par les repères**, pas par les points cardinaux ni les noms de rue ; les cartes ne sont pas des objets familiers. → La carte reste un support de réassurance, pas l'outil principal (compatible avec D6). [solide] — Medhi 2007.
- **Personnes avec déficience cognitive, en extérieur** : le guidage pas à pas aide surtout à démarrer chaque étape ; faire correspondre une photo au réel coûte cher, sauf si elle est **prise du point de vue du marcheur** ; sous stress, les gens **n'appuient pas sur le bouton d'aide** : le système doit détecter le besoin (arrêt prolongé, écart) ; la vibration d'alerte est appréciée ; les préférences varient, il faut personnaliser. [solide, petits échantillons] — Liu, Hile, Borriello, Kautz et al., _Informing the Design of an Automated Wayfinding System for Individuals with Cognitive Impairments_, ~2009, https://www.cs.virginia.edu/~rmw7my/papers/access.pdf
- Photos de repères (avec son) bien meilleures que la carte papier, surtout chez les personnes âgées. [modéré] — Goodman, Gray, Khammampad, Brewster, Mobile HCI 2004, https://www.dcs.gla.ac.uk/utopia/papers/mobilehci04.html

### 3.3 Vibrations et sons

- **PocketNavigator** : tout droit = 2 impulsions courtes ; demi-tour = 3 courtes ; gauche = longue puis courte ; droite = courte puis longue ; la longueur code l'angle, la pause code la distance. Vibration + carte augmente la confiance (21 personnes, centre-ville). [solide] — Pielot et al., INTERACT 2011, https://www.offis.de/offis/publikation/a-tactile-compass-for-eyes-free-pedestrian-navigation.html ; https://www.offis.de/offis/publikation/6th-senses-for-everyone-the-value-of-multimodal-feedback-in-handheld-navigation-aids.html
- **NaviRadar** : le **rythme** est le paramètre le plus distinctif (le réserver à la direction) ; l'**intensité** code le mieux la proximité ; un double coup est perçu comme « virage imminent ». Annoncer la direction seulement au point de virage fait ralentir et désoriente (13 % des carrefours contre 3 %). Les distances chiffrées à la voix sont mal estimées (« dans 45 m », on tourne à 25 m). → Signal continu et anticipé ; la jauge vaut mieux que des mètres. [solide] — Rümelin, Rukzio, Hardy, UIST 2011, https://www.medien.ifi.lmu.de/pubdb/publications/pub/ruemelin2011uist/ruemelin2011uist.pdf
- Apple Watch : 12 tapotements réguliers = droite, 3 paires = gauche ; des utilisateurs ne les distinguent pas. [anecdotique] — https://www.macworld.com/article/671636/how-to-use-maps-on-apple-watch.html
- Soundscape : son spatialisé venant de la destination, téléphone en poche. [anecdotique] — https://www.microsoft.com/en-us/research/product/soundscape/features/

### 3.4 Temps et distance sans chiffres

- Horaires représentés par deux cadrans reliés par une flèche. [modéré] — Medhi 2007.
- Temps visualisé (logiciel Tic-Tac) : moins d'anxiété pendant les attentes chez des adultes autistes. [modéré, pilote] — Herrera, Campillo et al., INSAR 2013, https://insar.confex.com/insar/2013/webprogram/Paper13069.html. Preuves du Time Timer surtout commerciales. [anecdotique]
- Aucune étude trouvée sur une jauge visuelle de distance chez des personnes non lettrées : à tester.

### 3.5 Terrain réfugiés

- 50 entretiens avec des réfugiés syriens et irakiens : la sécurité doit être centrale ; ne rien demander sur eux-mêmes ; la navigation sur téléphone peut les rendre traçables ; audio et vidéo pour les non-lecteurs ; batterie critique ; téléphones souvent perdus ou noyés. → Confirme D1. Prévoir une recréation rapide des lieux et soigner la batterie. [solide, qualitatif] — Gillespie et al., _Mapping Refugee Media Journeys_, Open University / France Médias Monde, 2016, https://www.statewatch.org/media/documents/news/2016/may/ou-mapping-refugee-media-journeys.pdf
- **Méthode de test des pictogrammes** : norme ISO 9186-1, appliquée à 50 migrants de 18 pays avec des médiateurs culturels. [modéré] — Fioravanti, _Legal Design Journal_, 2025, https://ojs.library.lancs.ac.uk/ldj/article/view/138

### 3.6 Culture

- **Le sens de lecture compte même sans lire.** Une frise début → fin de gauche à droite était mal comprise par des utilisateurs non lettrés de culture ourdou ; corrigée par une **flèche explicite** entre les deux. [solide] — Medhi 2007. Effet retrouvé chez des bilingues arabe-anglais. [solide, lettrés] — Park, Gagné, Spalding, _Frontiers in Psychology_, 2024, https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1356039/full → La barre de trajet et la jauge de progression ne doivent pas reposer sur la seule position gauche / droite.
- **Couleurs** : associations couleur-émotion largement universelles (30 pays, dont Iran et Égypte) ; le vert est stable ; le rouge évoque amour et colère, pas universellement « erreur ». → Vert / rouge seulement en canal redondant. [solide, lettrés] — Jonauskaite et al., _Psychological Science_ 31(10), 2020, https://helda.helsinki.fi/server/api/core/bitstreams/9c8b18e0-3848-43f5-838b-5035438cfd12/content
- **Mains** : pouce levé insultant en Iran et en Irak, signe « OK » lié au mauvais œil, paume tendue insultante. → Aucun pictogramme de main. [anecdotique] — https://en.wikipedia.org/wiki/Obscene_gesture

## 4. Ce qui remet en cause nos choix

| Choix actuel                                 | Constat                                                     | Proposition                                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Barre de trajet horizontale, départ à gauche | Sens gauche → droite mal compris (3.6)                      | Flèche animée explicite entre les cases ; marqueurs départ / arrivée distincts ; comparer la version verticale |
| Glisser-déposer                              | Pas de preuve pour ce public, gestes implicites ratés (3.1) | Toucher en geste principal, glisser en option, zones de dépôt larges                                           |
| Grille de lieux qui défile (spec 001)        | 48 / 90 ne comprennent pas le défilement (3.1)              | Rendre le défilement évident (carte coupée en bas d'écran) ou paginer ; à trancher avec le porteur             |
| Confirmation par coche / croix (spec 001)    | Coches et croix seules mal comprises (3.1)                  | Montrer le résultat (la carte qui rejoint la collection) ; coche en renfort, avec vibration et son             |
| Carte toujours affichée (D6)                 | Cartes peu familières (3.2)                                 | Garder la carte, mais en bandeau de réassurance ; le guidage repose sur flèche, vibration, son                 |
| Vert / rouge                                 | Rouge pas universellement « erreur » (3.6)                  | Toujours doublé par forme, son et vibration (déjà principe 3)                                                  |
| Aide à un geste                              | Sous stress, on n'appuie pas sur l'aide (3.2)               | Aide proactive (arrêt prolongé, écart) en plus du bouton, à cadrer en spec 003                                 |
| Guidage haptique                             | Signal au point de virage seulement = désorientation (3.3)  | Signal continu : rythme = direction, intensité = proximité                                                     |
| Photos de lieux                              | Photo utile si prise du point de vue du marcheur (3.2)      | Conseil dans P3 : « prenez la photo depuis le trottoir, face à l'entrée »                                      |
