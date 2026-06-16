import type { UIMessage } from 'ai';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { generateId } from '@/lib/id';
import { loadChats, saveChats } from '@/lib/storage';
import type { Chat } from '@/lib/types';

type ChatsContextValue = {
  chats: Chat[];
  loading: boolean;
  getChat: (id: string) => Chat | undefined;
  createChat: (providerId?: string) => Chat;
  updateChat: (id: string, patch: Partial<Omit<Chat, 'id'>>) => void;
  setMessages: (id: string, messages: UIMessage[]) => void;
  removeChat: (id: string) => void;
};

const ChatsContext = createContext<ChatsContextValue | null>(null);

/** Derive a short title from the first user message in a conversation. */
export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  const text = firstUser?.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join(' ')
    .trim();
  if (!text) return 'New chat';
  return text.length > 48 ? `${text.slice(0, 48)}…` : text;
}

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setChats(await loadChats());
      setLoading(false);
    })();
  }, []);

  // Persist whenever chats change (after the initial load).
  useEffect(() => {
    if (loading) return;
    saveChats(chats);
  }, [chats, loading]);

  const getChat = useCallback((id: string) => chats.find((c) => c.id === id), [chats]);

  const createChat = useCallback((providerId?: string) => {
    const now = Date.now();
    const chat: Chat = {
      id: generateId(),
      title: 'New chat',
      providerId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setChats((prev) => [chat, ...prev]);
    return chat;
  }, []);

  const updateChat = useCallback((id: string, patch: Partial<Omit<Chat, 'id'>>) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
    );
  }, []);

  const setMessages = useCallback((id: string, messages: UIMessage[]) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const title = c.title === 'New chat' ? deriveTitle(messages) : c.title;
        return { ...c, messages, title, updatedAt: Date.now() };
      }),
    );
  }, []);

  const removeChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({ chats, loading, getChat, createChat, updateChat, setMessages, removeChat }),
    [chats, loading, getChat, createChat, updateChat, setMessages, removeChat],
  );

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}

export function useChats() {
  const ctx = useContext(ChatsContext);
  if (!ctx) throw new Error('useChats must be used within ChatsProvider');
  return ctx;
}
