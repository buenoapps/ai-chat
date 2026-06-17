import { createAnthropic } from '@ai-sdk/anthropic';
import { createCerebras } from '@ai-sdk/cerebras';
import { createCohere } from '@ai-sdk/cohere';
import { createDeepInfra } from '@ai-sdk/deepinfra';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createFireworks } from '@ai-sdk/fireworks';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createPerplexity } from '@ai-sdk/perplexity';
import { createTogetherAI } from '@ai-sdk/togetherai';
import { createXai } from '@ai-sdk/xai';
import { fetch as expoFetch } from 'expo/fetch';
import type { ImageModel, LanguageModel } from 'ai';

import type { ProviderType } from '@/lib/types';

// expo/fetch supports response streaming on native, which the AI SDK needs to
// stream tokens. Its type differs slightly from the DOM fetch, so we cast.
const streamingFetch = expoFetch as unknown as typeof globalThis.fetch;

/**
 * Provider factories keyed by family. Each `@ai-sdk/*` factory accepts the same
 * `{ apiKey, fetch }` options and returns a callable that maps a model id to a
 * language model, so they can be treated uniformly. `satisfies` guarantees every
 * `ProviderType` has a factory (a missing one is a compile error).
 */
const FACTORIES = {
  openai: createOpenAI,
  anthropic: createAnthropic,
  google: createGoogleGenerativeAI,
  xai: createXai,
  groq: createGroq,
  mistral: createMistral,
  deepseek: createDeepSeek,
  cohere: createCohere,
  perplexity: createPerplexity,
  togetherai: createTogetherAI,
  fireworks: createFireworks,
  deepinfra: createDeepInfra,
  cerebras: createCerebras,
} satisfies Record<ProviderType, unknown>;

export type ProviderConnection = {
  apiKey: string;
  baseUrl?: string;
  headers?: Record<string, string>;
};

/** A provider instance: callable for language models, with an optional image model factory. */
type ProviderInstance = ((modelId: string) => LanguageModel) & {
  image?: (modelId: string) => ImageModel;
};

type ProviderFactory = (opts: {
  apiKey: string;
  fetch: typeof globalThis.fetch;
  baseURL?: string;
  headers?: Record<string, string>;
}) => ProviderInstance;

/**
 * Create a configured provider instance for the given family. The client is
 * created on demand so keys never need to be held in module state. An optional
 * `baseUrl` overrides the provider's default endpoint (proxies, self-hosted /
 * compatible gateways, regional hosts); optional `headers` are sent on every
 * request (org routing, beta flags, proxy auth, …).
 */
export function createProvider(type: ProviderType, conn: ProviderConnection): ProviderInstance {
  const create = FACTORIES[type] as ProviderFactory;
  return create({
    apiKey: conn.apiKey,
    fetch: streamingFetch,
    baseURL: conn.baseUrl || undefined,
    headers: conn.headers && Object.keys(conn.headers).length > 0 ? conn.headers : undefined,
  });
}

/** Build a configured language model for the given provider family and model id. */
export function resolveModel(
  type: ProviderType,
  modelId: string,
  apiKey: string,
  baseUrl?: string,
  headers?: Record<string, string>,
): LanguageModel {
  return createProvider(type, { apiKey, baseUrl, headers })(modelId);
}
