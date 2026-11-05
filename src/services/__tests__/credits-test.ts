import { Linking } from 'react-native';

import { openCreditPage } from '../credits';

describe('openCreditPage (spec 024)', () => {
  test('opens only the fixed credit pages', () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);

    openCreditPage('routingSources');
    openCreditPage('openStreetMap');

    expect(open.mock.calls).toEqual([
      ['https://transitous.org/sources/'],
      ['https://www.openstreetmap.org/copyright'],
    ]);
  });

  test('no browser: nothing happens', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));

    expect(() => openCreditPage('routingSources')).not.toThrow();
    await Promise.resolve();
  });
});
