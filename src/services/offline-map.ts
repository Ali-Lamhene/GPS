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
