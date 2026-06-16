import type { UIMessage } from 'ai';

/** Supported LLM provider families. */
export type ProviderType = 'openai' | 'anthropic';

/**
 * A user-configured provider entry. Each entry pairs a provider family with a
 * single model and an API key. The API key itself is never stored here — it
 * lives in expo-secure-store, keyed by this entry's `id`.
 */
export type Provider = {
  id: string;
  /** Friendly display name, e.g. "Work OpenAI" or "Claude". */
  name: string;
  type: ProviderType;
  /** Provider model id, e.g. "gpt-4o" or "claude-3-5-sonnet-latest". */
  model: string;
  createdAt: number;
};

/** A persisted chat conversation. */
export type Chat = {
  id: string;
  title: string;
  /** The provider entry selected for this chat (may be undefined until picked). */
  providerId?: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
};
