# 024 — Crédits des sources de données

- **Statut** : livré (vérifié dans le navigateur ; ⓘ natif à vérifier sur téléphone)
- **Date** : 2026-11-05
- **Persona** : accompagnant (texte autorisé, D8) ; voyageur pour le ⓘ de la carte (D9)

## Besoin

Transitous calcule les trajets (D17). Ses conditions d'usage demandent un lien vers https://transitous.org/sources/ « à un endroit visible », et le respect de l'attribution d'OpenStreetMap (https://www.openstreetmap.org/copyright). Aujourd'hui l'app ne cite Transitous nulle part : seul le README du dépôt le fait. Le crédit de la carte (ⓘ) ne nomme que les fournisseurs de la carte.

## Parcours

1. **Carte (voyageur et accompagnant)** : le ⓘ déplié affiche « © OpenFreeMap © OpenMapTiles © OpenStreetMap · Trajets : Transitous ». Texte seul, rien ne s'ouvre (D9 : le voyageur n'ouvre jamais un site par erreur).
2. **Partie accompagnant (E30, écran d'adresse)** : sous la note de confidentialité, une ligne « Crédits : itinéraires par Transitous (sources des données) · carte et adresses © les contributeurs d'OpenStreetMap ». « sources des données » et « les contributeurs d’OpenStreetMap » sont des liens soulignés, en émeraude, comme « Lieux enregistrés ».
3. Toucher un lien ouvre le navigateur du téléphone sur l'adresse fixe correspondante. L'app reste ouverte derrière.

## Données et confidentialité

- Rien n'est envoyé par l'app elle-même. Le navigateur, ouvert seulement par un toucher volontaire de l'accompagnant, envoie à `transitous.org` ou à `www.openstreetmap.org` l'adresse IP du téléphone et ce que le navigateur envoie à tout site (cookies, statistiques du site visité) ; la visite reste dans l'historique du navigateur. Elle ne montre qu'une app de trajets, jamais un lieu.
- Les deux adresses sont fixes, écrites dans `src/services/hosts.ts` ; aucune adresse n'est construite à partir d'une donnée (lieu, recherche).
- Le ⓘ de la carte n'ouvre rien.

## Cas limites

| Situation                          | Comportement attendu                                                     |
| ---------------------------------- | ------------------------------------------------------------------------ |
| Pas de navigateur sur le téléphone | Rien ne s'ouvre, aucune erreur affichée ; le texte du crédit reste.      |
| Pas de réseau                      | Le navigateur affiche sa propre page d'erreur ; l'app n'est pas touchée. |

## Hors périmètre

- Pas de lien de don à Transitous.
- Pas d'écran « À propos » séparé.
- Pas de crédit dans la partie voyageur hors du ⓘ de la carte.

## Critères d'acceptation

- [ ] Le ⓘ déplié montre Transitous en plus des crédits de carte, sans rien ouvrir (test).
- [ ] E30 montre la ligne de crédits ; toucher « sources des données » ouvre https://transitous.org/sources/, toucher « les contributeurs d’OpenStreetMap » ouvre https://www.openstreetmap.org/copyright (test).
- [ ] Aucune adresse ouverte en dehors de ces deux-là (test : `Linking.openURL` appelé avec ces seules valeurs).
- [ ] Vérifié à l'écran dans le navigateur.
- [ ] Relu par `security-reviewer`.

## Hypothèses

- E30 est l'endroit visible de la partie accompagnant : c'est l'écran qu'elle ouvre en premier.

## Questions / réponses

- Où ? Dans le ⓘ de la carte (texte seul) et dans la partie accompagnant (avec liens).
- Les liens s'ouvrent ? Oui côté accompagnant, jamais sur la carte.
- Lien de don ? Non.
