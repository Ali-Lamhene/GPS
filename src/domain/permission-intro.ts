/**
 * When the screen that explains a permission shows, before the system window (spec 038).
 * - ask: Android can still open its window, the screen prepares it;
 * - settings: Android no longer asks, the settings are the only way left.
 * Nothing is stored: the state comes from the permission itself.
 */
export type IntroMode = 'ask' | 'settings';

/** The position as the app reads it (see `LocationAccess` in `services/location`). */
export type PositionState = 'granted' | 'coarse' | 'denied' | 'blocked';

/**
 * At the start: only a position that is not given and can still be asked for. A refusal for
 * good, or an approximate position, keep « here » crossed out until the traveller touches it.
 */
export function introAtStart(state: PositionState): IntroMode | undefined {
  return state === 'denied' ? 'ask' : undefined;
}

/** A touch on « here » crossed out: the screen again, for the right way out. */
export function introOnRetry(state: PositionState): IntroMode | undefined {
  if (state === 'granted') return undefined;
  return state === 'blocked' ? 'settings' : 'ask';
}

/** The camera, from what the system says of its permission. */
export function introForCamera(granted: boolean, canAskAgain: boolean): IntroMode | undefined {
  if (granted) return undefined;
  return canAskAgain ? 'ask' : 'settings';
}
