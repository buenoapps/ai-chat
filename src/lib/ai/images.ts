import { experimental_generateImage as generateImage } from 'ai';

import type { ModelInfo } from './models';
import { createProvider, type ProviderConnection } from './providers';
import type { ProviderType } from '@/lib/types';

/**
 * Image-generation models per provider family, for providers that expose an
 * image model with a single API key. Ids are a curated starting point and can
 * be adjusted as providers change.
 */
export const IMAGE_MODELS: Partial<Record<ProviderType, ModelInfo[]>> = {
  openai: [
    { id: 'gpt-image-1', label: 'GPT Image 1' },
    { id: 'dall-e-3', label: 'DALL·E 3' },
  ],
  xai: [{ id: 'grok-2-image', label: 'Grok 2 Image' }],
  fireworks: [
    { id: 'accounts/fireworks/models/flux-1-schnell-fp8', label: 'FLUX.1 schnell' },
  ],
  togetherai: [{ id: 'black-forest-labs/FLUX.1-schnell-Free', label: 'FLUX.1 schnell' }],
  deepinfra: [{ id: 'black-forest-labs/FLUX-1-schnell', label: 'FLUX.1 schnell' }],
};

export function providerSupportsImageGeneration(type: ProviderType): boolean {
  return (IMAGE_MODELS[type]?.length ?? 0) > 0;
}

export function defaultImageModelFor(type: ProviderType): string | undefined {
  return IMAGE_MODELS[type]?.[0]?.id;
}

/** Generate an image and return it as a data URL plus its media type. */
export async function generateChatImage(
  type: ProviderType,
  modelId: string,
  conn: ProviderConnection,
  prompt: string,
  abortSignal?: AbortSignal,
): Promise<{ url: string; mediaType: string }> {
  const provider = createProvider(type, conn);
  if (!provider.image) {
    throw new Error('The selected provider does not support image generation.');
  }
  const { image } = await generateImage({ model: provider.image(modelId), prompt, abortSignal });
  return { url: `data:${image.mediaType};base64,${image.base64}`, mediaType: image.mediaType };
}
