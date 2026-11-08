import { readPhotonAddress, readPhotonResults } from '../address';

const feature = (properties: object, coordinates: unknown = [5.37, 43.29]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates },
  properties,
});

describe('readPhotonAddress (spec 029)', () => {
  test('reads the street address with its town', () => {
    const answer = {
      features: [
        feature({
          housenumber: '14',
          street: 'Quai du Port',
          postcode: '13002',
          city: 'Marseille',
        }),
      ],
    };
    expect(readPhotonAddress(answer)).toBe('14 Quai du Port, 13002 Marseille');
  });

  test('falls back on the name, drops control and direction characters', () => {
    const answer = {
      features: [feature({ name: 'Gare\u202e Saint-Charles\u0007', city: 'Marseille' })],
    };
    expect(readPhotonAddress(answer)).toBe('Gare Saint-Charles, Marseille');
  });

  test('nothing usable: no address', () => {
    expect(readPhotonAddress({ features: [] })).toBeUndefined();
    expect(readPhotonAddress({ features: [feature({ postcode: '13002' })] })).toBeUndefined();
    expect(readPhotonAddress('<html>')).toBeUndefined();
  });
});

describe('readPhotonResults (spec 001)', () => {
  test('drops control and direction characters from names and details (spec 029)', () => {
    const [result] = readPhotonResults({
      features: [
        feature({
          name: 'Pharmacie\u202e du Port',
          street: 'Quai\u0000 du Port',
          city: 'Marseille',
        }),
      ],
    });
    expect(result?.name).toBe('Pharmacie du Port');
    expect(result?.detail).toBe('Quai du Port, Marseille');
  });

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
