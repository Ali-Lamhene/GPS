import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import { speak } from '../speech';

function voice(identifier: string, language = 'fr-FR', localService = true) {
  return {
    identifier,
    name: identifier,
    language,
    localService,
    quality: 'Default',
    voiceURI: identifier,
  };
}

const voices = jest.mocked(Speech.getAvailableVoicesAsync);

describe('speak', () => {
  const os = Platform.OS;
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
  });
  afterAll(() => {
    Platform.OS = os;
  });

  test('reads in French with a voice installed on the phone', async () => {
    voices.mockResolvedValue([
      voice('fr-fr-x-frc-network'),
      voice('fr-fr-x-frc-local'),
      voice('en-us-x-sfg-local', 'en-US'),
    ] as Speech.Voice[]);

    await expect(speak('Gare Centrale')).resolves.toBe(true);

    expect(Speech.speak).toHaveBeenCalledWith('Gare Centrale', {
      language: 'fr-FR',
      voice: 'fr-fr-x-frc-local',
    });
  });

  test.each([
    ['only network or unknown voices', [voice('fr-fr-x-frc-network'), voice('fr-FR-language')]],
    ['no French voice', [voice('en-us-x-sfg-local', 'en-US')]],
    ['no voice at all', []],
  ])('stays silent with %s', async (_, list) => {
    voices.mockResolvedValue(list as Speech.Voice[]);

    await expect(speak('Gare Centrale')).resolves.toBe(false);

    expect(Speech.speak).not.toHaveBeenCalled();
  });

  test('stays silent when the voice list fails', async () => {
    voices.mockRejectedValue(new Error('engine unavailable'));

    await expect(speak('Gare Centrale')).resolves.toBe(false);

    expect(Speech.speak).not.toHaveBeenCalled();
  });

  test('in a browser, only voices that run locally are used', async () => {
    Platform.OS = 'web';
    voices.mockResolvedValue([voice('Google français', 'fr-FR', false)] as Speech.Voice[]);

    await expect(speak('Gare Centrale')).resolves.toBe(false);
  });
});
