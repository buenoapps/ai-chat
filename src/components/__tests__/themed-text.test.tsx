import { render, screen } from '@testing-library/react-native';

import { ThemedText } from '../themed-text';

describe('ThemedText', () => {
  it('renders its text content', async () => {
    await render(<ThemedText>Hello world</ThemedText>);
    expect(screen.getByText('Hello world')).toBeOnTheScreen();
  });

  it('applies a resolved theme color', async () => {
    await render(<ThemedText>Tinted</ThemedText>);
    const node = screen.getByText('Tinted');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: expect.any(String) })]),
    );
  });

  it('supports type variants without crashing', async () => {
    await render(<ThemedText type="title">Big</ThemedText>);
    expect(screen.getByText('Big')).toBeOnTheScreen();
  });
});
