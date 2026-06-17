import type { ProviderType } from '@/lib/types';

export type ModelInfo = {
  id: string;
  label: string;
  /** Accepts image input (multimodal). */
  vision?: boolean;
  /** Native extended reasoning / "thinking" model. */
  thinking?: boolean;
  /** Supports function / tool calling. */
  tools?: boolean;
};

/** Selectable models per provider family, shown when configuring a provider. */
export const MODELS: Record<ProviderType, ModelInfo[]> = {
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o', vision: true, tools: true },
    { id: 'gpt-4o-mini', label: 'GPT-4o mini', vision: true, tools: true },
    { id: 'gpt-4.1', label: 'GPT-4.1', vision: true, tools: true },
    { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini', vision: true, tools: true },
    { id: 'o4-mini', label: 'o4-mini', vision: true, thinking: true, tools: true },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', vision: true, thinking: true, tools: true },
    { id: 'claude-opus-4-1', label: 'Claude Opus 4.1', vision: true, thinking: true, tools: true },
    { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', vision: true, tools: true },
    { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku', vision: true, tools: true },
  ],
  google: [
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', vision: true, thinking: true, tools: true },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', vision: true, thinking: true, tools: true },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', vision: true, tools: true },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', vision: true, tools: true },
  ],
  xai: [
    { id: 'grok-4', label: 'Grok 4', vision: true, thinking: true, tools: true },
    { id: 'grok-3', label: 'Grok 3', vision: true, tools: true },
    { id: 'grok-3-mini', label: 'Grok 3 mini', thinking: true, tools: true },
    { id: 'grok-2-vision-1212', label: 'Grok 2 Vision', vision: true },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', tools: true },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', tools: true },
    { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B', thinking: true },
    { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
  ],
  mistral: [
    { id: 'mistral-large-latest', label: 'Mistral Large', tools: true },
    { id: 'mistral-small-latest', label: 'Mistral Small', vision: true, tools: true },
    { id: 'pixtral-large-latest', label: 'Pixtral Large', vision: true, tools: true },
    { id: 'open-mistral-nemo', label: 'Mistral Nemo', tools: true },
  ],
  deepseek: [
    { id: 'deepseek-chat', label: 'DeepSeek V3 (Chat)', tools: true },
    { id: 'deepseek-reasoner', label: 'DeepSeek R1 (Reasoner)', thinking: true },
  ],
  cohere: [
    { id: 'command-a-03-2025', label: 'Command A', tools: true },
    { id: 'command-r-plus', label: 'Command R+', tools: true },
    { id: 'command-r', label: 'Command R', tools: true },
  ],
  perplexity: [
    { id: 'sonar', label: 'Sonar', vision: true },
    { id: 'sonar-pro', label: 'Sonar Pro', vision: true },
    { id: 'sonar-reasoning', label: 'Sonar Reasoning', vision: true, thinking: true },
    { id: 'sonar-reasoning-pro', label: 'Sonar Reasoning Pro', vision: true, thinking: true },
  ],
  togetherai: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo', tools: true },
    { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', tools: true },
    { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', label: 'Qwen 2.5 72B Turbo', tools: true },
    { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', label: 'Mixtral 8x7B' },
  ],
  fireworks: [
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', label: 'Llama 3.3 70B', tools: true },
    { id: 'accounts/fireworks/models/deepseek-v3', label: 'DeepSeek V3', tools: true },
    { id: 'accounts/fireworks/models/qwen2p5-72b-instruct', label: 'Qwen 2.5 72B', tools: true },
  ],
  deepinfra: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B', tools: true },
    { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', tools: true },
    { id: 'Qwen/Qwen2.5-72B-Instruct', label: 'Qwen 2.5 72B', tools: true },
  ],
  cerebras: [
    { id: 'llama-3.3-70b', label: 'Llama 3.3 70B', tools: true },
    { id: 'llama3.1-8b', label: 'Llama 3.1 8B', tools: true },
    { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B', thinking: true },
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

/** Look up the full info for a provider/model id, if present in the catalog. */
export function findModel(type: ProviderType, modelId: string): ModelInfo | undefined {
  return MODELS[type].find((m) => m.id === modelId);
}

/** Whether the given provider/model accepts image input. */
export function modelSupportsVision(type: ProviderType, modelId: string): boolean {
  return findModel(type, modelId)?.vision ?? false;
}

/** Whether the given provider/model is a native reasoning ("thinking") model. */
export function modelSupportsThinking(type: ProviderType, modelId: string): boolean {
  return findModel(type, modelId)?.thinking ?? false;
}

/** Whether the given provider/model supports function/tool calling. */
export function modelSupportsTools(type: ProviderType, modelId: string): boolean {
  return findModel(type, modelId)?.tools ?? false;
}
