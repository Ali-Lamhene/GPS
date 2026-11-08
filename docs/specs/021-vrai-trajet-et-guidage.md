# 021 — Vrai trajet et guidage par la position

- **Statut** : validé (autonomie donnée par l'utilisateur le 2026-11-04 ; hypothèses ci-dessous)
- **Date** : 2026-11-04
- **Persona** : voyageur
- **Réalise** : les specs prévues 003 (composer un trajet) et 004 (guidage), dans leur version simple

## Parcours

1. Le départ et l'arrivée choisis, « ✓ » ouvre le choix du transport (E06). L'app calcule en ligne le trajet à pied, en transports et en voiture, en partant maintenant. Pendant le calcul, une roue tourne à la place du temps.
2. Un mode sans trajet (trop long à pied, pas de transport) est pâle et ne se touche pas ; si le mode choisi n'en a pas, l'app passe au premier qui en a un.
3. Pas de réseau : l'écran de connexion (E25), qui revient ici quand on réessaie.
4. Le récapitulatif (E07-E08), le guidage (E09-E23), l'aide et l'arrivée montrent ce vrai trajet : vraies rues, vraies lignes (numéro et couleur du réseau), vrais arrêts et vraies directions (D9).
5. Le départ « ici » est la position au moment où « ici » est choisi : le trajet ne change pas pendant la marche.
6. Guidage : le point suit la vraie position ; l'étape avance seule quand le voyageur arrive à l'endroit de l'étape suivante (sur le chemin, à moins de 60 m), jamais en arrière. À 25 m de l'arrivée, à la dernière étape, l'écran d'arrivée s'ouvre. Toucher la consigne fait avancer **seulement sans position récente** (aucun point, ou aucun nouveau point depuis 30 s : métro, tunnel, couloir) ; avec une position récente, la consigne ne se touche pas (retour de terrain du 2026-11-05 : un toucher changeait la consigne pendant la marche).

## Signaux

Inchangés (consignes, sons, vibrations des specs 002 à 010). Calcul en cours : roue émeraude.

## Données et confidentialité (nouvelle D17)

- **Transitous** (`api.transitous.org`, service communautaire gratuit, moteur MOTIS, données OpenStreetMap et horaires des réseaux) reçoit : le point de départ et le point d'arrivée (5 décimales), l'heure, l'adresse IP, et un en-tête qui nomme l'app avec l'adresse du projet (ses conditions l'exigent). C'est l'information la plus sensible de l'app : où part et où va le voyageur. D4 avait décidé le calcul en ligne depuis le téléphone ; D17 choisit ce service.
- **Conditions de Transitous** : projet libre (licence ouverte publiée) et non commercial, usage léger, lien visible vers `https://transitous.org/sources/`. **La licence du projet reste à choisir** (action de l'utilisateur) ; le crédit sera ajouté dans la partie accompagnant.
- Le trajet n'est pas encore gardé sur le téléphone (D5 : trajets utilisables hors connexion) : prochaine étape.
- La réponse est une entrée non fiable : lue strictement (`src/domain/route.ts`), noms coupés, couleurs vérifiées ; un trajet dont une étape est illisible est écarté en entier.

## Ajustements après les relectures (2026-11-04)

`security-reviewer` :

- Le calcul ne part qu'à l'arrivée sur E06 (après « ✓ »), jamais pour chaque couple essayé sur l'accueil.
- Points envoyés à 4 décimales (environ 10 m) au lieu de 5.
- Réponse bornée : 1 million de caractères, 15 s au plus (puis « pas de réseau »), 5 itinéraires, 20 étapes, 5 000 points par tracé ; un trajet qui ne part pas et n'arrive pas à moins de 400 m des points demandés est refusé (l'app ne guide jamais ailleurs).
- Noms sans caractères de contrôle ni de direction.
- `securite.md` §2 liste Transitous.

`ux-sans-texte-reviewer` :

- « Réessayer » sur E25 relance vraiment le calcul.
- Aucun trajet entre les deux lieux (ou erreur du service) : lieu barré orange et son d'alerte sur E06, l'aide en haut ; jamais « pas de réseau » à tort.
- Mode sans trajet : pastille barrée en plus de la pâleur ; un toucher donne le signal « indisponible ».
- Changement automatique de mode : son « select ».
- Virages annoncés 35 m avant le coin, « tout droit » 15 m après, tous les virages gardés ; l'arrivée à l'arrêt et au lieu après le dernier virage.
- Position : l'étape la plus proche (actuelle ou suivante) ; au bout d'une étape, la suivante l'emporte. Cap, jauge d'approche, temps restant et progression suivent la vraie position.

## À trancher

- En-tête qui nomme l'app pour Transitous (exigé par ses conditions) : il marque l'IP comme celle d'un voyageur de cette app dans ses journaux. Accepter, ou demander à Transitous un en-tête neutre ?
- Conditions d'usage : **licence libre à publier** et dépôt public ; crédit `https://transitous.org/sources/` à ajouter (partie accompagnant). À faire avant un vrai usage.
- La carte d'ensemble charge les tuiles autour du vrai trajet : OpenFreeMap déduit la zone de départ et d'arrivée (à noter dans D16).
- Le trajet est calculé « maintenant » à l'entrée sur E06 ; pas de recalcul si le voyageur part plus tard.

## Hors périmètre

- Recalcul quand le voyageur se perd (fait par la spec 031), état « mauvais sens », cône de la boussole.
- Comptage des arrêts dans le métro (capteurs posés dans la build, code à venir).
- Heure de départ ou d'arrivée choisie (rendez-vous).
- Trajets gardés pour le hors connexion.

## Critères d'acceptation

- [x] Une vraie réponse de Transitous (Marseille, bus 55 puis métro M1) est lue en étapes, lignes, arrêts (test sur un extrait réel).
- [x] Guidance construite depuis ces étapes, dans l'ordre ; avance par la position, jamais en arrière, pas depuis loin du chemin (tests).
- [x] Trajets par mode, absence de trajet, absence de réseau (tests).
- [ ] Sur le téléphone : un trajet réel calculé dans la ville de l'utilisateur, suivi à pied jusqu'à l'arrivée.
- [ ] Relu par `security-reviewer` et `ux-sans-texte-reviewer`.

## Hypothèses

- Transitous couvre les réseaux urbains français (vérifié pour Marseille, RTM).
- Seul le premier itinéraire proposé est montré.
- Le temps affiché est celui du calcul, sans attente du prochain passage en direct.
