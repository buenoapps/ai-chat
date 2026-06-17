import { Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { FileAttachment, ReasoningBlock, SourcesList, ToolCallCard } from './message-parts';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
});

describe('ReasoningBlock', () => {
  it('is collapsed by default and expands on press', async () => {
    await render(<ReasoningBlock text="step by step thoughts" />);
    expect(screen.getByText('Reasoning')).toBeOnTheScreen();
    expect(screen.queryByText('step by step thoughts')).toBeNull();

    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByText('step by step thoughts')).toBeOnTheScreen();
  });

  it('starts open when defaultOpen is set (e.g. while streaming)', async () => {
    await render(<ReasoningBlock text="live thinking" defaultOpen />);
    expect(screen.getByText('live thinking')).toBeOnTheScreen();
  });
});

describe('ToolCallCard', () => {
  it('renders name, state, input/output and errors', async () => {
    await render(
      <ToolCallCard
        name="getWeather"
        state="output-available"
        input={{ city: 'Paris' }}
        output={{ tempC: 21 }}
      />,
    );
    expect(screen.getByText('getWeather')).toBeOnTheScreen();
    expect(screen.getByText('output-available')).toBeOnTheScreen();
    expect(screen.getByText(/"city": "Paris"/)).toBeOnTheScreen();
    expect(screen.getByText(/"tempC": 21/)).toBeOnTheScreen();
  });
});

describe('FileAttachment', () => {
  it('shows the filename and opens the url when pressed', async () => {
    await render(<FileAttachment url="https://x.test/report.pdf" filename="report.pdf" />);
    expect(screen.getByText('report.pdf')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('report.pdf'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('https://x.test/report.pdf'));
  });
});

describe('SourcesList', () => {
  it('lists sources and opens a link on press', async () => {
    await render(
      <SourcesList
        sources={[
          { title: 'Wikipedia', url: 'https://en.wikipedia.org' },
          { title: 'A document (no link)' },
        ]}
      />,
    );
    expect(screen.getByText('Sources')).toBeOnTheScreen();
    expect(screen.getByText('A document (no link)')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Wikipedia'));
    await waitFor(() => expect(Linking.openURL).toHaveBeenCalledWith('https://en.wikipedia.org'));
  });
});
