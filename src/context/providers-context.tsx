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
import {
  deleteApiKey,
  getApiKey,
  loadProviders,
  saveProviders,
  setApiKey,
} from '@/lib/storage';
import type { Provider, ProviderType } from '@/lib/types';

export type ProviderInput = {
  name: string;
  type: ProviderType;
  model: string;
  baseUrl?: string;
  headers?: Record<string, string>;
};

type ProvidersContextValue = {
  providers: Provider[];
  loading: boolean;
  addProvider: (input: ProviderInput, apiKey: string) => Promise<Provider>;
  updateProvider: (id: string, input: ProviderInput, apiKey?: string) => Promise<void>;
  removeProvider: (id: string) => Promise<void>;
  /** Synchronous access to a stored key (loaded into memory on mount). */
  getKey: (id: string) => string | undefined;
};

const ProvidersContext = createContext<ProvidersContextValue | null>(null);

export function ProvidersProvider({ children }: { children: ReactNode }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await loadProviders();
      setProviders(stored);
      const entries = await Promise.all(
        stored.map(async (p) => [p.id, (await getApiKey(p.id)) ?? ''] as const),
      );
      setKeys(Object.fromEntries(entries.filter(([, v]) => v)));
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: Provider[]) => {
    setProviders(next);
    await saveProviders(next);
  }, []);

  const addProvider = useCallback(
    async (input: ProviderInput, apiKey: string) => {
      const provider: Provider = { id: generateId(), createdAt: Date.now(), ...input };
      await setApiKey(provider.id, apiKey);
      setKeys((k) => ({ ...k, [provider.id]: apiKey }));
      await persist([provider, ...providers]);
      return provider;
    },
    [persist, providers],
  );

  const updateProvider = useCallback(
    async (id: string, input: ProviderInput, apiKey?: string) => {
      if (apiKey !== undefined && apiKey.length > 0) {
        await setApiKey(id, apiKey);
        setKeys((k) => ({ ...k, [id]: apiKey }));
      }
      await persist(providers.map((p) => (p.id === id ? { ...p, ...input } : p)));
    },
    [persist, providers],
  );

  const removeProvider = useCallback(
    async (id: string) => {
      await deleteApiKey(id);
      setKeys((k) => {
        const next = { ...k };
        delete next[id];
        return next;
      });
      await persist(providers.filter((p) => p.id !== id));
    },
    [persist, providers],
  );

  const getKey = useCallback((id: string) => keys[id], [keys]);

  const value = useMemo(
    () => ({ providers, loading, addProvider, updateProvider, removeProvider, getKey }),
    [providers, loading, addProvider, updateProvider, removeProvider, getKey],
  );

  return <ProvidersContext.Provider value={value}>{children}</ProvidersContext.Provider>;
}

export function useProviders() {
  const ctx = useContext(ProvidersContext);
  if (!ctx) throw new Error('useProviders must be used within ProvidersProvider');
  return ctx;
}
