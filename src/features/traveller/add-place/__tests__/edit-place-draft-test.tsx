import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import type { Place } from '@/domain/place';
import { reverseAddress } from '@/services/address-search';
import { playCue } from '@/services/feedback';
import { deletePhoto } from '@/services/photo';
import { writePlacesFile } from '@/services/place-storage';

import { TripPlanProvider, useTripPlan } from '../../trip-plan/trip-plan-context';
import type { TripPlanAction } from '../../trip-plan/trip-plan-reducer';
import { usePlaceDraft } from '../use-place-draft';

jest.mock('expo-router', () => ({ router: { dismissTo: jest.fn() } }));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
jest.mock('@/services/place-storage', () => ({ writePlacesFile: jest.fn() }));
jest.mock('@/services/address-search', () => ({ reverseAddress: jest.fn() }));

const school: Place = {
  id: 'p-school',
  icon: 'school',
  photo: 'file:///old.jpg',
  helpName: 'le lycée',
  address: '1 rue du Lycée, Marseille',
  point: [5.38, 43.3],
  createdAt: 5,
};
const other: Place = { id: 'p-work', icon: 'work', createdAt: 1 };

function renderEdit(actions: TripPlanAction[], places: Place[] = [other, school]) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TripPlanProvider places={places} initialActions={actions}>
      {children}
    </TripPlanProvider>
  );
  return renderHook(() => ({ draft: usePlaceDraft(), plan: useTripPlan() }), { wrapper });
}

const placeIn = (places: readonly Place[]) => places.find((place) => place.id === school.id);

describe('changing a saved place (spec 037)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
  });

  test('the draft starts from the place: its pictogram, point and address', async () => {
    const { result } = await renderEdit([{ type: 'startEdit', place: school }]);

    expect(result.current.plan.draft).toMatchObject({
      source: 'edit',
      editing: school,
      icon: 'school',
      point: school.point,
      address: school.address,
    });
  });

  test('a new pictogram, the photo kept: same place, nothing deleted', async () => {
    const { result } = await renderEdit([
      { type: 'startEdit', place: school },
      { type: 'setDraftIcon', icon: 'local_hospital' },
    ]);

    await act(() => result.current.draft.finish(school.photo));

    expect(placeIn(result.current.plan.customPlaces)).toEqual({
      ...school,
      icon: 'local_hospital',
    });
    // Replaced, not added: still two places, in the same order.
    expect(result.current.plan.customPlaces.map((place) => place.id)).toEqual([
      'p-work',
      'p-school',
    ]);
    expect(writePlacesFile).toHaveBeenCalledTimes(1);
    expect(deletePhoto).not.toHaveBeenCalled();
    expect(reverseAddress).not.toHaveBeenCalled();
    expect(playCue).toHaveBeenCalledWith('saved');
    expect(router.dismissTo).toHaveBeenCalledWith('/');
    expect(result.current.plan.draft).toBeUndefined();
  });

  test('a new photo replaces the old one, deleted once the list is written', async () => {
    const { result } = await renderEdit([{ type: 'startEdit', place: school }]);

    await act(() => result.current.draft.finish('file:///new.jpg'));

    expect(placeIn(result.current.plan.customPlaces)).toEqual({
      ...school,
      photo: 'file:///new.jpg',
    });
    expect(deletePhoto).toHaveBeenCalledWith('file:///old.jpg');
    expect(jest.mocked(writePlacesFile).mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(deletePhoto).mock.invocationCallOrder[0] ?? 0,
    );
  });

  test('without photo: the photo is removed from the place and from the phone', async () => {
    const { result } = await renderEdit([{ type: 'startEdit', place: school }]);

    await act(() => result.current.draft.finish());

    const changed = placeIn(result.current.plan.customPlaces);
    expect(changed).not.toHaveProperty('photo');
    expect(changed).toMatchObject({ id: school.id, icon: 'school', point: school.point });
    expect(deletePhoto).toHaveBeenCalledWith('file:///old.jpg');
  });

  test('a place without photo gets one', async () => {
    const bare: Place = { id: 'p-bare', icon: 'park', point: [5.4, 43.3], createdAt: 2 };
    const { result } = await renderEdit([{ type: 'startEdit', place: bare }], [bare]);

    await act(() => result.current.draft.finish('file:///park.jpg'));

    expect(result.current.plan.customPlaces).toEqual([{ ...bare, photo: 'file:///park.jpg' }]);
    expect(deletePhoto).not.toHaveBeenCalled();
  });

  test('the file cannot be written: the place stays as it was, the old photo too', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: false });
    const { result } = await renderEdit([{ type: 'startEdit', place: school }]);

    let saved = true;
    await act(async () => {
      saved = await result.current.draft.finish('file:///new.jpg');
    });

    expect(saved).toBe(false);
    expect(placeIn(result.current.plan.customPlaces)).toEqual(school);
    expect(deletePhoto).not.toHaveBeenCalled();
    expect(result.current.plan.saveFailed).toBe(true);
    expect(playCue).not.toHaveBeenCalled();
  });
});
