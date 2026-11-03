import { initialTripPlan, tripPlanReducer, type TripPlanState } from '../trip-plan-reducer';

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
    state = tripPlanReducer(state, { type: 'finishPlace', photo: 'file:///photo.jpg' });

    expect(state.customPlaces).toEqual([
      {
        id: 'custom-1',
        icon: 'local_hospital',
        photo: 'file:///photo.jpg',
        helpName: undefined,
        hiddenOnMap: false,
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
    state = tripPlanReducer(state, { type: 'finishPlace' });

    expect(state.customPlaces[0]).toMatchObject({
      icon: 'push_pin',
      helpName: 'Pharmacie du Port',
    });
    expect(state.originId).toBeUndefined();
  });

  test('draft edits without a draft change nothing', () => {
    expect(tripPlanReducer(withOrigin, { type: 'setDraftIcon', icon: 'home' })).toBe(withOrigin);
    expect(tripPlanReducer(withOrigin, { type: 'finishPlace' })).toBe(withOrigin);
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

  test('a new home or family place stays off the home map', () => {
    let state = tripPlanReducer(withOrigin, {
      type: 'startPlace',
      source: 'address',
    });
    state = tripPlanReducer(state, { type: 'setDraftIcon', icon: 'family_home' });
    state = tripPlanReducer(state, { type: 'finishPlace' });

    expect(state.customPlaces[0]?.hiddenOnMap).toBe(true);
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
