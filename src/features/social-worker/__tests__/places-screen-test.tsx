import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';

import { deletePhoto } from '@/services/photo';
import { dropPlacesBackup, writePlacesFile } from '@/services/place-storage';
import { renderWithProviders } from '@/testing/render-with-providers';

import { PlacesScreen } from '../places-screen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), push: jest.fn() } }));
jest.mock('@/services/place-storage', () => ({
  writePlacesFile: jest.fn(),
  dropPlacesBackup: jest.fn(() => Promise.resolve({ ok: true })),
}));

const kept = {
  type: 'addPlace',
  place: {
    id: 'p1',
    icon: 'local_hospital',
    helpName: "l'hôpital Nord",
    point: [5.37722, 43.29655],
    photo: 'file:///files/photos/abc.jpg',
    createdAt: 1,
  },
} as const;

describe('<PlacesScreen /> (spec 022)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('lists the places of this phone and sends one by link', async () => {
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    await renderWithProviders(<PlacesScreen />, [kept]);

    expect(screen.getByText("l'hôpital Nord")).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Envoyer'));

    expect(share).toHaveBeenCalledWith({
      message: 'https://ali-lamhene.github.io/l/#1/43.29655/5.37722/local_hospital',
    });
  });

  test('deletes a place and its photo after a confirmation', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: true });
    const alert = jest.spyOn(Alert, 'alert');
    await renderWithProviders(<PlacesScreen />, [kept]);

    await fireEvent.press(screen.getByText('Supprimer'));
    const buttons = alert.mock.calls[0]?.[2] ?? [];
    await buttons.find((button) => button.text === 'Supprimer')?.onPress?.();

    await waitFor(() => expect(deletePhoto).toHaveBeenCalledWith('file:///files/photos/abc.jpg'));
    // The backup copy that still held the place goes too.
    expect(dropPlacesBackup).toHaveBeenCalled();
    expect(await screen.findByText('Aucun lieu enregistré.')).toBeOnTheScreen();
  });

  test('a delete that cannot be written keeps the place and its photo', async () => {
    jest.mocked(writePlacesFile).mockResolvedValue({ ok: false });
    const alert = jest.spyOn(Alert, 'alert');
    await renderWithProviders(<PlacesScreen />, [kept]);

    await fireEvent.press(screen.getByText('Supprimer'));
    await alert.mock.calls[0]?.[2]?.find((button) => button.text === 'Supprimer')?.onPress?.();

    expect(deletePhoto).not.toHaveBeenCalled();
    expect(screen.getByText("l'hôpital Nord")).toBeOnTheScreen();
  });
});
