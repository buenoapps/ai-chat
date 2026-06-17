import {
  MODELS,
  PROVIDER_LABELS,
  PROVIDER_TYPES,
  defaultModelFor,
  findModel,
  modelSupportsThinking,
  modelSupportsTools,
  modelSupportsVision,
} from './models';

describe('models catalog', () => {
  it('lists several provider families', () => {
    expect(PROVIDER_TYPES.length).toBeGreaterThanOrEqual(13);
  });

  it('exposes at least one model for every provider type', () => {
    for (const type of PROVIDER_TYPES) {
      expect(MODELS[type].length).toBeGreaterThan(0);
    }
  });

  it('uses unique, non-empty model ids and labels for every provider', () => {
    for (const type of PROVIDER_TYPES) {
      const ids = MODELS[type].map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const m of MODELS[type]) {
        expect(m.id).toBeTruthy();
        expect(m.label).toBeTruthy();
      }
    }
  });

  it('provides a human label for every provider type', () => {
    for (const type of PROVIDER_TYPES) {
      expect(PROVIDER_LABELS[type]).toBeTruthy();
    }
    expect(PROVIDER_LABELS.openai).toBe('OpenAI');
    expect(PROVIDER_LABELS.anthropic).toBe('Anthropic');
    expect(PROVIDER_LABELS.google).toBe('Google');
  });

  it('defaultModelFor returns the first model of a provider', () => {
    for (const type of PROVIDER_TYPES) {
      expect(defaultModelFor(type)).toBe(MODELS[type][0].id);
    }
  });

  describe('modelSupportsVision', () => {
    it('reports vision for multimodal models', () => {
      expect(modelSupportsVision('openai', 'gpt-4o')).toBe(true);
      expect(modelSupportsVision('anthropic', 'claude-3-5-haiku-latest')).toBe(true);
      expect(modelSupportsVision('google', 'gemini-2.5-pro')).toBe(true);
      expect(modelSupportsVision('perplexity', 'sonar')).toBe(true);
      expect(modelSupportsVision('mistral', 'pixtral-large-latest')).toBe(true);
    });

    it('reports no vision for text-only models', () => {
      expect(modelSupportsVision('groq', 'llama-3.3-70b-versatile')).toBe(false);
      expect(modelSupportsVision('deepseek', 'deepseek-chat')).toBe(false);
      expect(modelSupportsVision('togetherai', 'Qwen/Qwen2.5-72B-Instruct-Turbo')).toBe(false);
      expect(modelSupportsVision('cohere', 'command-a-03-2025')).toBe(false);
    });

    it('returns false for an unknown model id', () => {
      expect(modelSupportsVision('openai', 'no-such-model')).toBe(false);
    });
  });

  describe('modelSupportsThinking', () => {
    it('reports thinking for reasoning models', () => {
      expect(modelSupportsThinking('openai', 'o4-mini')).toBe(true);
      expect(modelSupportsThinking('anthropic', 'claude-sonnet-4-5')).toBe(true);
      expect(modelSupportsThinking('deepseek', 'deepseek-reasoner')).toBe(true);
      expect(modelSupportsThinking('perplexity', 'sonar-reasoning')).toBe(true);
    });

    it('reports no thinking for plain chat models', () => {
      expect(modelSupportsThinking('openai', 'gpt-4o')).toBe(false);
      expect(modelSupportsThinking('deepseek', 'deepseek-chat')).toBe(false);
    });
  });

  describe('modelSupportsTools', () => {
    it('reports tool support for function-calling models', () => {
      expect(modelSupportsTools('openai', 'gpt-4o')).toBe(true);
      expect(modelSupportsTools('anthropic', 'claude-3-5-haiku-latest')).toBe(true);
      expect(modelSupportsTools('groq', 'llama-3.3-70b-versatile')).toBe(true);
    });

    it('reports no tools for search/reasoning-only models', () => {
      expect(modelSupportsTools('perplexity', 'sonar')).toBe(false);
      expect(modelSupportsTools('deepseek', 'deepseek-reasoner')).toBe(false);
    });
  });

  describe('findModel', () => {
    it('returns the catalog entry or undefined', () => {
      expect(findModel('openai', 'gpt-4o')?.label).toBe('GPT-4o');
      expect(findModel('openai', 'nope')).toBeUndefined();
    });
  });
});
