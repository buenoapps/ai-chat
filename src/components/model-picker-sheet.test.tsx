import { fireEvent, render, screen } from '@testing-library/react-native';

import { ModelPickerSheet } from './model-picker-sheet';
import type { Provider } from '@/lib/types';

const mockProviders = jest.fn();
jest.mock('@/context/providers-context', () => ({
  useProviders: () => ({ providers: mockProviders() }),
}));

const provider: Provider = {
  id: 'p1',
  name: 'My Claude',
  type: 'anthropic',
  model: 'claude-sonnet-4-5',
  createdAt: 1,
};

describe('ModelPickerSheet', () => {
  it('shows an empty state when no providers exist', async () => {
    mockProviders.mockReturnValue([]);
    await render(<ModelPickerSheet visible onClose={jest.fn()} onSelect={jest.fn()} />);
    expect(screen.getByText('No providers configured yet.')).toBeOnTheScreen();
    expect(screen.getByText('Add a provider')).toBeOnTheScreen();
  });

  it('lists saved providers with their model label', async () => {
    mockProviders.mockReturnValue([provider]);
    await render(<ModelPickerSheet visible onClose={jest.fn()} onSelect={jest.fn()} />);
    expect(screen.getByText('My Claude')).toBeOnTheScreen();
    expect(screen.getByText(/Anthropic · Claude Sonnet 4.5/)).toBeOnTheScreen();
  });

  it('selects a provider and closes', async () => {
    mockProviders.mockReturnValue([provider]);
    const onSelect = jest.fn();
    const onClose = jest.fn();
    await render(<ModelPickerSheet visible onClose={onClose} onSelect={onSelect} />);

    await fireEvent.press(screen.getByText('My Claude'));

    expect(onSelect).toHaveBeenCalledWith('p1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
