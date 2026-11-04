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
  /** Where to get off: ringed in the alert orange, like the exit station of E21. */
  alight?: boolean;
};

/** A saved place the traveller can touch on the map to go there (spec 005). */
export type MapPin = {
  id: string;
  point: LngLat;
  icon: IconName;
  /** Read by screen readers only (the place's French help name). */
  label: string;
  /** The traveller's own photo of the place: a local file, never a web address. */
  photo?: string;
  /** The place chosen as arrival: larger, edged in blue, drawn above the others. */
  selected?: boolean;
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
    padding?: { top: number; bottom: number; left?: number; right?: number };
  };
  lines?: readonly MapLine[];
  stops?: readonly MapStop[];
  /** Arrow drawn at the next corner, pointing the way to turn. */
  maneuver?: { point: LngLat; heading: number };
  traveller?: { point: LngLat; heading?: number };
  /** Start of the trip when it is a saved place rather than where the traveller stands. */
  origin?: { point: LngLat; icon: IconName };
  destination?: { point: LngLat; icon: IconName };
  /** Saved places, drawn as pins the traveller can touch. */
  pins?: readonly MapPin[];
  onPinPress?: (id: string) => void;
  /** Background only (home): softened and without gestures. */
  backdrop?: boolean;
  /** False keeps the map still, under content pinned to its centre (new place). */
  interactive?: boolean;
  /** Distance from the bottom of the map to its controls. */
  controlsBottom?: number;
  /** Distance from the bottom to the recenter button, when it must clear other buttons. */
  recenterBottom?: number;
  /** Distance from the right to the recenter button, to line it up with a column of buttons. */
  recenterRight?: number;
  /** Pictogram of the button that brings the map back: the traveller, or the whole trip. */
  recenterIcon?: IconName;
};

/** Side of the round recenter button of the map. */
export const RECENTER_SIZE = 40;
