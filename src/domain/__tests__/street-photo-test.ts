import { readStreetPhoto } from '../street-photo';

const HOSTS = ['panoramax.ign.fr'];
const PLACE = [5.37, 43.296] as const;

/** A picture 20 m west of the place, looking `azimuth`. */
const picture = (azimuth: number, extra: Record<string, unknown> = {}, href?: string) => ({
  geometry: { type: 'Point', coordinates: [5.36975, 43.296] },
  properties: {
    'view:azimuth': azimuth,
    license: 'etalab-2.0',
    'pers:interior_orientation': { field_of_view: 70 },
    ...extra,
  },
  assets: { sd: { href: href ?? 'https://panoramax.ign.fr/api/pictures/abc/sd.jpg' } },
});

describe('readStreetPhoto (spec 030)', () => {
  test('a flat picture looking at the place, centred on it', () => {
    const photo = readStreetPhoto({ features: [picture(90)] }, PLACE, HOSTS);
    expect(photo).toMatchObject({
      panorama: false,
      url: 'https://panoramax.ign.fr/api/pictures/abc/sd.jpg',
    });
    expect(photo?.centre).toBeCloseTo(0.5, 1);
  });

  test('a flat picture looking away is skipped for the next one', () => {
    const photo = readStreetPhoto({ features: [picture(270), picture(80)] }, PLACE, HOSTS);
    expect(photo?.centre).toBeGreaterThan(0.5);
  });

  test('the nearest picture wins, whatever the order of the answer (field feedback)', () => {
    const far = {
      ...picture(90, {}, 'https://panoramax.ign.fr/api/pictures/far/sd.jpg'),
      geometry: { type: 'Point', coordinates: [5.3696, 43.296] },
    };
    const near = picture(90, {}, 'https://panoramax.ign.fr/api/pictures/near/sd.jpg');
    const photo = readStreetPhoto({ features: [far, near] }, PLACE, HOSTS);
    expect(photo?.url).toBe('https://panoramax.ign.fr/api/pictures/near/sd.jpg');
  });

  test('a panorama shows the slice facing the place', () => {
    const photo = readStreetPhoto(
      { features: [picture(0, { 'pers:interior_orientation': { field_of_view: 360 } })] },
      PLACE,
      HOSTS,
    );
    // The place lies a quarter turn right of where the camera looked.
    expect(photo?.panorama).toBe(true);
    expect(photo?.centre).toBeCloseTo(0.75, 1);
  });

  test('another host, plain HTTP, another licence or a damaged entry: nothing', () => {
    const answers = [
      picture(90, {}, 'https://evil.example/sd.jpg'),
      picture(90, {}, 'http://panoramax.ign.fr/api/pictures/abc/sd.jpg'),
      picture(90, {}, 'https://user:pw@panoramax.ign.fr/api/pictures/abc/sd.jpg'),
      picture(90, { license: 'proprietary' }),
      picture(Number.NaN),
      { properties: {} },
      'x',
    ];
    for (const answer of answers) {
      expect(readStreetPhoto({ features: [answer] }, PLACE, HOSTS)).toBeUndefined();
    }
    expect(readStreetPhoto('<html>', PLACE, HOSTS)).toBeUndefined();
  });
});
