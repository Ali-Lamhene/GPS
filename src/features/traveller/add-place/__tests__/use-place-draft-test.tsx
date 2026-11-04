import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { decodePlaces } from '@/domain/stored-places';
import { playCue } from '@/services/feedback';
import { writePlacesFile } from '@/services/place-storage';

import { TripPlanProvider, useTripPlan } from '../../trip-plan/trip-plan-context';
import { usePlaceDraft } from '../use-place-draft';

jest.mock('expo-router', () => ({ router: { dismissTo: jest.fn() } }));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
jest.mock('@/services/place-storage', () => ({ writePlacesFile: jest.fn() }));

const saved = { id: 'p0', icon: 'school', createdAt: 1 } as const;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TripPlanProvider
      places={[saved]}
      initialActions={[
        { type: 'startPlace', source: 'address' },
        { type: 'setDraftIcon', icon: 'local_hospital' },
        { type: 'setDraftName', helpName: "l'hôpital Nord" },
      ]}
    >
      {children}
    </TripPlanProvider>
  );
}

const renderDraft = () =>
  renderHook(() => ({ draft: usePlaceDraft(), plan: useTripPlan() }), { wrapper });

describe('finishing a new place (spec 015)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saves every place on the phone, then keeps it and goes home', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
    const { result } = await renderDraft();

    await act(() => result.current.draft.finish());

    const decoded = decodePlaces(jest.mocked(writePlacesFile).mock.calls[0]?.[0] ?? '');
    const written = decoded.ok ? decoded.places : [];
    expect(written.map((place) => place.icon)).toEqual(['school', 'local_hospital']);
    expect(written[1]).toMatchObject({ helpName: "l'hôpital Nord", id: expect.any(String) });
    expect(result.current.plan.customPlaces.map((place) => place.icon)).toEqual([
      'school',
      'local_hospital',
    ]);
    expect(playCue).toHaveBeenCalledWith('saved');
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('a place that cannot be saved is not kept; the home shows the error', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: false });
    const { result } = await renderDraft();

    await act(() => result.current.draft.finish());

    expect(result.current.plan.customPlaces).toEqual([saved]);
    expect(result.current.plan.saveFailed).toBe(true);
    expect(result.current.plan.draft).toBeUndefined();
    expect(playCue).not.toHaveBeenCalled();
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  test('a second touch while saving does nothing', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
    const { result } = await renderDraft();

    await act(() => Promise.all([result.current.draft.finish(), result.current.draft.finish()]));

    expect(writePlacesFile).toHaveBeenCalledTimes(1);
    expect(result.current.plan.customPlaces).toHaveLength(2);
    expect(result.current.plan.saveFailed).toBeUndefined();
  });
});
