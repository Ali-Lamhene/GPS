// Catalogue of place pictograms (spec 011): every kind of place a traveller may need,
// grouped by family. The family only orders the grid of E28; the name is read by screen
// readers for the companion, never shown to the traveller. Names are Material Symbols
// glyphs bundled with the app (src/ui/icon/glyphs.ts, checked by a test).
// Left out on purpose: consulates and embassies of the home country (D1), glyphs that
// contain letters or a currency sign, glyphs already used for the trip's ends, modes or
// stops (start pin, bus, metro), and images many travellers find offensive (a pig).
// Reviewed by ux-sans-texte-reviewer (2026-11-03).

export const PICTOGRAM_CATALOGUE = [
  {
    family: 'home',
    pictograms: [
      { icon: 'home', name: 'maison' },
      { icon: 'family_home', name: 'famille' },
      { icon: 'group', name: 'chez un ami' },
      { icon: 'night_shelter', name: 'hébergement, foyer' },
      { icon: 'hotel', name: 'hôtel' },
      { icon: 'apartment', name: 'immeuble, logement' },
    ],
  },
  {
    family: 'health',
    pictograms: [
      { icon: 'local_hospital', name: 'hôpital' },
      { icon: 'emergency', name: 'urgences' },
      { icon: 'stethoscope', name: 'médecin' },
      { icon: 'visibility', name: 'ophtalmologue' },
      { icon: 'dentistry', name: 'dentiste' },
      { icon: 'pediatrics', name: 'pédiatre' },
      { icon: 'pregnant_woman', name: 'maternité, sage-femme' },
      { icon: 'gynecology', name: 'gynécologue' },
      { icon: 'cardiology', name: 'cardiologue' },
      { icon: 'hearing', name: 'ORL, audition' },
      { icon: 'physical_therapy', name: 'kinésithérapeute' },
      { icon: 'psychology', name: 'psychologue' },
      { icon: 'bloodtype', name: 'laboratoire, prise de sang' },
      { icon: 'vaccines', name: 'vaccination' },
      { icon: 'local_pharmacy', name: 'pharmacie' },
    ],
  },
  {
    family: 'admin',
    pictograms: [
      { icon: 'location_city', name: 'mairie' },
      { icon: 'account_balance', name: 'préfecture, administration' },
      { icon: 'gavel', name: 'tribunal' },
      { icon: 'balance', name: 'avocat' },
      { icon: 'description', name: 'dossier, papiers' },
      { icon: 'badge', name: 'titre de séjour, carte' },
      { icon: 'local_police', name: 'police' },
      { icon: 'local_post_office', name: 'poste' },
      { icon: 'credit_card', name: 'banque' },
      { icon: 'payments', name: 'distributeur de billets' },
    ],
  },
  {
    family: 'social',
    pictograms: [
      { icon: 'handshake', name: 'association' },
      { icon: 'volunteer_activism', name: 'accueil de jour, aide' },
      { icon: 'diversity_3', name: 'centre social, groupe' },
      { icon: 'food_bank', name: 'distribution alimentaire' },
      { icon: 'soup_kitchen', name: 'repas' },
      { icon: 'shower', name: 'douches' },
      { icon: 'local_laundry_service', name: 'laverie' },
      { icon: 'checkroom', name: 'vestiaire, vêtements' },
    ],
  },
  {
    family: 'studies',
    pictograms: [
      { icon: 'school', name: 'école' },
      { icon: 'menu_book', name: 'cours, livres' },
      { icon: 'local_library', name: 'bibliothèque' },
      { icon: 'child_care', name: 'crèche' },
      { icon: 'stroller', name: "garde d'enfants" },
      { icon: 'toys', name: 'aire de jeux' },
    ],
  },
  {
    family: 'work',
    pictograms: [
      { icon: 'work', name: 'travail' },
      { icon: 'person_search', name: "agence pour l'emploi" },
      { icon: 'construction', name: 'chantier' },
    ],
  },
  {
    family: 'shopping',
    pictograms: [
      { icon: 'shopping_cart', name: 'supermarché' },
      { icon: 'storefront', name: 'magasin' },
      { icon: 'shopping_bag', name: 'boutique' },
      { icon: 'content_cut', name: 'coiffeur' },
      { icon: 'restaurant', name: 'restaurant' },
      { icon: 'local_cafe', name: 'café' },
      { icon: 'phone_iphone', name: 'téléphone, réparation' },
    ],
  },
  {
    family: 'transport',
    pictograms: [
      { icon: 'train', name: 'gare' },
      { icon: 'airport_shuttle', name: 'gare routière' },
      { icon: 'directions_railway', name: 'métro' },
      { icon: 'tram', name: 'tramway' },
      { icon: 'local_airport', name: 'aéroport' },
      { icon: 'directions_boat', name: 'port, bateau' },
      { icon: 'local_taxi', name: 'taxi' },
      { icon: 'garage', name: 'parking' },
    ],
  },
  {
    family: 'leisure',
    pictograms: [
      { icon: 'park', name: 'parc' },
      { icon: 'beach_access', name: 'plage' },
      { icon: 'fitness_center', name: 'salle de sport' },
      { icon: 'sports_soccer', name: 'football' },
      { icon: 'pool', name: 'piscine' },
      { icon: 'museum', name: 'musée' },
      { icon: 'theater_comedy', name: 'spectacle' },
    ],
  },
  {
    family: 'worship',
    pictograms: [
      { icon: 'mosque', name: 'mosquée' },
      { icon: 'church', name: 'église' },
      { icon: 'synagogue', name: 'synagogue' },
      { icon: 'temple_hindu', name: 'temple hindou' },
      { icon: 'temple_buddhist', name: 'temple bouddhiste' },
    ],
  },
  {
    family: 'other',
    pictograms: [
      { icon: 'favorite', name: 'lieu important' },
      { icon: 'push_pin', name: 'autre lieu' },
    ],
  },
] as const;

type Catalogue = typeof PICTOGRAM_CATALOGUE;
/** A pictogram a place can wear, from the catalogue. */
export type CataloguePictogram = Catalogue[number]['pictograms'][number]['icon'];
export type PlaceFamily = Catalogue[number]['family'];

const BY_ICON = new Map<string, { family: PlaceFamily; name: string }>(
  PICTOGRAM_CATALOGUE.flatMap(({ family, pictograms }) =>
    pictograms.map(({ icon, name }) => [icon, { family, name }] as const),
  ),
);

/** Whether a name is one of the catalogue's pictograms. */
export function isCataloguePictogram(icon: string): icon is CataloguePictogram {
  return BY_ICON.has(icon);
}

/** French name of a pictogram, for screen readers; « lieu » when unknown. */
export function pictogramName(icon: string): string {
  return BY_ICON.get(icon)?.name ?? 'lieu';
}

/** Family of a pictogram; anything outside the catalogue is « other ». */
export function pictogramFamily(icon: string): PlaceFamily {
  return BY_ICON.get(icon)?.family ?? 'other';
}

/**
 * A pictogram read from outside (a share link from a newer version): unknown names become
 * « autre lieu », so a place never shows a missing glyph.
 */
export function toCataloguePictogram(icon: string): CataloguePictogram {
  return isCataloguePictogram(icon) ? icon : 'push_pin';
}
