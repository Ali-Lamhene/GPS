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

  test('a new place is drafted, then saved and chosen for its end of the trip', () => {
    let state = tripPlanReducer(withOrigin, {
      type: 'startPlace',
      for: 'destination',
      source: 'position',
    });
    state = tripPlanReducer(state, { type: 'setDraftIcon', icon: 'local_hospital' });
    state = tripPlanReducer(state, { type: 'finishPlace', photo: 'tramStop' });

    expect(state.customPlaces).toEqual([
      { id: 'custom-1', icon: 'local_hospital', photo: 'tramStop', helpName: undefined },
    ]);
    expect(state.destinationId).toBe('custom-1');
    expect(state.draft).toBeUndefined();
  });

  test('a place drafted from an address keeps its name for the help card', () => {
    let state = tripPlanReducer(initialTripPlan, {
      type: 'startPlace',
      for: 'origin',
      source: 'address',
    });
    state = tripPlanReducer(state, { type: 'setDraftName', helpName: 'Pharmacie du Port' });
    state = tripPlanReducer(state, { type: 'finishPlace' });

    expect(state.customPlaces[0]).toMatchObject({
      icon: 'location_on',
      helpName: 'Pharmacie du Port',
    });
    expect(state.originId).toBe('custom-1');
  });

  test('draft edits without a draft change nothing', () => {
    expect(tripPlanReducer(withOrigin, { type: 'setDraftIcon', icon: 'home' })).toBe(withOrigin);
    expect(tripPlanReducer(withOrigin, { type: 'finishPlace' })).toBe(withOrigin);
  });

  test('reset starts a new trip but keeps the created places', () => {
    const state: TripPlanState = {
      originId: 'home',
      destinationId: 'beach',
      mode: 'walk',
      customPlaces: [{ id: 'custom-1', icon: 'home' }],
    };

    expect(tripPlanReducer(state, { type: 'reset' })).toEqual({
      mode: 'transit',
      customPlaces: [{ id: 'custom-1', icon: 'home' }],
    });
  });
});
