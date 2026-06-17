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
import type { LanguageModel } from 'ai';

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

type ModelFactory = (opts: {
  apiKey: string;
  fetch: typeof globalThis.fetch;
  baseURL?: string;
}) => (modelId: string) => LanguageModel;

/**
 * Build a configured language model for the given provider family, model id and
 * API key. The provider client is created on demand so keys never need to be
 * held in module state. An optional `baseUrl` overrides the provider's default
 * endpoint (for proxies, self-hosted/compatible gateways, or regional hosts);
 * when omitted the provider's own default base URL is used.
 */
export function resolveModel(
  type: ProviderType,
  modelId: string,
  apiKey: string,
  baseUrl?: string,
): LanguageModel {
  const create = FACTORIES[type] as ModelFactory;
  return create({ apiKey, fetch: streamingFetch, baseURL: baseUrl || undefined })(modelId);
}
