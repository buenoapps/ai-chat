import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import type { Chat, Provider } from './types';

const PROVIDERS_KEY = 'aichat.providers';
const CHATS_KEY = 'aichat.chats';
const keyForProvider = (providerId: string) => `aichat_key_${providerId}`;

// ---------------------------------------------------------------------------
// Providers (metadata in AsyncStorage, secrets in SecureStore)
// ---------------------------------------------------------------------------

export async function loadProviders(): Promise<Provider[]> {
  const raw = await AsyncStorage.getItem(PROVIDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Provider[];
  } catch {
    return [];
  }
}

export async function saveProviders(providers: Provider[]): Promise<void> {
  await AsyncStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
}

/** SecureStore keys must be alphanumeric plus ".", "-", "_". Ids are uuids, so they are safe. */
export async function getApiKey(providerId: string): Promise<string | null> {
  return SecureStore.getItemAsync(keyForProvider(providerId));
}

export async function setApiKey(providerId: string, apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(keyForProvider(providerId), apiKey);
}

export async function deleteApiKey(providerId: string): Promise<void> {
  await SecureStore.deleteItemAsync(keyForProvider(providerId));
}

// ---------------------------------------------------------------------------
// Chats
// ---------------------------------------------------------------------------

export async function loadChats(): Promise<Chat[]> {
  const raw = await AsyncStorage.getItem(CHATS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Chat[];
  } catch {
    return [];
  }
}

export async function saveChats(chats: Chat[]): Promise<void> {
  await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}
