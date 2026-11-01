# 001 — Lieux : créer, partager, recevoir

- **Statut** : validé
- **Date** : 2026-10-29
- **Persona** : travailleur social (et toute personne qui sait lire) pour la préparation ; voyageur pour l'accueil et la réception

## Besoin

Le voyageur doit pouvoir choisir, sans lire, l'endroit où il veut aller. Pour cela il a sur son téléphone une collection de **lieux** (maison, hôpital, préfecture, chez Maurice…), chacun reconnaissable par une photo, un pictogramme et une couleur (décision D3).

Ces lieux sont créés par une personne qui sait lire :

- **à côté du voyageur**, directement sur son téléphone, avec une photo du lieu ;
- **à distance** : l'accompagnateur tape une adresse sur son propre téléphone et envoie un lien. Exemple : l'adresse d'une convocation OFPRA. Le voyageur touche le lien et le lieu apparaît chez lui.

Cette spec couvre les lieux et l'accueil du voyageur. La composition d'un trajet (spec 002) et le guidage (spec 003) viennent après.

## Parcours

### A. Accueil du voyageur

1. Le voyageur ouvre l'app. Il voit une grille de grandes cartes, une par lieu, qui défile si elle dépasse l'écran.
2. Ordre : les lieux « maison » d'abord, puis du plus récemment ajouté au plus ancien.
3. Une carte avec photo : la photo remplit la carte, un cadre épais de la couleur du lieu l'entoure, le pictogramme est en pastille dans un coin. Une carte sans photo : grand pictogramme sur fond de la couleur du lieu.
4. Aucun lieu encore : un visuel d'attente sans texte (pictogramme de maison vide ou équivalent). Dans cette spec, toucher un lieu ne fait rien : la composition du trajet arrive avec la spec 002.
5. Un petit symbole discret (coin de l'écran) permet d'entrer dans la partie préparation par un **appui long de 3 secondes** (D8). Un appui court ne fait rien.

### B. Créer un lieu sur le téléphone du voyageur (partie préparation)

1. La personne qui sait lire fait l'appui long de 3 secondes. La partie préparation s'ouvre, en français.
2. Elle voit la liste des lieux et un bouton « Ajouter un lieu ».
3. Elle place le lieu :
   - en tapant une adresse (recherche dans un service public, suggestions au fil de la frappe) ;
   - puis elle ajuste le point en touchant ou en déplaçant le repère sur la carte, par exemple sur l'entrée exacte du bâtiment ;
   - ou directement en touchant la carte, sans recherche.
4. Elle choisit un pictogramme dans une liste fixe et une couleur dans une palette fixe.
   Elle indique si le lieu peut apparaître sur la carte d'accueil (case « ne pas montrer sur la carte », cochée d'office pour « maison » et « famille », spec 005).
5. Elle ajoute une photo (facultatif) : appareil photo ou galerie. Elle peut la recadrer au format de la carte.
6. Elle enregistre. Le lieu apparaît dans la liste et sur l'accueil du voyageur.
7. Depuis la liste, elle peut **modifier** un lieu (position, pictogramme, couleur, photo) ou le **supprimer** (avec confirmation).
8. Un bouton « Retour » ramène à l'accueil du voyageur.

### C. Partager un lieu à distance (téléphone de l'accompagnateur)

1. L'accompagnateur, qui a aussi l'app, entre dans la partie préparation (même appui long).
2. Il choisit « Envoyer un lieu ». Il place le lieu (adresse et/ou carte), choisit pictogramme et couleur. Pas de photo.
3. Il touche « Partager ». La feuille de partage du téléphone s'ouvre (WhatsApp, SMS, e-mail…) avec le lien.
4. Après le partage, rien n'est gardé sur son téléphone.
5. Il peut aussi partager un lieu existant depuis la liste des lieux (sur le téléphone du voyageur, par exemple) : seul le lien part, sans la photo.

### D. Recevoir un lieu (téléphone du voyageur)

1. Le voyageur touche le lien dans WhatsApp ou ses SMS.
2. L'app s'ouvre (qu'elle soit fermée ou déjà ouverte).
3. Le lieu est ajouté automatiquement, sans question.
4. Confirmation : une coche verte animée, une vibration et un son de réussite.
5. L'accueil s'affiche. Le nouveau lieu est en tête (après les « maison ») et mis en évidence quelques secondes (pulsation du cadre).

## Signaux

| Information                    | Canaux                                                                      |
| ------------------------------ | --------------------------------------------------------------------------- |
| Un lieu de la liste            | Photo, pictogramme, couleur du cadre ou du fond                             |
| Lieu reçu et ajouté            | Coche verte animée, vibration courte, son de réussite, lieu mis en évidence |
| Lieu déjà présent              | Même confirmation, le lieu existant est mis en évidence (pas de doublon)    |
| Lien abîmé ou illisible        | Croix rouge animée, double vibration, son d'erreur ; rien n'est ajouté      |
| Entrée en préparation possible | Le symbole se remplit progressivement pendant l'appui long, puis vibration  |

## Cas limites

| Situation                                        | Comportement attendu                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Lien touché, app non installée                   | Page web très visuelle (icône de l'app, grand bouton) qui mène au store. Après installation, il faut retoucher le lien.   |
| Même lien touché deux fois                       | Pas de doublon : un lieu aux mêmes coordonnées (à quelques mètres près) avec le même pictogramme est considéré identique. |
| Lien d'une version future de l'app               | Traité comme lien illisible si le format est inconnu ; rien n'est ajouté.                                                 |
| Lien modifié à la main, coordonnées hors limites | Lien illisible, rien n'est ajouté.                                                                                        |
| Pas de réseau pendant la préparation             | Recherche d'adresse et fond de carte indisponibles : message en français ; le lieu ne peut pas être placé. Réessayer.     |
| Recherche d'adresse sans résultat                | Message « Aucune adresse trouvée », proposer de toucher la carte.                                                         |
| Permission appareil photo ou galerie refusée     | Message en français expliquant comment l'autoriser ; le lieu peut être enregistré sans photo.                             |
| Photo très lourde                                | Redimensionnée et compressée avant stockage.                                                                              |
| Voyageur entre par hasard en préparation         | Bouton « Retour » toujours visible, grand ; le geste système retour ramène aussi à l'accueil.                             |
| Suppression d'un lieu                            | Confirmation obligatoire ; la photo associée est effacée du téléphone.                                                    |
| Beaucoup de lieux                                | Pas de limite ; la grille défile.                                                                                         |

## Données et confidentialité

Conforme à D1. Aucune donnée d'identité, aucun compte, aucun serveur à nous.

- **Stocké sur le téléphone du voyageur** : pour chaque lieu, coordonnées, pictogramme, couleur, photo éventuelle, date d'ajout. Jusqu'à suppression du lieu ou de l'app. Pas de nom ni d'adresse en texte.
- **Photos** : copiées dans le stockage privé de l'app, métadonnées (EXIF, dont la position GPS) effacées. Elles ne quittent jamais le téléphone.
- **Téléphone de l'accompagnateur** : rien n'est gardé après le partage.
- **Lien** : contient seulement version du format, coordonnées, pictogramme, couleur, dans la partie après `#`. Cette partie n'est envoyée à aucun serveur, y compris la page web. L'aperçu de lien de WhatsApp ne la reçoit pas non plus.
- **Services tiers** (uniquement dans la partie préparation) :
  - recherche d'adresse : Photon (komoot, OpenStreetMap) — reçoit le texte tapé et l'adresse IP ;
  - fond de carte : OpenFreeMap (tuiles OpenStreetMap) — reçoit la zone affichée et l'adresse IP ;
  - page web du lien : GitHub Pages — reçoit la visite (adresse IP), jamais le lieu.
- L'accueil du voyageur n'appelle aucun service.

## Hors périmètre

- Composer un trajet, calculer un itinéraire, la carte du trajet (spec 002).
- Guidage pendant la marche (spec 003).
- Création d'un lieu par le voyageur lui-même (« je suis ici » + photo) : spec ultérieure.
- Envoyer une photo à distance.
- Nom ou description en texte d'un lieu.
- Partager plusieurs lieux dans un seul lien.
- Sauvegarde ou transfert des lieux vers un autre téléphone.
- Autres langues que le français dans la partie préparation (le code est prêt pour les ajouter).

## Critères d'acceptation

- [ ] Sur un téléphone neuf, l'accueil montre le visuel « aucun lieu », sans texte ni chiffre.
- [ ] Un appui court sur le symbole de préparation ne fait rien ; un appui de 3 secondes ouvre la partie préparation, avec vibration.
- [ ] En préparation, taper « 1 place de l'Hôtel de Ville Paris » propose l'adresse ; le repère se pose ; le déplacer par la carte change la position enregistrée.
- [ ] Créer un lieu avec photo : il apparaît sur l'accueil, photo plein cadre, cadre couleur, pastille pictogramme.
- [ ] Créer un lieu sans photo : grand pictogramme sur fond couleur.
- [ ] Les lieux « maison » sont en tête, puis les autres du plus récent au plus ancien.
- [ ] Modifier et supprimer un lieu fonctionnent ; après suppression, la photo n'existe plus dans le stockage de l'app.
- [ ] La photo stockée n'a plus de métadonnées EXIF de position.
- [ ] Sur un second téléphone, « Envoyer un lieu » puis « Partager » produit un lien `https://` ; envoyé par WhatsApp, il est cliquable.
- [ ] Toucher ce lien sur le téléphone du voyageur ouvre l'app (fermée et ouverte) et ajoute le lieu, avec coche verte, vibration et son.
- [ ] Toucher deux fois le même lien ne crée pas de doublon.
- [ ] Un lien abîmé (caractères supprimés) affiche la croix rouge et n'ajoute rien.
- [ ] Sans l'app installée, le lien ouvre la page web avec le bouton d'installation.
- [ ] Le téléphone de l'accompagnateur ne garde aucun lieu après partage.
- [ ] L'accueil du voyageur passe la règle ESLint `gps/no-text-in-traveller-ui` et la revue `ux-sans-texte-reviewer`.
- [ ] Test terrain : un voyageur reconnaît, sans aide, le lieu « hôpital » parmi 6 lieux.

## Hypothèses

À valider avec cette spec :

1. **Pictogrammes** : sélection ARASAAC d'une vingtaine de lieux : maison, chez un ami, hôpital, médecin, pharmacie, préfecture / administration, OFPRA / tribunal, association, banque alimentaire, école, travail, magasin, gare, arrêt de bus, parc, laverie, poste, banque. Crédit ARASAAC affiché dans la partie préparation (licence CC BY-NC-SA).
2. **Couleurs** : palette de 8 couleurs distinguables par les daltoniens et au soleil ; la couleur n'est jamais le seul moyen de distinguer (pictogramme et photo aussi).
3. **Lien** : `https://ali-lamhene.github.io/gps/lieu#…`, page statique sur GitHub Pages. Les liens qui ouvrent l'app (Android App Links, iOS Universal Links) exigent un fichier à la racine du domaine, donc un dépôt `ali-lamhene.github.io`.
4. **Plateformes** : Android et iPhone. iPhone exige le compte Apple développeur payant (exception à D7 acceptée). Vérifications d'abord sur Android.
5. **Carte de préparation** : MapLibre, qui demande une version de développement de l'app (pas Expo Go).
6. **Stockage** : base locale sur le téléphone (SQLite) et fichiers photo dans le stockage privé de l'app.
7. **Partie préparation sans protection** : l'appui long suffit, pas de code (D8).

## Questions / réponses

- Modes de déplacement dans la première livraison ? → À pied d'abord ; voiture et transports en commun dans leurs propres specs.
- Lien cliquable via page web statique ? → Oui, page statique gratuite, le lieu après `#`.
- Choix de l'adresse ? → Recherche d'adresse + toucher la carte.
- Accès à la préparation ? → Appui long caché.
- Réception d'un lien ? → Ajout direct + confirmation, sans écran accepter / refuser.
- Reconnaître un lieu ? → Pictogramme + couleur, et photo prise sur le téléphone du voyageur.
- Nom dans le lien ? → Non.
- Historique chez l'accompagnateur ? → Rien n'est gardé.
- Modèle : trajets ou lieux ? → Lieux. Le voyageur compose ses trajets (spec 002). Calcul en ligne depuis son téléphone, trajets gardés uniquement sur son téléphone (D4 révisée).
- Serveur Firebase pour trajets et photos ? → Écarté : aucune donnée sur un serveur, photos uniquement sur le téléphone du voyageur.
- Création à distance ? → Oui, l'accompagnateur tape une adresse et partage un lien (ex. convocation OFPRA).
- Découpage ? → 3 specs : lieux, composition de trajet, guidage.
- Pictogrammes ? → ARASAAC.
- Nombre de lieux ? → Sans limite, grille qui défile.
- Langue de la préparation ? → Français seulement, code prêt pour d'autres langues.
- Plateformes ? → Android et iPhone.
- Aspect d'un lieu ? → Photo plein cadre + cadre couleur + pastille pictogramme ; sinon pictogramme sur fond couleur.
- Ordre ? → Maison d'abord, puis du plus récent au plus ancien.
- App non installée ? → Page avec bouton d'installation.
