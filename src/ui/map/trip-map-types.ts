import type { LngLat } from '@/domain/geo';
import type { IconName } from '@/ui/icon/icon';

export type MapLine = {
  path: readonly LngLat[];
  color: string;
  /** Walking is dotted, vehicles are solid with a dark border, the walked part is grey. */
  style: 'walk' | 'vehicle' | 'done';
};

/** Where to get on or off a vehicle: its pictogram, or the metro "M", in the line colour. */
export type MapStop = {
  point: LngLat;
  color: string;
  symbol: IconName | 'metro';
};

export type TripMapProps = {
  /**
   * Where the map looks; it follows these values unless the traveller moves the map.
   * With `bounds`, the map frames that box (north up, flat) instead of the centre.
   */
  camera: {
    center: LngLat;
    zoom: number;
    bounds?: [LngLat, LngLat];
    heading?: number;
    pitch?: number;
    /** Room taken by content floating over the map, so the centre stays visible. */
    padding?: { top: number; bottom: number };
  };
  lines?: readonly MapLine[];
  stops?: readonly MapStop[];
  /** Arrow drawn at the next corner, pointing the way to turn. */
  maneuver?: { point: LngLat; heading: number };
  traveller?: { point: LngLat; heading?: number };
  destination?: { point: LngLat; icon: IconName };
  /** Background only (home): softened and without gestures. */
  backdrop?: boolean;
  /** False keeps the map still, under content pinned to its centre (new place). */
  interactive?: boolean;
  /** Distance from the bottom of the map to its controls. */
  controlsBottom?: number;
};
