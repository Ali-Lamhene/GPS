import { router } from 'expo-router';

import { playCue } from '@/services/feedback';

import { useTripPlan } from '../trip-plan/trip-plan-context';

/** Actions shared by the new place screens (E27-E30). */
export function usePlaceDraft() {
  const { draft, dispatch } = useTripPlan();
  return {
    draft,
    cancel: () => {
      dispatch({ type: 'cancelPlace' });
      router.dismissTo('/');
    },
    /** Saves the place and returns home; the trip does not change (spec 007). */
    finish: (photo?: string) => {
      dispatch({ type: 'finishPlace', photo });
      playCue('saved');
      router.dismissTo('/');
    },
  };
}
