import { placesOnMap } from '@/domain/place';
import {
  initialTripPlan,
  placeFromDraft,
  placeFromEdit,
  tripPlanReducer,
  type TripPlanState,
} from '../trip-plan-reducer';

/** What the new place screens do once the place is saved (spec 015). */
function finish(state: TripPlanState, photo?: string): TripPlanState {
  if (!state.draft) return state;
  const place = placeFromDraft(state.draft, { id: 'p1', createdAt: 1000, photo });
  return tripPlanReducer(state, { type: 'addPlace', place });
}

const withOrigin: TripPlanState = { ...initialTripPlan, originId: 'home' };

describe('tripPlanReducer', () => {
  test('choosing the origin keeps a different destination and drops the same one', () => {
    const state = { ...withOrigin, destinationId: 'beach' };

    expect(tripPlanReducer(state, { type: 'chooseOrigin', placeId: 'work' })).toMatchObject({
      originId: 'work',
      destinationId: 'beach',
    });
    expect(tripPlanReducer(state, { type: 'chooseOrigin', placeId: 'beach' })).toMatchObject({
      originId: 'beach',
      destinationId: undefined,
    });
  });

  test('the destination cannot be the origin', () => {
    expect(tripPlanReducer(withOrigin, { type: 'chooseDestination', placeId: 'home' })).toBe(
      withOrigin,
    );
    expect(
      tripPlanReducer(withOrigin, { type: 'chooseDestination', placeId: 'beach' }).destinationId,
    ).toBe('beach');
  });

  test('a new place is drafted, then only kept: the trip does not change', () => {
    let state = tripPlanReducer(withOrigin, {
      type: 'startPlace',
      source: 'position',
    });
    state = tripPlanReducer(state, { type: 'setDraftIcon', icon: 'local_hospital' });
    state = finish(state, 'file:///photo.jpg');

    expect(state.customPlaces).toEqual([
      {
        id: 'p1',
        icon: 'local_hospital',
        photo: 'file:///photo.jpg',
        helpName: undefined,
        point: undefined,
        createdAt: 1000,
      },
    ]);
    expect(state.originId).toBe('home');
    expect(state.destinationId).toBeUndefined();
    expect(state.draft).toBeUndefined();
  });

  test('a place drafted from an address keeps its name for the help card', () => {
    let state = tripPlanReducer(initialTripPlan, {
      type: 'startPlace',
      source: 'address',
    });
    state = tripPlanReducer(state, { type: 'setDraftName', helpName: 'Pharmacie du Port' });
    state = finish(state);

    expect(state.customPlaces[0]).toMatchObject({
      icon: 'push_pin',
      helpName: 'Pharmacie du Port',
    });
    expect(state.originId).toBeUndefined();
  });

  test('draft edits without a draft change nothing', () => {
    expect(tripPlanReducer(withOrigin, { type: 'setDraftIcon', icon: 'home' })).toBe(withOrigin);
    expect(finish(withOrigin)).toBe(withOrigin);
  });

  test('the arrival can be cleared, the start stays', () => {
    const state = { ...withOrigin, destinationId: 'beach' };

    expect(tripPlanReducer(state, { type: 'clearDestination' })).toMatchObject({
      originId: 'home',
      destinationId: undefined,
    });
  });

  test('a new trip starts with nothing chosen, not even the start', () => {
    expect(initialTripPlan.originId).toBeUndefined();
    expect(initialTripPlan.destinationId).toBeUndefined();
  });

  test('a new home or family place is a place like the others, with its pin', () => {
    let state = tripPlanReducer(withOrigin, {
      type: 'startPlace',
      source: 'address',
    });
    state = tripPlanReducer(state, { type: 'setDraftIcon', icon: 'family_home' });
    state = finish(state);

    expect(state.customPlaces[0]).not.toHaveProperty('hiddenOnMap');
    expect(
      placesOnMap(state.customPlaces.map((place) => ({ ...place, point: [5, 43] }))),
    ).toHaveLength(1);
  });

  test('a place that cannot be saved is dropped, and the home is told (spec 015)', () => {
    let state = tripPlanReducer(withOrigin, { type: 'startPlace', source: 'position' });
    state = tripPlanReducer(state, { type: 'placeSaveFailed' });

    expect(state.draft).toBeUndefined();
    expect(state.customPlaces).toEqual([]);
    expect(state.saveFailed).toBe(true);
    expect(tripPlanReducer(state, { type: 'clearSaveFailed' }).saveFailed).toBeUndefined();
  });

  test('the guidance step is remembered, so help knows where the traveller is', () => {
    expect(tripPlanReducer(withOrigin, { type: 'goToStep', index: 3 }).guidanceStep).toBe(3);
  });

  test('reset starts a new trip but keeps the created places', () => {
    const state: TripPlanState = {
      originId: 'home',
      destinationId: 'beach',
      mode: 'walk',
      customPlaces: [{ id: 'custom-1', icon: 'home' }],
      guidanceStep: 4,
    };

    expect(tripPlanReducer(state, { type: 'reset' })).toEqual({
      mode: 'transit',
      customPlaces: [{ id: 'custom-1', icon: 'home' }],
    });
  });
});

describe('changing a saved place (spec 037)', () => {
  const school = {
    id: 'p-school',
    icon: 'school',
    photo: 'file:///a.jpg',
    point: [5.38, 43.3],
  } as const;
  const chosen: TripPlanState = {
    ...initialTripPlan,
    customPlaces: [{ ...school }],
    originId: 'here',
    destinationId: 'p-school',
  };

  test('the changed place replaces the old one and keeps the trip as chosen', () => {
    const state = tripPlanReducer(
      tripPlanReducer(chosen, { type: 'startEdit', place: { ...school } }),
      { type: 'updatePlace', place: { ...school, icon: 'park' } },
    );

    expect(state.customPlaces).toEqual([{ ...school, icon: 'park' }]);
    expect(state.destinationId).toBe('p-school');
    expect(state.draft).toBeUndefined();
  });

  test('placeFromEdit changes only the pictogram and the photo', () => {
    const draft = { source: 'edit', editing: { ...school }, icon: 'park' } as const;

    expect(placeFromEdit({ ...school }, draft, 'file:///b.jpg')).toEqual({
      ...school,
      icon: 'park',
      photo: 'file:///b.jpg',
    });
    expect(placeFromEdit({ ...school }, draft)).not.toHaveProperty('photo');
  });
});
