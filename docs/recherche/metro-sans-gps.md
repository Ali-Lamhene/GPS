# Position dans le métro sans GPS : comment font les autres

Note de recherche (2026-11-01), pour trancher dans la spec 004 (guidage) comment placer le voyageur sur la ligne quand le GPS ne passe pas.

## Le problème

Sous terre, le GPS ne reçoit aucun satellite. Le téléphone ne sait plus où il est. Les apps grand public combinent alors plusieurs sources.

## Ce que font les apps de transport

- **Transit** (2024) : un modèle sur le téléphone reconnaît, à l'accéléromètre, si le voyageur est dans une rame qui roule, à l'arrêt en station, ou en train de marcher. Un second modèle combine cet état, la dernière position GPS, le temps écoulé et les horaires de la ligne pour estimer la station. Environ 90 % de bonnes estimations annoncées. Tout fonctionne hors connexion, sur le téléphone.
- **Citymapper** : l'alerte « descends au prochain arrêt » fonctionne hors connexion sous terre, mais la méthode n'est pas publiée. Les horaires du trajet sont gardés sur le téléphone ; l'estimation repose très probablement sur le temps et les horaires.
- **Google Maps** : méthode non documentée. Les données « en temps réel » viennent des réseaux de transport et décrivent la position des rames, pas celle du téléphone.

## Ce que dit la recherche

- **SubwayPS** (Stockx, Hecht, Schöning) : la variance de l'accéléromètre sur les trois axes distingue « rame en marche » et « rame à l'arrêt ». Compter les arrêts revient à compter les stations. Utilisable tel quel sur la plupart des métros, meilleur avec un réglage par réseau.
- **Métro de Londres** (Nguyen et al., 2019) : l'empreinte d'accélération du trajet est comparée à une base enregistrée à l'avance sur tout le réseau. Environ 90 % de bonnes estimations après au moins 3 stations.
- Limite commune : il faut plusieurs stations pour être sûr ; un arrêt en tunnel (régulation, incident) peut compter comme une station en trop.

## Et la position par le réseau mobile ?

Le métro de Marseille a la 4G dans les stations et les tunnels depuis 2023 (RTM, Bouygues, Orange, SFR, Free). Mais la position par les antennes ou le Wi-Fi passe par le service de localisation du système (Google sur Android, Apple sur iPhone) : les identifiants des antennes partent chez eux. Contraire à D1 si l'app la demande. À exclure, ou au minimum à ne jamais demander nous-mêmes.

## Pistes pour nous

1. **Temps seul** : position estimée à partir de l'heure de montée et de la durée prévue entre stations (horaires GTFS embarqués avec le trajet). Simple, sans capteur. Faux dès que la rame prend du retard ou s'arrête en tunnel.
2. **Compter les arrêts à l'accéléromètre** : chaque arrêt de la rame avance d'une station. Sur le téléphone, sans réseau. Robuste au retard ; trompé par un arrêt en tunnel. Nouveau capteur à relire (permission « mouvement » sur iPhone).
3. **Hybride, comme Transit** : compter les arrêts, contrôler avec le temps prévu (un arrêt trop tôt après le précédent est ignoré), recaler avec le GPS dès la sortie à l'air libre.

Rappel de `docs/screens.md` (§ 4.7) : sans signal fiable, pas de décompte exact des stations ni d'alerte de descente présentée comme certaine ; validation manuelle de l'étape possible.

Quelle que soit la piste, l'erreur la plus grave est de rater la station de descente. D'où deux garde-fous communs :

- alerter **une station avant** (« prépare-toi ») puis à la station estimée ;
- ne jamais affirmer une position précise entre deux stations : montrer la prochaine station, pas un point qui glisse ;
- garder le bouton « je suis descendu », que le voyageur confirme lui-même (E21).

## Sources

- [Transit : localiser les rames souterraines sans GPS (résumé Gigazine, 2024)](https://gigazine.net/gsc_news/en/20241115-no-gps-location/)
- [MacStories : Transit Can Now Track Underground Trains without GPS](https://www.macstories.net/linked/transit-can-now-track-underground-trains-without-gps/)
- [Citymapper : Get Off Alerts](https://citymapper.com/news/823/get-off-alerts)
- [Citymapper : Offline support](https://citymapper.com/news/1282/offline-support)
- [SubwayPS (arXiv 1904.01675)](https://arxiv.org/abs/1904.01675v1)
- [Realtime Tracking of Passengers on the London Underground (Sensors, 2019)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6806589/)
- [RTM : la 4G dans le métro (communiqué, juillet 2023)](https://www.rtm.fr/sites/default/files/2023-08/CP%20_4G_metro_170723.pdf)
