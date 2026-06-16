import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { fetch as expoFetch } from 'expo/fetch';
import type { LanguageModel } from 'ai';

import type { ProviderType } from '@/lib/types';

// expo/fetch supports response streaming on native, which the AI SDK needs to
// stream tokens. Its type differs slightly from the DOM fetch, so we cast.
const streamingFetch = expoFetch as unknown as typeof globalThis.fetch;

/**
 * Build a configured language model for the given provider family, model id and
 * API key. The provider client is created on demand so keys never need to be
 * held in module state.
 */
export function resolveModel(
  type: ProviderType,
  modelId: string,
  apiKey: string,
): LanguageModel {
  switch (type) {
    case 'openai': {
      const openai = createOpenAI({ apiKey, fetch: streamingFetch });
      return openai(modelId);
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey, fetch: streamingFetch });
      return anthropic(modelId);
    }
  }
}
