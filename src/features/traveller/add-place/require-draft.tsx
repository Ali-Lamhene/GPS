import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useTripPlan } from '../trip-plan/trip-plan-context';
import type { PlaceDraft } from '../trip-plan/trip-plan-reducer';

type RequireDraftProps = {
  /** Only a draft started this way opens the screen: the address form needs the hold. */
  source?: PlaceDraft['source'];
  children: ReactNode;
};

/**
 * The new place screens (E27-E30) only open from the home « + » (spec 007). A link such as
 * `gps://add-place/address` would otherwise skip the 3 second hold and show the companion's
 * text to the traveller (D8, docs/engineering/securite.md): without a draft, back home.
 */
export function RequireDraft({ source, children }: RequireDraftProps) {
  const { draft } = useTripPlan();
  if (!draft || (source !== undefined && draft.source !== source)) return <Redirect href="/" />;
  return children;
}
