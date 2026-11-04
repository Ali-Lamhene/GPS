import type { IconName } from '@/ui/icon/glyphs';

/**
 * « Here » while the position is not usable (spec 017): still searching (the target, greyed),
 * or unavailable (the target crossed out). Undefined: ready. Either way a touch asks again.
 */
export type HereUnavailable = 'searching' | 'off';

/** The pictogram of « here », or of « + » which keeps the place where the traveller is. */
export function hereIcon<Ready extends IconName>(
  state: HereUnavailable | undefined,
  ready: Ready,
): Ready | 'location_disabled' | 'my_location' {
  if (state === 'off') return 'location_disabled';
  if (state === 'searching') return 'my_location';
  return ready;
}
