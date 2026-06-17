import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UIMessage } from 'ai';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ChatsProvider, deriveTitle, useChats } from './chats-context';

function userMessage(text: string): UIMessage {
  return { id: 'm1', role: 'user', parts: [{ type: 'text', text }] };
}

describe('deriveTitle', () => {
  it('returns a placeholder when there are no messages', () => {
    expect(deriveTitle([])).toBe('New chat');
  });

  it('uses the first user message text', () => {
    expect(deriveTitle([userMessage('Hello there')])).toBe('Hello there');
  });

  it('truncates long titles', () => {
    const long = 'a'.repeat(80);
    const title = deriveTitle([userMessage(long)]);
    expect(title.endsWith('…')).toBe(true);
    expect(title.length).toBeLessThanOrEqual(49);
  });
});

describe('ChatsProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChatsProvider>{children}</ChatsProvider>
  );

  it('creates a chat and persists it', async () => {
    const { result } = await renderHook(() => useChats(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id = '';
    await act(async () => {
      id = result.current.createChat('provider-1').id;
    });

    expect(result.current.chats).toHaveLength(1);
    expect(result.current.getChat(id)?.providerId).toBe('provider-1');
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem('aichat.chats');
      expect(raw).toContain(id);
    });
  });

  it('derives the title from the first message via setMessages', async () => {
    const { result } = await renderHook(() => useChats(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id = '';
    await act(async () => {
      id = result.current.createChat().id;
    });
    await act(async () => {
      result.current.setMessages(id, [userMessage('What is the weather?')]);
    });

    expect(result.current.getChat(id)?.title).toBe('What is the weather?');
  });

  it('removes a chat', async () => {
    const { result } = await renderHook(() => useChats(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id = '';
    await act(async () => {
      id = result.current.createChat().id;
    });
    await act(async () => {
      result.current.removeChat(id);
    });

    expect(result.current.chats).toHaveLength(0);
  });
});
