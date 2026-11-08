import type { IconName } from '@/ui/icon/glyphs';

/**
 * « Here » while the position is not usable (spec 017): still searching (the pin with a person, greyed),
 * or unavailable (the person crossed out: « me » not found, spec 027). Undefined: ready. Either way a touch asks again.
 */
export type HereUnavailable = 'searching' | 'off';

/** The pictogram of « here », or of « + » which keeps the place where the traveller is. */
export function hereIcon<Ready extends IconName>(
  state: HereUnavailable | undefined,
  ready: Ready,
): Ready | 'person_off' | 'person_pin_circle' {
  if (state === 'off') return 'person_off';
  if (state === 'searching') return 'person_pin_circle';
  return ready;
}
