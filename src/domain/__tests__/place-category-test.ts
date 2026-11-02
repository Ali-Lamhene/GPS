import { PICTOGRAM_CHOICES } from '../place';
import { placeCategory } from '../place-category';

describe('placeCategory', () => {
  test('groups pictograms into families', () => {
    expect(placeCategory('home')).toBe('home');
    expect(placeCategory('family_restroom')).toBe('family');
    expect(placeCategory('local_hospital')).toBe(placeCategory('local_pharmacy'));
    expect(placeCategory('school')).toBe(placeCategory('local_library'));
    expect(placeCategory('park')).toBe('leisure');
  });

  test('a place with the default pin falls in « other »', () => {
    expect(placeCategory('location_on')).toBe('other');
  });

  test('every pictogram offered at creation has a family', () => {
    for (const icon of PICTOGRAM_CHOICES) expect(placeCategory(icon)).toEqual(expect.any(String));
  });
});
