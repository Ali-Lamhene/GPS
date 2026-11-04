import { decodePolyline } from '../polyline';

describe('decodePolyline', () => {
  test('reads the reference example of the format (precision 5)', () => {
    expect(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@', 5)).toEqual([
      [-120.2, 38.5],
      [-120.95, 40.7],
      [-126.453, 43.252],
    ]);
  });

  test('a damaged string gives the points read so far', () => {
    expect(decodePolyline('_p~iF~ps|U_ul', 5)).toEqual([[-120.2, 38.5]]);
  });
});
