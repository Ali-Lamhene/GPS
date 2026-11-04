import { readPhotonResults } from '../address';

const feature = (properties: object, coordinates: unknown = [5.37, 43.29]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates },
  properties,
});

describe('readPhotonResults (spec 001)', () => {
  test('reads name, detail and point', () => {
    const results = readPhotonResults({
      features: [
        feature({
          name: 'Pharmacie du Port',
          street: 'quai du Port',
          housenumber: '14',
          city: 'Marseille',
          postcode: '13002',
        }),
        feature({ street: 'rue des Lilas', housenumber: '3', city: 'Lyon' }, [4.83, 45.76]),
      ],
    });

    expect(results).toEqual([
      {
        name: 'Pharmacie du Port',
        detail: '14 quai du Port, 13002, Marseille',
        point: [5.37, 43.29],
      },
      { name: '3 rue des Lilas', detail: 'Lyon', point: [4.83, 45.76] },
    ]);
  });

  test('drops anything malformed', () => {
    expect(
      readPhotonResults({
        features: [
          feature({ name: 'Far' }, [500, 43]),
          feature({ name: 'Text' }, ['5', '43']),
          feature({}),
          { geometry: null },
          'nope',
        ],
      }),
    ).toEqual([]);
    expect(readPhotonResults(null)).toEqual([]);
  });

  test('keeps at most six results', () => {
    const many = Array.from({ length: 10 }, (_, i) => feature({ name: `Lieu ${i}` }));
    expect(readPhotonResults({ features: many })).toHaveLength(6);
  });
});
