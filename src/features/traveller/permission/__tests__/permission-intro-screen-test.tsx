import { fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';

import { playCue } from '@/services/feedback';

import { PermissionIntroScreen } from '../permission-intro-screen';

jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));

describe('the screen before a permission window (spec 038)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('position: the phone that knows where « me » is, a soft cue, ✓ goes on with a cue', async () => {
    const onAccept = jest.fn();
    const onSkip = jest.fn();
    await render(
      <PermissionIntroScreen kind="location" mode="ask" onAccept={onAccept} onSkip={onSkip} />,
    );

    expect(screen.getByTestId('permission-intro-location-ask')).toBeTruthy();
    expect(screen.getByTestId('permission-phone-drawing')).toBeTruthy();
    expect(screen.getByTestId('permission-window-drawing')).toBeTruthy();
    expect(playCue).toHaveBeenCalledWith('permission');

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(playCue).toHaveBeenCalledWith('saved');
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onSkip).not.toHaveBeenCalled();
  });

  test('✗ leaves without going on, and is felt as well as seen', async () => {
    const onAccept = jest.fn();
    const onSkip = jest.fn();
    await render(
      <PermissionIntroScreen kind="location" mode="ask" onAccept={onAccept} onSkip={onSkip} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Pas maintenant' }));
    expect(playCue).toHaveBeenCalledWith('unavailable');
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(onAccept).not.toHaveBeenCalled();
  });

  test('camera: the camera and its place, not the phone', async () => {
    await render(
      <PermissionIntroScreen
        kind="camera"
        mode="ask"
        placeIcon="local_pharmacy"
        onAccept={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(screen.getByTestId('permission-intro-camera-ask')).toBeTruthy();
    expect(screen.getByTestId('permission-camera-drawing')).toBeTruthy();
    expect(screen.queryByTestId('permission-phone-drawing')).toBeNull();
  });

  test('blocked for good: the drawing is the settings switch, not the system window', async () => {
    await render(
      <PermissionIntroScreen
        kind="location"
        mode="settings"
        onAccept={jest.fn()}
        onSkip={jest.fn()}
      />,
    );

    expect(screen.getByTestId('permission-settings-drawing')).toBeTruthy();
    expect(screen.queryByTestId('permission-window-drawing')).toBeNull();
  });

  test('the Android back gesture is « not now », held here', async () => {
    const remove = jest.fn();
    let pressed: Parameters<typeof BackHandler.addEventListener>[1] | undefined;
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
      pressed = handler;
      return { remove };
    });
    const onSkip = jest.fn();
    const { unmount } = await render(
      <PermissionIntroScreen kind="location" mode="ask" onAccept={jest.fn()} onSkip={onSkip} />,
    );

    expect(pressed?.({ type: 'hardwareBackPress', timeStamp: 0 })).toBe(true);
    expect(onSkip).toHaveBeenCalledTimes(1);
    await unmount();
    expect(remove).toHaveBeenCalled();
  });
});
