import { act, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { decodePlaces, type PhotoNames } from '@/domain/stored-places';
import { playCue } from '@/services/feedback';
import { writePlacesFile } from '@/services/place-storage';
import { renderWithProviders } from '@/testing/render-with-providers';

import { keepPendingLink, takePendingLink } from '../pending-link';
import { ReceivePlaceScreen } from '../receive-place-screen';

const NO_PHOTOS: PhotoNames = { toName: () => undefined, toUri: () => undefined };

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => false) },
}));
jest.mock('@/services/feedback', () => ({ playCue: jest.fn() }));
jest.mock('@/services/place-storage', () => ({ writePlacesFile: jest.fn() }));

const LINK = 'https://ali-lamhene.github.io/gps/lieu#1/43.29655/5.37722/local_hospital';

describe('receiving a place by link (spec 001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
  });
  afterEach(() => jest.useRealTimers());

  test('adds it at once, with the check and the « saved » cue, then the home', async () => {
    keepPendingLink(LINK);
    await renderWithProviders(<ReceivePlaceScreen />);

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

  test('a damaged link adds nothing: red cross and the alert', async () => {
    keepPendingLink(LINK.slice(0, -6));
    await renderWithProviders(<ReceivePlaceScreen />);

    expect(await screen.findByTestId('place-refused')).toBeOnTheScreen();
    expect(writePlacesFile).not.toHaveBeenCalled();
    expect(playCue).toHaveBeenCalledWith('alert');
  });

  test('the same place twice is not added again', async () => {
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
    await screen.findByTestId('place-received');

    await act(() => jest.advanceTimersByTime(2000));

    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
