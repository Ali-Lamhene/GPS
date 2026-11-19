import { render, screen } from '@testing-library/react-native';

import { PermissionIntroHost } from '../permission-intro-host';

const mockPosition = jest.fn();
jest.mock('../../location/location-context', () => ({
  useTravellerPosition: () => mockPosition(),
}));

describe('over the whole app (spec 038)', () => {
  test('still reading the permission: a plain cover, neither home nor explanation', async () => {
    mockPosition.mockReturnValue({ checking: true, intro: undefined, answerIntro: jest.fn() });
    await render(<PermissionIntroHost />);

    expect(screen.getByTestId('permission-checking')).toBeTruthy();
    expect(screen.queryByTestId('permission-intro-location-ask')).toBeNull();
  });

  test('nothing to explain: nothing drawn over the app', async () => {
    mockPosition.mockReturnValue({ checking: false, intro: undefined, answerIntro: jest.fn() });
    await render(<PermissionIntroHost />);

    expect(screen.queryByTestId('permission-checking')).toBeNull();
    expect(screen.queryByTestId('permission-intro-location-ask')).toBeNull();
  });

  test('the explanation asked for: shown, and ✓ and ✗ answer it', async () => {
    const answerIntro = jest.fn();
    mockPosition.mockReturnValue({ checking: false, intro: 'ask', answerIntro });
    await render(<PermissionIntroHost />);

    expect(screen.getByTestId('permission-intro-location-ask')).toBeTruthy();
  });
});
