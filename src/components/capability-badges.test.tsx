import { render, screen } from '@testing-library/react-native';

import { CapabilityBadges } from './capability-badges';

describe('CapabilityBadges', () => {
  it('renders a badge for each supported capability', async () => {
    await render(
      <CapabilityBadges model={{ id: 'm', label: 'M', vision: true, thinking: true, tools: true }} />,
    );
    expect(screen.getByText('Vision')).toBeOnTheScreen();
    expect(screen.getByText('Thinking')).toBeOnTheScreen();
    expect(screen.getByText('Tools')).toBeOnTheScreen();
    expect(screen.getByLabelText('Supports vision')).toBeOnTheScreen();
  });

  it('only renders the capabilities that are present', async () => {
    await render(<CapabilityBadges model={{ id: 'm', label: 'M', tools: true }} />);
    expect(screen.getByText('Tools')).toBeOnTheScreen();
    expect(screen.queryByText('Vision')).toBeNull();
    expect(screen.queryByText('Thinking')).toBeNull();
  });

  it('renders nothing for a model with no capabilities or no model', async () => {
    const { toJSON } = await render(<CapabilityBadges model={{ id: 'm', label: 'M' }} />);
    expect(toJSON()).toBeNull();
    const empty = await render(<CapabilityBadges model={undefined} />);
    expect(empty.toJSON()).toBeNull();
  });

  it('hides labels in compact mode but keeps a11y labels', async () => {
    await render(<CapabilityBadges model={{ id: 'm', label: 'M', vision: true }} compact />);
    expect(screen.queryByText('Vision')).toBeNull();
    expect(screen.getByLabelText('Supports vision')).toBeOnTheScreen();
  });
});
