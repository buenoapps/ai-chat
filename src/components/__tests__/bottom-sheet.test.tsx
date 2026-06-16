import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { BottomSheet } from '../bottom-sheet';

describe('BottomSheet', () => {
  it('renders the title and children when visible', async () => {
    await render(
      <BottomSheet visible onClose={jest.fn()} title="Options">
        <Text>Sheet content</Text>
      </BottomSheet>,
    );
    expect(screen.getByText('Options')).toBeOnTheScreen();
    expect(screen.getByText('Sheet content')).toBeOnTheScreen();
  });

  it('calls onClose when the backdrop is pressed', async () => {
    const onClose = jest.fn();
    await render(
      <BottomSheet visible onClose={onClose} title="Options">
        <Text>Sheet content</Text>
      </BottomSheet>,
    );
    await fireEvent.press(screen.getByTestId('bottom-sheet-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
