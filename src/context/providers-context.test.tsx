import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ProvidersProvider, useProviders } from './providers-context';
import { getApiKey } from '@/lib/storage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ProvidersProvider>{children}</ProvidersProvider>
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('ProvidersProvider', () => {
  it('adds a provider, stores its key securely and exposes it via getKey', async () => {
    const { result } = await renderHook(() => useProviders(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id = '';
    await act(async () => {
      const p = await result.current.addProvider(
        {
          name: 'Work',
          type: 'openai',
          model: 'gpt-4o',
          baseUrl: 'https://proxy.example/v1',
          headers: { 'x-org': 'acme' },
        },
        'sk-123',
      );
      id = p.id;
    });

    expect(result.current.providers).toHaveLength(1);
    expect(result.current.providers[0].baseUrl).toBe('https://proxy.example/v1');
    expect(result.current.providers[0].headers).toEqual({ 'x-org': 'acme' });
    expect(result.current.getKey(id)).toBe('sk-123');
    expect(await getApiKey(id)).toBe('sk-123');
  });

  it('updates a provider and optionally replaces the key', async () => {
    const { result } = await renderHook(() => useProviders(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id = '';
    await act(async () => {
      id = (await result.current.addProvider({ name: 'A', type: 'openai', model: 'gpt-4o' }, 'k1')).id;
    });
    await act(async () => {
      await result.current.updateProvider(
        id,
        { name: 'B', type: 'anthropic', model: 'claude-sonnet-4-5' },
        'k2',
      );
    });

    const updated = result.current.providers.find((p) => p.id === id);
    expect(updated?.name).toBe('B');
    expect(updated?.type).toBe('anthropic');
    expect(result.current.getKey(id)).toBe('k2');
  });

  it('removes a provider and its stored key', async () => {
    const { result } = await renderHook(() => useProviders(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let id = '';
    await act(async () => {
      id = (await result.current.addProvider({ name: 'A', type: 'openai', model: 'gpt-4o' }, 'k1')).id;
    });
    await act(async () => {
      await result.current.removeProvider(id);
    });

    expect(result.current.providers).toHaveLength(0);
    expect(result.current.getKey(id)).toBeUndefined();
    expect(await getApiKey(id)).toBeNull();
  });
});
