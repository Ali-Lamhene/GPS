// Fake address suggestions of the static mockup implementation (D11). Real search goes
// through Photon (OpenStreetMap) in spec 001, from the companion area only.

export type AddressSuggestion = { name: string; address: string };

export const DEMO_ADDRESSES: readonly AddressSuggestion[] = [
  { name: 'Pharmacie du Port', address: '14 quai du Port, Marseille' },
  { name: 'Centre de santé des Lilas', address: '22 avenue des Lilas, Marseille' },
  { name: 'Chez Leïla', address: '8 rue des Récollettes, Marseille' },
  { name: 'Centre social Les Tilleuls', address: '3 rue des Tilleuls, Marseille' },
];

/** Suggestions whose name or address contains the typed text, ignoring case. */
export function matchAddresses(query: string): AddressSuggestion[] {
  const needle = query.trim().toLowerCase();
  return DEMO_ADDRESSES.filter((item) =>
    `${item.name} ${item.address}`.toLowerCase().includes(needle),
  );
}
