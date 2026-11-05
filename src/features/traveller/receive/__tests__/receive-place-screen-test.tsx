import { act, fireEvent, screen } from '@testing-library/react-native';
import { useNetworkState } from 'expo-network';
import { router } from 'expo-router';
import { BackHandler } from 'react-native';

import { decodePlaces, type PhotoNames } from '@/domain/stored-places';
import { playCue } from '@/services/feedback';
import { writePlacesFile } from '@/services/place-storage';
import { renderWithProviders } from '@/testing/render-with-providers';

import { keepPendingLink, takePendingLink } from '../pending-link';
import { ReceivePlaceScreen } from '../receive-place-screen';

const NO_PHOTOS: PhotoNames = { toName: () => undefined, toUri: () => undefined };

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false), push: jest.fn() },
  useFocusEffect: (effect: () => void) => jest.requireActual('react').useEffect(effect, [effect]),
}));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
jest.mock('@/services/place-storage', () => ({ writePlacesFile: jest.fn() }));

const LINK = 'https://ali-lamhene.github.io/l#1/43.29655/5.37722/local_hospital';

const answer = (label: string) => screen.getByRole('button', { name: label });

describe('receiving a place by link (specs 019, 023)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
  });
  afterEach(() => jest.useRealTimers());

  test('asks first: the place on the map, ✕ and ✓, the « select » cue, nothing kept', async () => {
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);

    expect(screen.getByTestId('place-question')).toBeOnTheScreen();
    expect(answer('Refuser ce lieu')).toBeOnTheScreen();
    expect(answer('Ajouter ce lieu')).toBeOnTheScreen();
    expect(answer('Aide')).toBeOnTheScreen();
    expect(playCue).toHaveBeenCalledWith('select');
    await act(() => jest.advanceTimersByTime(10_000));
    // The screen waits: nothing comes in without ✓.
    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('✓ keeps it, with the check and the « saved » cue, then the home', async () => {
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);
    await fireEvent.press(answer('Ajouter ce lieu'));

    expect(await screen.findByTestId('place-received')).toBeOnTheScreen();
    const decoded = decodePlaces(jest.mocked(writePlacesFile).mock.calls[0]?.[0] ?? '', NO_PHOTOS);
    expect(decoded.ok && decoded.places[0]).toMatchObject({
      icon: 'local_hospital',
      point: [5.37722, 43.29655],
    });
    expect(playCue).toHaveBeenCalledWith('saved');
    await act(() => jest.advanceTimersByTime(2000));
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('✕ keeps nothing and closes quietly: no red cross, no alert', async () => {
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);
    jest.mocked(playCue).mockClear();
    await fireEvent.press(answer('Refuser ce lieu'));

    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(screen.queryByTestId('place-refused')).toBeNull();
    expect(playCue).toHaveBeenCalledWith('select');
    expect(playCue).not.toHaveBeenCalledWith('alert');
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('the first answer wins: ✓ right after ✕ saves nothing', async () => {
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);
    const refuse = answer('Refuser ce lieu');
    const accept = answer('Ajouter ce lieu');

    await act(() => {
      fireEvent.press(refuse);
      fireEvent.press(accept);
    });

    expect(writePlacesFile).not.toHaveBeenCalled();
  });

  test('a link handed over while the question is open is dropped when it closes', async () => {
    keepPendingLink(LINK);
    const view = await renderWithProviders(<ReceivePlaceScreen />);
    keepPendingLink(LINK);

    await view.unmount();

    expect(takePendingLink()).toBeNull();
  });

  test("Android's back answers ✕", async () => {
    const listeners: (() => boolean)[] = [];
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_, listener) => {
      listeners.push(listener as () => boolean);
      return { remove: jest.fn() };
    });
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);

    await act(() => listeners.at(-1)?.());

    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/');
    jest.mocked(BackHandler.addEventListener).mockRestore();
  });

  test('no network: the pin alone, the same two answers', async () => {
    jest.mocked(useNetworkState).mockReturnValue({ isConnected: false });
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);

    expect(screen.getByTestId('place-question')).toBeOnTheScreen();
    expect(answer('Ajouter ce lieu')).toBeOnTheScreen();
    jest.mocked(useNetworkState).mockReturnValue({ isConnected: true, isInternetReachable: true });
  });

  test('a damaged link adds nothing: red cross and the alert', async () => {
    keepPendingLink(LINK.slice(0, -6));
    await renderWithProviders(<ReceivePlaceScreen />);

    expect(await screen.findByTestId('place-refused')).toBeOnTheScreen();
    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(playCue).toHaveBeenCalledWith('alert');
  });

  test('the same place twice: no question, the check at once, nothing added', async () => {
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />, [
      {
        type: 'addPlace',
        place: { id: 'p1', icon: 'local_hospital', point: [5.37722, 43.29655], createdAt: 1 },
      },
    ]);

    expect(await screen.findByTestId('place-received')).toBeOnTheScreen();
    expect(writePlacesFile).not.toHaveBeenCalled();
  });

  test('no link to read: the cross, never a blank screen', async () => {
    takePendingLink();
    await renderWithProviders(<ReceivePlaceScreen />);

    expect(screen.getByTestId('place-refused')).toBeOnTheScreen();
  });

  test('the link is read once: opening the screen again saves nothing', async () => {
    keepPendingLink(LINK);
    const first = await renderWithProviders(<ReceivePlaceScreen />);
    await fireEvent.press(answer('Ajouter ce lieu'));
    await screen.findByTestId('place-received');
    await first.unmount();
    jest.mocked(writePlacesFile).mockClear();

    await renderWithProviders(<ReceivePlaceScreen />);

    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(screen.getByTestId('place-refused')).toBeOnTheScreen();
  });

  test('over a trip in progress, it goes back to it', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);
    await fireEvent.press(answer('Ajouter ce lieu'));
    await screen.findByTestId('place-received');

    await act(() => jest.advanceTimersByTime(2000));

    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
