import { router } from 'expo-router';

import { useTripPlan } from '../trip-plan/trip-plan-context';

/** Ends the current trip and goes back to the home trail. */
export function useGoHome(): () => void {
  const { dispatch } = useTripPlan();
  return () => {
    dispatch({ type: 'reset' });
    router.dismissTo('/');
  };
}
