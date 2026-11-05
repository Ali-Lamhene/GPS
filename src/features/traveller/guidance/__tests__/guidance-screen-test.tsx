import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Vibration } from 'react-native';

import { renderWithProviders } from '@/testing/render-with-providers';
import type { TripPlanAction } from '@/features/traveller/trip-plan/trip-plan-reducer';

import { DEMO_GUIDANCE } from '@/testing/fixtures/guidance';
import { GuidanceScreen } from '../guidance-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  // The screen in front: its focus effect runs once mounted.
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));

function startedAt(index: number, mode: 'walk' | 'transit' = 'transit'): TripPlanAction[] {
  return [
    { type: 'chooseOrigin', placeId: 'home' },
    { type: 'chooseDestination', placeId: 'beach' },
    { type: 'chooseMode', mode },
    { type: 'goToStep', index },
  ];
}

const next = { name: 'Étape suivante' };

describe('<GuidanceScreen />', () => {
  beforeAll(() => jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined));
  beforeEach(() => jest.clearAllMocks());

  test('touching the card goes to the next step, with its cue', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0));

    await fireEvent.press(screen.getByRole('button', next));

    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 80, 60, 80]);
  });

  test('waiting for the bus shows the line and its direction, which can be heard', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(4));

    expect(screen.getByText('41')).toBeOnTheScreen();
    expect(screen.getByText('Vieux Port Ballard')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Écouter le nom' })).toBeOnTheScreen();
  });

  test('without network in the metro, the traveller confirms getting off', async () => {
    const offline = DEMO_GUIDANCE.transit.findIndex((step) => step.offline);
    await renderWithProviders(<GuidanceScreen />, startedAt(offline));

    expect(screen.getByText('Saint-Charles')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Je suis descendu' }));

    expect(screen.queryByRole('button', { name: 'Je suis descendu' })).toBeNull();
    expect(screen.getByRole('button', next)).toBeOnTheScreen();
  });

  test('after the last step, the traveller has arrived', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(DEMO_GUIDANCE.walk.length - 1, 'walk'));

    await fireEvent.press(screen.getByRole('button', next));

    expect(router.replace).toHaveBeenCalledWith('/arrived');
  });

  test('help is in the bottom panel', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0));

    await fireEvent.press(screen.getByRole('button', { name: 'Aide' }));

    expect(router.push).toHaveBeenCalledWith('/help');
  });
});
