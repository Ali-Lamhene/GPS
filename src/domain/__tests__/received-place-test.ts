import { distanceMeters } from '../geo';
import { RECEIVED_FRAME_METERS, receivedPlaceCamera } from '../received-place';

describe('framing a place received by link (spec 023)', () => {
  const place = [5.37722, 43.29655] as const;

  test('the place alone, at street level, when the traveller is unknown', () => {
    expect(receivedPlaceCamera(place, undefined)).toEqual({ center: place, zoom: 16 });
  });

  test('the place and the traveller together when both fit a neighbourhood', () => {
    const near = [5.3806, 43.3027] as const;
    expect(distanceMeters(place, near)).toBeLessThan(RECEIVED_FRAME_METERS);

    expect(receivedPlaceCamera(place, near)).toEqual({
      center: place,
      zoom: 16,
      bounds: [
        [5.37722, 43.29655],
        [5.3806, 43.3027],
      ],
    });
  });

  test('the place alone when the traveller is far away', () => {
    const far = [2.3522, 48.8566] as const;

    expect(receivedPlaceCamera(place, far)).toEqual({ center: place, zoom: 16 });
  });
});
