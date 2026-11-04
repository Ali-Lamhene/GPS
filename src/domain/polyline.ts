import type { LngLat } from './geo';

/**
 * Decodes a Google encoded polyline (the shape of a leg in a route answer), at the given
 * precision (5, 6 or 7 decimals). A damaged string gives the points read so far.
 */
export function decodePolyline(encoded: string, precision: number): LngLat[] {
  const factor = 10 ** precision;
  const points: LngLat[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const next = (): number | undefined => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      if (index >= encoded.length) return undefined;
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && shift < 35);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    const dLat = next();
    const dLng = next();
    if (dLat === undefined || dLng === undefined) break;
    lat += dLat;
    lng += dLng;
    points.push([lng / factor, lat / factor]);
  }
  return points;
}
