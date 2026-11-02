import { screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { renderWithProviders } from '@/testing/render-with-providers';

import { RequireDraft } from '../require-draft';

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    const { View: Mocked } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Mocked testID={`redirect:${href}`} />;
  },
}));

function screenUnder(source?: 'position' | 'address') {
  return (
    <RequireDraft source={source}>
      <View testID="new-place-screen" />
    </RequireDraft>
  );
}

describe('<RequireDraft />', () => {
  test('a link straight to the address form goes back home', async () => {
    await renderWithProviders(screenUnder('address'));

    expect(screen.getByTestId('redirect:/')).toBeOnTheScreen();
    expect(screen.queryByTestId('new-place-screen')).toBeNull();
  });

  test('a draft from the traveller tap does not open the address form', async () => {
    await renderWithProviders(screenUnder('address'), [{ type: 'startPlace', source: 'position' }]);

    expect(screen.getByTestId('redirect:/')).toBeOnTheScreen();
  });

  test('the hold on « + » opens it', async () => {
    await renderWithProviders(screenUnder('address'), [{ type: 'startPlace', source: 'address' }]);

    expect(screen.getByTestId('new-place-screen')).toBeOnTheScreen();
  });

  test('later steps accept either draft', async () => {
    await renderWithProviders(screenUnder(), [{ type: 'startPlace', source: 'address' }]);

    expect(screen.getByTestId('new-place-screen')).toBeOnTheScreen();
  });
});
