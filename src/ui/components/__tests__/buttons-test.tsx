import { fireEvent, render } from '@testing-library/react-native';

import { HelpButton } from '../help-button';
import { IconButton } from '../icon-button';
import { MainActionButton } from '../main-action-button';

describe('buttons', () => {
  test('IconButton is a labelled button that calls back on press', async () => {
    const onPress = jest.fn();
    const screen = await render(<IconButton icon="arrow_back" label="Retour" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('HelpButton is labelled for screen readers', async () => {
    const onPress = jest.fn();
    const screen = await render(<HelpButton onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Aide' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('MainActionButton ignores presses while disabled', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <MainActionButton icon="arrow_forward" label="Continuer" onPress={onPress} disabled />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }));

    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled();
  });
});

describe('touch targets', () => {
  test('keep the size drawn in the mockups, without an enlarged touch area (D15)', async () => {
    const screen = await render(<IconButton icon="home" label="Accueil" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Accueil' })).not.toHaveProp('hitSlop');
  });
});
