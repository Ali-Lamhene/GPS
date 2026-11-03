import { GLYPHS } from '@/ui/icon/glyphs';

import { hiddenOnMapByDefault, PICTOGRAM_CHOICES } from '../place';
import {
  PICTOGRAM_CATALOGUE,
  pictogramFamily,
  pictogramName,
  toCataloguePictogram,
} from '../pictograms';

describe('pictogram catalogue (spec 011)', () => {
  test('offers the 77 places of the spec, each once, in family order', () => {
    expect(PICTOGRAM_CHOICES).toHaveLength(77);
    expect(new Set(PICTOGRAM_CHOICES).size).toBe(77);
    expect(PICTOGRAM_CATALOGUE.map(({ family }) => family)).toEqual([
      'home',
      'health',
      'admin',
      'social',
      'studies',
      'work',
      'shopping',
      'transport',
      'leisure',
      'worship',
      'other',
    ]);
  });

  test('every pictogram is drawn by the bundled font and has a French name', () => {
    for (const icon of PICTOGRAM_CHOICES) {
      expect(GLYPHS[icon]).toEqual(expect.any(Number));
      expect(pictogramName(icon)).not.toBe('lieu');
    }
  });

  test('covers the places asked for', () => {
    expect(pictogramName('group')).toBe('chez un ami');
    expect(pictogramName('location_city')).toBe('mairie');
    expect(pictogramName('balance')).toBe('avocat');
    expect(pictogramName('visibility')).toBe('ophtalmologue');
    expect(pictogramFamily('stethoscope')).toBe('health');
  });

  test('homes and sensitive health places stay off the home map by default', () => {
    expect(hiddenOnMapByDefault('home')).toBe(true);
    expect(hiddenOnMapByDefault('family_home')).toBe(true);
    expect(hiddenOnMapByDefault('group')).toBe(true);
    expect(hiddenOnMapByDefault('night_shelter')).toBe(true);
    expect(hiddenOnMapByDefault('psychology')).toBe(true);
    expect(hiddenOnMapByDefault('mosque')).toBe(false);
    expect(hiddenOnMapByDefault('balance')).toBe(false);
  });

  test('an unknown pictogram from a newer link becomes « autre lieu »', () => {
    expect(toCataloguePictogram('rocket_launch')).toBe('push_pin');
    expect(toCataloguePictogram('toString')).toBe('push_pin');
    expect(toCataloguePictogram('dentistry')).toBe('dentistry');
    expect(pictogramFamily('flag')).toBe('other');
  });

  test('no consulate, no letter, no symbol of the trip’s ends, modes or stops', () => {
    const offered = PICTOGRAM_CHOICES.join(' ');
    expect(offered).not.toMatch(/embassy|consul|flag|location_on|local_parking|local_atm|savings/);
    expect(PICTOGRAM_CHOICES).not.toContain('directions_bus');
    expect(PICTOGRAM_CHOICES).not.toContain('subway');
  });
});
