jest.mock('ai', () => ({
  experimental_generateImage: jest.fn(async () => ({
    image: { base64: 'AAAA', mediaType: 'image/png' },
  })),
}));
jest.mock('./providers', () => ({
  createProvider: jest.fn(() => ({ image: jest.fn((id: string) => ({ id })) })),
}));

import { experimental_generateImage } from 'ai';

import {
  defaultImageModelFor,
  generateChatImage,
  providerSupportsImageGeneration,
} from './images';
import { createProvider } from './providers';

const mockedGenerate = experimental_generateImage as unknown as jest.Mock;
const mockedCreateProvider = createProvider as unknown as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('image generation catalog', () => {
  it('knows which providers can generate images', () => {
    expect(providerSupportsImageGeneration('openai')).toBe(true);
    expect(providerSupportsImageGeneration('xai')).toBe(true);
    expect(providerSupportsImageGeneration('anthropic')).toBe(false);
    expect(providerSupportsImageGeneration('groq')).toBe(false);
  });

  it('returns a default image model only for supported providers', () => {
    expect(defaultImageModelFor('openai')).toBe('gpt-image-1');
    expect(defaultImageModelFor('anthropic')).toBeUndefined();
  });
});

describe('generateChatImage', () => {
  beforeEach(() => {
    mockedCreateProvider.mockReturnValue({ image: jest.fn((id: string) => ({ id })) });
  });

  it('builds a data URL from the generated image', async () => {
    const result = await generateChatImage(
      'openai',
      'gpt-image-1',
      { apiKey: 'sk', baseUrl: 'https://x', headers: { a: 'b' } },
      'a red cat',
    );

    expect(mockedCreateProvider).toHaveBeenCalledWith('openai', {
      apiKey: 'sk',
      baseUrl: 'https://x',
      headers: { a: 'b' },
    });
    expect(mockedGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'a red cat' }),
    );
    expect(result).toEqual({ url: 'data:image/png;base64,AAAA', mediaType: 'image/png' });
  });

  it('throws when the provider has no image model', async () => {
    mockedCreateProvider.mockReturnValueOnce({});
    await expect(
      generateChatImage('openai', 'gpt-image-1', { apiKey: 'sk' }, 'x'),
    ).rejects.toThrow(/does not support image generation/);
  });
});
