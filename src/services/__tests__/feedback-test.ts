import { createAudioPlayer } from 'expo-audio';
import { Vibration } from 'react-native';

import { playCue } from '../feedback';

describe('playCue', () => {
  beforeAll(() => jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined));
  beforeEach(() => jest.clearAllMocks());

  test('plays the sound and vibrates the pattern, starting with a pause on the phone', () => {
    playCue('turn');

    expect(createAudioPlayer).toHaveBeenCalled();
    expect(Vibration.vibrate).toHaveBeenCalledWith([0, 80, 60, 80]);
  });

  test('a single vibration is a plain duration', () => {
    playCue('exit');

    expect(Vibration.vibrate).toHaveBeenCalledWith(120);
  });

  test('some cues are sound only', () => {
    playCue('vehicle');

    expect(Vibration.vibrate).not.toHaveBeenCalled();
  });

  test('reuses the player of a cue', () => {
    playCue('alert');
    playCue('alert');

    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
  });
});
