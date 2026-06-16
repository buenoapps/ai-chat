import { fireEvent, render, screen } from '@testing-library/react-native';

import { Fab } from '../fab';

describe('Fab', () => {
  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Fab onPress={onPress} accessibilityLabel="New chat" />);

    await fireEvent.press(screen.getByLabelText('New chat'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes a button role', async () => {
    await render(<Fab onPress={jest.fn()} accessibilityLabel="Add" />);
    expect(screen.getByRole('button', { name: 'Add' })).toBeOnTheScreen();
  });
});
