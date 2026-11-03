import { Asset } from 'expo-asset';
import { PMTiles, Protocol, type RangeResponse, type Source } from 'pmtiles';

import ARCHIVE from '../../assets/map/marseille.pmtiles';

// Map tiles of the demo zone, bundled with the app (spec 002). The whole archive is read
// once from the app's own assets and served from memory: no tile server, nothing leaves
// the phone (D1).

const ARCHIVE_KEY = 'marseille';
/** Style URL of the bundled tiles. */
export const BUNDLED_TILES_URL = `pmtiles://${ARCHIVE_KEY}`;

class MemorySource implements Source {
  constructor(
    private readonly key: string,
    private readonly data: ArrayBuffer,
  ) {}

  getKey(): string {
    return this.key;
  }

  async getBytes(offset: number, length: number): Promise<RangeResponse> {
    return { data: this.data.slice(offset, offset + length) };
  }
}

async function loadArchive(): Promise<PMTiles> {
  const asset = Asset.fromModule(ARCHIVE);
  await asset.downloadAsync();
  const response = await fetch(asset.localUri ?? asset.uri);
  if (!response.ok) throw new Error(`Map archive unavailable (${response.status})`);
  return new PMTiles(new MemorySource(ARCHIVE_KEY, await response.arrayBuffer()));
}

type TileHandler = Protocol['tilev4'];

/**
 * Serves only the bundled archive. pmtiles' own protocol would fetch any other
 * "pmtiles://host/…" URL from the network; this one refuses it.
 */
export function onlyBundledTiles(tile: TileHandler): TileHandler {
  return (params, abortController) => {
    const url = params.url;
    if (url !== BUNDLED_TILES_URL && !url.startsWith(`${BUNDLED_TILES_URL}/`)) {
      return Promise.reject(new Error('Only the bundled map archive is served'));
    }
    return tile(params, abortController);
  };
}

let registered: Promise<void> | undefined;

/** Loads the archive once and registers the "pmtiles" protocol with the map library. */
export function registerOfflineTiles(
  addProtocol: (name: string, handler: TileHandler) => void,
): Promise<void> {
  registered ??= loadArchive().then((archive) => {
    const protocol = new Protocol();
    protocol.add(archive);
    addProtocol('pmtiles', onlyBundledTiles(protocol.tilev4));
  });
  return registered;
}

/**
 * Style URL of the archive for the phone's map (MapLibre Native reads it in place): only a
 * file already in the app's own storage. In a development build the asset's address is
 * the dev server (http): reading tiles from there would show the host which area the
 * traveller looks at, so it is refused (security review of the native map).
 */
export function localTilesUrl(localUri: string | null | undefined): string | null {
  if (!localUri?.startsWith('file:///')) return null;
  return `pmtiles://${localUri}`;
}

let localUrl: Promise<string | null> | undefined;

/** Copies the bundled archive into the app's storage once, then gives its style URL. */
export function loadLocalTilesUrl(): Promise<string | null> {
  // Unreadable archive (fromModule throws): plain ground, routes and markers still drawn.
  localUrl ??= Promise.resolve()
    .then(() => Asset.fromModule(ARCHIVE).downloadAsync())
    .then(
      (asset) => localTilesUrl(asset.localUri),
      () => null,
    );
  return localUrl;
}
