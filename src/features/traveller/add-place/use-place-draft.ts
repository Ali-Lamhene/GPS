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
    /** Saves the place, selects it for its end of the trip and returns to the home trail. */
    finish: (photo?: string) => {
      dispatch({ type: 'finishPlace', photo });
      playCue('saved');
      router.dismissTo('/');
    },
  };
}
