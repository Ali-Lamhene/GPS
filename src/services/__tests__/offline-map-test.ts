import { BUNDLED_TILES_URL, onlyBundledTiles } from '../offline-map';

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
