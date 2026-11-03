import { BUNDLED_TILES_URL, localTilesUrl, onlyBundledTiles } from '../offline-map';

jest.mock('expo-asset', () => ({ Asset: { fromModule: jest.fn() } }));

describe('onlyBundledTiles', () => {
  const tile = jest.fn(() => Promise.resolve({ data: new Uint8Array() }));
  const guarded = onlyBundledTiles(tile as never);
  const controller = new AbortController();

  beforeEach(() => tile.mockClear());

  test('serves the bundled archive and its tiles', async () => {
    await guarded({ url: BUNDLED_TILES_URL } as never, controller);
    await guarded({ url: `${BUNDLED_TILES_URL}/15/16917/11916` } as never, controller);

    expect(tile).toHaveBeenCalledTimes(2);
  });

  test('refuses any other archive, so no tile request can leave the phone', async () => {
    await expect(
      guarded({ url: 'pmtiles://https://example.org/map.pmtiles/0/0/0' } as never, controller),
    ).rejects.toThrow('Only the bundled map archive is served');
    await expect(
      guarded({ url: `${BUNDLED_TILES_URL}-other/0/0/0` } as never, controller),
    ).rejects.toThrow();

    expect(tile).not.toHaveBeenCalled();
  });
});

describe('localTilesUrl', () => {
  test('reads the archive from the app storage', () => {
    expect(localTilesUrl('file:///data/user/0/app/cache/marseille.pmtiles')).toBe(
      'pmtiles://file:///data/user/0/app/cache/marseille.pmtiles',
    );
  });

  test('refuses any address that would read tiles over the network', () => {
    expect(localTilesUrl('http://192.168.1.2:8081/assets/marseille.pmtiles')).toBeNull();
    expect(localTilesUrl('https://example.org/marseille.pmtiles')).toBeNull();
    expect(localTilesUrl('pmtiles://https://example.org/x')).toBeNull();
    expect(localTilesUrl(null)).toBeNull();
    expect(localTilesUrl(undefined)).toBeNull();
  });
});
