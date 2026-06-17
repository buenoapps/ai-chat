// Each provider package is mocked with a `createX` that returns a model factory
// mapping a model id to a tagged object, so we can assert routing per family.
// The factory is inlined (not a shared helper) because hoisted jest.mock
// factories may not reference out-of-scope variables.
jest.mock('@ai-sdk/openai', () => ({ createOpenAI: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/anthropic', () => ({ createAnthropic: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => jest.fn((id) => ({ id }))),
}));
jest.mock('@ai-sdk/xai', () => ({ createXai: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/groq', () => ({ createGroq: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/mistral', () => ({ createMistral: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/deepseek', () => ({ createDeepSeek: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/cohere', () => ({ createCohere: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/perplexity', () => ({ createPerplexity: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/togetherai', () => ({ createTogetherAI: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/fireworks', () => ({ createFireworks: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/deepinfra', () => ({ createDeepInfra: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('@ai-sdk/cerebras', () => ({ createCerebras: jest.fn(() => jest.fn((id) => ({ id }))) }));
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));

import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { fetch as expoFetch } from 'expo/fetch';

import { PROVIDER_TYPES } from './models';
import { resolveModel } from './providers';
import type { ProviderType } from '@/lib/types';

const createByType: Partial<Record<ProviderType, jest.Mock>> = {
  openai: createOpenAI as unknown as jest.Mock,
  anthropic: createAnthropic as unknown as jest.Mock,
  google: createGoogleGenerativeAI as unknown as jest.Mock,
  groq: createGroq as unknown as jest.Mock,
};

beforeEach(() => jest.clearAllMocks());

describe('resolveModel', () => {
  it('routes a representative provider with the key and streaming fetch', () => {
    const model = resolveModel('openai', 'gpt-4o', 'sk-openai');

    const create = createByType.openai!;
    expect(create).toHaveBeenCalledWith({
      apiKey: 'sk-openai',
      fetch: expoFetch,
      baseURL: undefined,
    });
    expect(create.mock.results[0].value as jest.Mock).toHaveBeenCalledWith('gpt-4o');
    expect(model).toEqual({ id: 'gpt-4o' });
  });

  it.each(Object.keys(createByType) as ProviderType[])(
    'passes the key, fetch and model id through for %s',
    (type) => {
      const model = resolveModel(type, 'some-model', 'the-key');
      const create = createByType[type]!;
      expect(create).toHaveBeenCalledWith({
        apiKey: 'the-key',
        fetch: expoFetch,
        baseURL: undefined,
      });
      expect(model).toEqual({ id: 'some-model' });
    },
  );

  it('forwards a custom base URL when provided', () => {
    resolveModel('openai', 'gpt-4o', 'sk', 'https://proxy.example/v1');
    expect(createByType.openai!).toHaveBeenCalledWith({
      apiKey: 'sk',
      fetch: expoFetch,
      baseURL: 'https://proxy.example/v1',
    });
  });

  it('treats an empty base URL as the provider default (undefined)', () => {
    resolveModel('openai', 'gpt-4o', 'sk', '');
    expect(createByType.openai!).toHaveBeenCalledWith({
      apiKey: 'sk',
      fetch: expoFetch,
      baseURL: undefined,
      headers: undefined,
    });
  });

  it('forwards non-empty custom headers', () => {
    resolveModel('openai', 'gpt-4o', 'sk', undefined, { 'x-org': 'acme' });
    expect(createByType.openai!).toHaveBeenCalledWith({
      apiKey: 'sk',
      fetch: expoFetch,
      baseURL: undefined,
      headers: { 'x-org': 'acme' },
    });
  });

  it('treats an empty headers object as none (undefined)', () => {
    resolveModel('openai', 'gpt-4o', 'sk', undefined, {});
    expect(createByType.openai!).toHaveBeenCalledWith({
      apiKey: 'sk',
      fetch: expoFetch,
      baseURL: undefined,
      headers: undefined,
    });
  });

  it('has a factory wired for every provider type (no throw)', () => {
    for (const type of PROVIDER_TYPES) {
      expect(() => resolveModel(type, 'm', 'k')).not.toThrow();
    }
  });
});
