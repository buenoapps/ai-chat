import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  deleteApiKey,
  getApiKey,
  loadChats,
  loadProviders,
  saveChats,
  saveProviders,
  setApiKey,
} from './storage';
import type { Chat, Provider } from './types';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const provider: Provider = {
  id: 'p1',
  name: 'My OpenAI',
  type: 'openai',
  model: 'gpt-4o',
  createdAt: 1,
};

describe('providers storage', () => {
  it('returns an empty array when nothing is stored', async () => {
    expect(await loadProviders()).toEqual([]);
  });

  it('round-trips providers through AsyncStorage', async () => {
    await saveProviders([provider]);
    expect(await loadProviders()).toEqual([provider]);
  });

  it('returns an empty array when stored JSON is corrupt', async () => {
    await AsyncStorage.setItem('aichat.providers', '{not json');
    expect(await loadProviders()).toEqual([]);
  });
});

describe('api keys (secure store)', () => {
  it('stores, reads and deletes a key', async () => {
    expect(await getApiKey('p1')).toBeNull();
    await setApiKey('p1', 'sk-secret');
    expect(await getApiKey('p1')).toBe('sk-secret');
    await deleteApiKey('p1');
    expect(await getApiKey('p1')).toBeNull();
  });
});

describe('chats storage', () => {
  const chat: Chat = {
    id: 'c1',
    title: 'Hello',
    messages: [],
    createdAt: 1,
    updatedAt: 2,
  };

  it('round-trips chats', async () => {
    expect(await loadChats()).toEqual([]);
    await saveChats([chat]);
    expect(await loadChats()).toEqual([chat]);
  });
});
