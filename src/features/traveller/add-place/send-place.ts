import { Share } from 'react-native';

import { isCataloguePictogram } from '@/domain/pictograms';
import { encodeShareLink } from '@/domain/share-link';

import type { PlaceDraft } from '../trip-plan/trip-plan-reducer';

/**
 * Companion's phone (spec 019): opens the share sheet with the place's link. Nothing is kept
 * on this phone; the link carries only the point and the pictogram (spec 001).
 */
export async function sendPlace(draft: PlaceDraft): Promise<boolean> {
  const { point, icon } = draft;
  if (!point || !icon || !isCataloguePictogram(icon)) return false;
  try {
    const result = await Share.share({ message: encodeShareLink({ point, icon }) });
    // Closed without sending: the companion stays on the pictogram, the draft kept.
    return result.action !== Share.dismissedAction;
  } catch {
    return false;
  }
}
