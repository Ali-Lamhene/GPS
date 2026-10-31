// Photos bundled with the app, used as recognition aids (never required).
export const PHOTO_IDS = [
  'busStop',
  'busExit',
  'busInterior',
  'metroEntrance',
  'metroPlatform',
  'metroInteriorBlue',
  'metroInteriorYellow',
  'tramStop',
] as const;

export type PhotoId = (typeof PHOTO_IDS)[number];
