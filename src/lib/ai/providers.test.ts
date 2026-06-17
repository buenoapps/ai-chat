jest.mock('@ai-sdk/openai', () => {
  const factory = jest.fn(() => ({ id: 'openai-model' }));
  return { createOpenAI: jest.fn(() => factory) };
});
jest.mock('@ai-sdk/anthropic', () => {
  const factory = jest.fn(() => ({ id: 'anthropic-model' }));
  return { createAnthropic: jest.fn(() => factory) };
});
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));

import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { fetch as expoFetch } from 'expo/fetch';

import { resolveModel } from './providers';

const mockedCreateOpenAI = createOpenAI as unknown as jest.Mock;
const mockedCreateAnthropic = createAnthropic as unknown as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('resolveModel', () => {
  it('creates an OpenAI model with the key and streaming fetch', () => {
    const model = resolveModel('openai', 'gpt-4o', 'sk-openai');

    expect(mockedCreateOpenAI).toHaveBeenCalledWith({ apiKey: 'sk-openai', fetch: expoFetch });
    const modelFactory = mockedCreateOpenAI.mock.results[0].value as jest.Mock;
    expect(modelFactory).toHaveBeenCalledWith('gpt-4o');
    expect(model).toEqual({ id: 'openai-model' });
  });

  it('creates an Anthropic model with the key and streaming fetch', () => {
    const model = resolveModel('anthropic', 'claude-sonnet-4-5', 'sk-anthropic');

    expect(mockedCreateAnthropic).toHaveBeenCalledWith({ apiKey: 'sk-anthropic', fetch: expoFetch });
    const modelFactory = mockedCreateAnthropic.mock.results[0].value as jest.Mock;
    expect(modelFactory).toHaveBeenCalledWith('claude-sonnet-4-5');
    expect(model).toEqual({ id: 'anthropic-model' });
  });
});
