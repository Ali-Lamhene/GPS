import type { Place } from '../place';
import { decodePlaces, encodePlaces, MAX_STORED_PLACES_CHARS } from '../stored-places';

const hospital: Place = {
  id: 'p1',
  icon: 'local_hospital',
  point: [5.38, 43.29],
  helpName: "l'hôpital Nord",
  hiddenOnMap: false,
  createdAt: 2000,
};
const home: Place = {
  id: 'p2',
  icon: 'home',
  point: [5.37, 43.28],
  hiddenOnMap: true,
  createdAt: 1000,
};

const file = (places: unknown[], version: unknown = 1) => JSON.stringify({ version, places });
const read = (text: string) => {
  const decoded = decodePlaces(text);
  return decoded.ok ? decoded.places : [];
};

describe('stored places (spec 015)', () => {
  test('read back as written, oldest first', () => {
    expect(read(encodePlaces([hospital, home]))).toEqual([home, hospital]);
  });

  test('never keep a photo: photos come with their own spec', () => {
    const text = encodePlaces([{ ...hospital, photo: 'file:///photo.jpg' }]);

    expect(text).not.toContain('photo');
    expect(read(text)[0]?.photo).toBeUndefined();
  });

  test('a damaged file, or one of another version, is reported, never trusted', () => {
    expect(decodePlaces('{"version":1,"places":[')).toEqual({ ok: false });
    expect(decodePlaces('null')).toEqual({ ok: false });
    expect(decodePlaces(file([hospital], 2))).toEqual({ ok: false });
    expect(decodePlaces(JSON.stringify({ version: 1, places: {} }))).toEqual({ ok: false });
  });

  test('a damaged entry is skipped, the others are kept', () => {
    const text = file([
      hospital,
      { ...home, id: 'p3', point: [200, 43] },
      { ...home, id: 'p4', point: [5, 'north'] },
      { ...home, id: '../etc', createdAt: 5 },
      { ...home, id: 'p5', createdAt: -1 },
      { ...home, id: 'p6', helpName: 'x'.repeat(201) },
      { ...home, id: 'p7', hiddenOnMap: 'yes' },
      { ...home, id: 'p8', icon: 12 },
      'not a place',
      home,
    ]);

    expect(read(text).map((place) => place.id)).toEqual(['p2', 'p1']);
  });

  test('a pictogram from a newer version becomes « autre lieu »', () => {
    expect(read(file([{ ...hospital, icon: 'rocket_launch' }]))[0]?.icon).toBe('push_pin');
  });

  test('the same id twice keeps the first one', () => {
    expect(read(file([hospital, { ...hospital, icon: 'school' }]))).toEqual([hospital]);
  });

  test('a file too large is not read', () => {
    expect(decodePlaces(' '.repeat(MAX_STORED_PLACES_CHARS + 1))).toEqual({ ok: false });
  });
});
