import type { UIMessage } from 'ai';
import { render, screen } from '@testing-library/react-native';

import { ChatBubble } from './chat-bubble';

describe('ChatBubble', () => {
  it('renders message text', async () => {
    const message: UIMessage = {
      id: 'm1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hi there!' }],
    };
    await render(<ChatBubble message={message} />);
    expect(screen.getByText('Hi there!')).toBeOnTheScreen();
  });

  it('concatenates multiple text parts', async () => {
    const message: UIMessage = {
      id: 'm2',
      role: 'user',
      parts: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world' },
      ],
    };
    await render(<ChatBubble message={message} />);
    expect(screen.getByText('Hello world')).toBeOnTheScreen();
  });

  it('renders image file parts', async () => {
    const message: UIMessage = {
      id: 'm3',
      role: 'user',
      parts: [{ type: 'file', mediaType: 'image/png', url: 'data:image/png;base64,AAAA' }],
    };
    await render(<ChatBubble message={message} />);
    expect(JSON.stringify(screen.toJSON())).toContain('ExpoImage');
  });

  it('renders a reasoning part as a collapsible block', async () => {
    const message: UIMessage = {
      id: 'm4',
      role: 'assistant',
      parts: [
        { type: 'reasoning', text: 'let me think', state: 'done' },
        { type: 'text', text: 'The answer is 42.' },
      ],
    };
    await render(<ChatBubble message={message} />);
    expect(screen.getByText('Reasoning')).toBeOnTheScreen();
    expect(screen.getByText('The answer is 42.')).toBeOnTheScreen();
  });

  it('renders source-url parts as a Sources list', async () => {
    const message: UIMessage = {
      id: 'm5',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'See sources.' },
        { type: 'source-url', sourceId: 's1', url: 'https://example.com', title: 'Example' },
      ],
    };
    await render(<ChatBubble message={message} />);
    expect(screen.getByText('Sources')).toBeOnTheScreen();
    expect(screen.getByText('Example')).toBeOnTheScreen();
  });

  it('renders a non-image file part as an attachment chip', async () => {
    const message: UIMessage = {
      id: 'm6',
      role: 'assistant',
      parts: [{ type: 'file', mediaType: 'application/pdf', url: 'https://x/y.pdf', filename: 'y.pdf' }],
    };
    await render(<ChatBubble message={message} />);
    expect(screen.getByText('y.pdf')).toBeOnTheScreen();
  });

  it('renders a tool call part', async () => {
    const message: UIMessage = {
      id: 'm7',
      role: 'assistant',
      parts: [
        {
          type: 'tool-getWeather',
          toolCallId: 't1',
          state: 'output-available',
          input: { city: 'Paris' },
          output: { tempC: 21 },
        },
      ],
    } as unknown as UIMessage;
    await render(<ChatBubble message={message} />);
    expect(screen.getByText('getWeather')).toBeOnTheScreen();
    expect(screen.getByText('output-available')).toBeOnTheScreen();
  });
});
