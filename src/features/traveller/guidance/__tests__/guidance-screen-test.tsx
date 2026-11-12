import { act, fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Vibration } from 'react-native';

import { renderWithProviders, ROUTES } from '@/testing/render-with-providers';
import type { TripPlanAction } from '@/features/traveller/trip-plan/trip-plan-reducer';

import { DEMO_GUIDANCE } from '@/testing/fixtures/guidance';
import { GuidanceScreen } from '../guidance-screen';
import { STALE_POINT_MS } from '../use-fresh-point';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  // The screen in front: its focus effect runs once mounted.
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
  useIsFocused: () => true,
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
const noPosition = { kind: 'searching' } as const;

describe('<GuidanceScreen />', () => {
  beforeAll(() => jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined));
  beforeEach(() => jest.clearAllMocks());

  test('without a position, touching the card goes to the next step, with its cue', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0), noPosition);

    await fireEvent.press(screen.getByRole('button', next));

    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 80, 60, 80]);
  });

  test('with a position, touching the card does not change the step', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0));

    expect(screen.queryByRole('button', next)).toBeNull();
    expect(screen.queryByTestId('instruction-touch-hint')).toBeNull();
  });

  test('without a recent position, the hand shows the card can be touched (spec 031)', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0), noPosition);

    expect(screen.getByTestId('instruction-touch-hint')).toBeOnTheScreen();
  });

  test('a point that stops coming counts as lost: the card moves on again', async () => {
    jest.useFakeTimers();
    try {
      await renderWithProviders(<GuidanceScreen />, startedAt(0));
      await act(() => jest.advanceTimersByTime(STALE_POINT_MS));

      expect(screen.getByRole('button', next)).toBeOnTheScreen();
    } finally {
      jest.useRealTimers();
    }
  });

  test('waiting for the bus shows the line and its direction, which can be heard', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(4));

    expect(screen.getByText('41')).toBeOnTheScreen();
    expect(screen.getByText('Vieux Port Ballard')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Écouter le nom' })).toBeOnTheScreen();
  });

  test('without network in the metro, the traveller confirms getting off', async () => {
    const offline = DEMO_GUIDANCE.transit.findIndex((step) => step.offline);
    await renderWithProviders(<GuidanceScreen />, startedAt(offline), noPosition);

    expect(screen.getByText('Saint-Charles')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Je suis descendu' }));

    expect(screen.queryByRole('button', { name: 'Je suis descendu' })).toBeNull();
    expect(screen.getByRole('button', next)).toBeOnTheScreen();
  });

  test('after the last step, the traveller has arrived', async () => {
    await renderWithProviders(
      <GuidanceScreen />,
      startedAt(DEMO_GUIDANCE.walk.length - 1, 'walk'),
      noPosition,
    );

    await fireEvent.press(screen.getByRole('button', next));

    expect(router.replace).toHaveBeenCalledWith('/arrived');
  });

  test('the bottom way shows the start and arrival places, not generic marks (spec 027)', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0));

    expect(screen.getByLabelText('Départ')).toBeOnTheScreen();
    expect(screen.getByLabelText('Arrivée')).toBeOnTheScreen();
  });

  test('on the last walk, the street photo of the arrival shows (spec 030)', async () => {
    const photo = {
      url: 'https://panoramax.ign.fr/api/pictures/a/sd.jpg',
      panorama: false,
      centre: 0.5,
    };
    const last = DEMO_GUIDANCE.walk.length - 1;
    await renderWithProviders(<GuidanceScreen />, startedAt(last, 'walk'), noPosition, {
      ...ROUTES,
      streetPhoto: photo,
    });
    expect(screen.getByTestId('arrival-street-photo')).toBeOnTheScreen();
  });

  test('before the last walk, no street photo', async () => {
    const photo = {
      url: 'https://panoramax.ign.fr/api/pictures/a/sd.jpg',
      panorama: false,
      centre: 0.5,
    };
    await renderWithProviders(<GuidanceScreen />, startedAt(0, 'walk'), noPosition, {
      ...ROUTES,
      streetPhoto: photo,
    });
    expect(screen.queryByTestId('arrival-street-photo')).toBeNull();
  });

  test('help is in the bottom panel', async () => {
    await renderWithProviders(<GuidanceScreen />, startedAt(0));

    await fireEvent.press(screen.getByRole('button', { name: 'Aide' }));

    expect(router.push).toHaveBeenCalledWith('/help');
  });
});
