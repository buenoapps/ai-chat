import type { ProviderType } from '@/lib/types';

export type ModelInfo = { id: string; label: string; vision?: boolean };

/** Selectable models per provider family, shown when configuring a provider.
 * `vision: true` marks models that accept image input (multimodal). */
export const MODELS: Record<ProviderType, ModelInfo[]> = {
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o', vision: true },
    { id: 'gpt-4o-mini', label: 'GPT-4o mini', vision: true },
    { id: 'gpt-4.1', label: 'GPT-4.1', vision: true },
    { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini', vision: true },
    { id: 'o4-mini', label: 'o4-mini', vision: true },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', vision: true },
    { id: 'claude-opus-4-1', label: 'Claude Opus 4.1', vision: true },
    { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', vision: true },
    { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku', vision: true },
  ],
  google: [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', vision: true },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', vision: true },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', vision: true },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', vision: true },
  ],
  xai: [
    { id: 'grok-4', label: 'Grok 4', vision: true },
    { id: 'grok-3', label: 'Grok 3', vision: true },
    { id: 'grok-3-mini', label: 'Grok 3 mini' },
    { id: 'grok-2-vision-1212', label: 'Grok 2 Vision', vision: true },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
    { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B' },
    { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
  ],
  mistral: [
    { id: 'mistral-large-latest', label: 'Mistral Large' },
    { id: 'mistral-small-latest', label: 'Mistral Small', vision: true },
    { id: 'pixtral-large-latest', label: 'Pixtral Large', vision: true },
    { id: 'open-mistral-nemo', label: 'Mistral Nemo' },
  ],
  deepseek: [
    { id: 'deepseek-chat', label: 'DeepSeek V3 (Chat)' },
    { id: 'deepseek-reasoner', label: 'DeepSeek R1 (Reasoner)' },
  ],
  cohere: [
    { id: 'command-a-03-2025', label: 'Command A' },
    { id: 'command-r-plus', label: 'Command R+' },
    { id: 'command-r', label: 'Command R' },
  ],
  perplexity: [
    { id: 'sonar', label: 'Sonar', vision: true },
    { id: 'sonar-pro', label: 'Sonar Pro', vision: true },
    { id: 'sonar-reasoning', label: 'Sonar Reasoning', vision: true },
    { id: 'sonar-reasoning-pro', label: 'Sonar Reasoning Pro', vision: true },
  ],
  togetherai: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo' },
    { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
    { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', label: 'Qwen 2.5 72B Turbo' },
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B' },
  ],
  fireworks: [
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', label: 'Llama 3.3 70B' },
    { id: 'accounts/fireworks/models/deepseek-v3', label: 'DeepSeek V3' },
    { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', label: 'Qwen 2.5 72B' },
  ],
  deepinfra: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B' },
    { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3' },
    { id: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B' },
  ],
  cerebras: [
    { id: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
    { id: 'llama3.1-8b', label: 'Llama 3.1 8B' },
    { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B' },
  ],
};

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  xai: 'xAI',
  groq: 'Groq',
  mistral: 'Mistral',
  deepseek: 'DeepSeek',
  cohere: 'Cohere',
  perplexity: 'Perplexity',
  togetherai: 'Together.ai',
  fireworks: 'Fireworks',
  deepinfra: 'DeepInfra',
  cerebras: 'Cerebras',
};

/** Provider families in the order they should appear in pickers. */
export const PROVIDER_TYPES = Object.keys(MODELS) as ProviderType[];

export function defaultModelFor(type: ProviderType): string {
  return MODELS[type][0].id;
}

/** Whether the given provider/model accepts image input. */
export function modelSupportsVision(type: ProviderType, modelId: string): boolean {
  return MODELS[type].find((m) => m.id === modelId)?.vision ?? false;
}
