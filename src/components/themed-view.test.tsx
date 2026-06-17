import { render, screen } from '@testing-library/react-native';

import { ThemedView } from './themed-view';

describe('ThemedView', () => {
  it('renders with a themed background color', async () => {
    await render(<ThemedView testID="view" />);
    const node = screen.getByTestId('view');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: expect.any(String) })]),
    );
  });
});
