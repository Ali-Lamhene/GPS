# 026 — Retrait du mode voiture

- **Statut** : livré
- **Date** : 2026-11-08
- **Persona** : voyageur

## Besoin

Retour de terrain de l'utilisateur (2026-11-05, point 8) : le choix « voiture » ne sert pas notre public (les voyageurs ne conduisent pas, et un conducteur ne doit pas regarder un écran). Décision de l'utilisateur : le retirer. Révise D2.

## Parcours

1. Sur le choix du transport (E06), deux pastilles seulement : à pied, transports en commun.
2. L'app ne demande plus de trajet en voiture à Transitous : deux calculs au lieu de trois.
3. Le reste est inchangé (choix automatique du premier mode qui a un trajet, mode sans trajet pâle et barré).

## Signaux

Inchangés.

## Cas limites

| Situation                               | Comportement attendu                                                     |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Transitous renvoie une étape en voiture | Étape illisible : le trajet est écarté en entier (règle de la spec 021). |
| Ni à pied ni en transport               | Lieu barré orange et son d'alerte sur E06 (spec 021).                    |

## Données et confidentialité

Une requête de moins vers Transitous (même contenu que les deux autres). Rien de nouveau.

## Hors périmètre

- Mode passager (voiture d'un proche, taxi) : pas prévu.
- Vélo.

## Critères d'acceptation

- [x] E06 montre deux pastilles (test du sélecteur).
- [x] Seuls « à pied » et « transports » sont demandés à Transitous (test du contexte des trajets).
- [ ] Sur le téléphone : E06 avec deux pastilles, bien centrées.

## Hypothèses

- Les deux pastilles gardent leur taille (64 dp) et se centrent ; pas de nouvelle mise en page.
