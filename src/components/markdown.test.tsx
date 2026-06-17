import * as Clipboard from 'expo-clipboard';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CodeBlock, Markdown } from './markdown';

beforeEach(() => jest.clearAllMocks());

describe('Markdown', () => {
  it('renders the message content', async () => {
    await render(<Markdown content="hello world" />);
    expect(screen.getByText('hello world')).toBeOnTheScreen();
  });
});

describe('CodeBlock', () => {
  it('shows the language label and the code', async () => {
    await render(<CodeBlock code="const x = 1;" language="javascript" />);
    expect(screen.getByText('javascript')).toBeOnTheScreen();
    expect(screen.getByText('const x = 1;')).toBeOnTheScreen();
  });

  it('falls back to a generic label when no language is given', async () => {
    await render(<CodeBlock code="echo hi" />);
    expect(screen.getByText('code')).toBeOnTheScreen();
  });

  it('copies the code (without trailing newline) to the clipboard', async () => {
    await render(<CodeBlock code={'line1\nline2\n'} language="text" />);

    await fireEvent.press(screen.getByLabelText('Copy code'));

    await waitFor(() => expect(Clipboard.setStringAsync).toHaveBeenCalledWith('line1\nline2'));
    expect(screen.getByText('Copied')).toBeOnTheScreen();
  });
});
