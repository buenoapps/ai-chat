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
});
