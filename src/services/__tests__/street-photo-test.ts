import { findStreetPhoto } from '../street-photo';

const PLACE = [5.37, 43.296] as const;
const SEARCH = {
  features: [
    {
      geometry: { type: 'Point', coordinates: [5.36975, 43.296] },
      properties: {
        'view:azimuth': 90,
        license: 'etalab-2.0',
        'pers:interior_orientation': { field_of_view: 70 },
      },
      assets: { sd: { href: 'https://panoramax.ign.fr/api/pictures/abc/sd.jpg' } },
    },
  ],
};

function answer(body: string | Uint8Array, url: string, type = 'application/json') {
  return {
    ok: true,
    url,
    headers: { get: (name: string) => (name === 'content-type' ? type : null) },
    text: async () => String(body),
    arrayBuffer: async () => (body instanceof Uint8Array ? body.buffer : new ArrayBuffer(0)),
  };
}

describe('findStreetPhoto (spec 030)', () => {
  afterEach(() => jest.restoreAllMocks());

  test('downloads the picture once, from a declared storage, as a data: address', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        answer(JSON.stringify(SEARCH), 'https://api.panoramax.xyz/api/search') as never,
      )
      .mockResolvedValueOnce(
        answer(
          new Uint8Array([255, 216, 255]),
          'https://panoramax-storage-public-fast.s3.gra.perf.cloud.ovh.net/derivates/abc/sd.jpg',
          'image/jpeg',
        ) as never,
      );

    const photo = await findStreetPhoto(PLACE, new AbortController().signal);

    expect(photo?.url).toBe('data:image/jpeg;base64,/9j/');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { 'Cache-Control': 'no-store' },
    });
  });

  test('a picture redirected to an undeclared host is thrown away', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        answer(JSON.stringify(SEARCH), 'https://api.panoramax.xyz/api/search') as never,
      )
      .mockResolvedValueOnce(
        answer(
          new Uint8Array([255, 216, 255]),
          'https://evil.example/sd.jpg',
          'image/jpeg',
        ) as never,
      );

    expect(await findStreetPhoto(PLACE, new AbortController().signal)).toBeUndefined();
  });

  test('no network: no photo', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    expect(await findStreetPhoto(PLACE, new AbortController().signal)).toBeUndefined();
  });
});
