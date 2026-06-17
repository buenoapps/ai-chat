import { MODELS, PROVIDER_LABELS, defaultModelFor } from './models';

describe('models catalog', () => {
  it('exposes models for each provider type', () => {
    expect(MODELS.openai.length).toBeGreaterThan(0);
    expect(MODELS.anthropic.length).toBeGreaterThan(0);
  });

  it('uses unique, non-empty model ids and labels', () => {
    for (const type of ['openai', 'anthropic'] as const) {
      const ids = MODELS[type].map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const m of MODELS[type]) {
        expect(m.id).toBeTruthy();
        expect(m.label).toBeTruthy();
      }
    }
  });

  it('provides a human label for each provider', () => {
    expect(PROVIDER_LABELS.openai).toBe('OpenAI');
    expect(PROVIDER_LABELS.anthropic).toBe('Anthropic');
  });

  it('defaultModelFor returns the first model of a provider', () => {
    expect(defaultModelFor('openai')).toBe(MODELS.openai[0].id);
    expect(defaultModelFor('anthropic')).toBe(MODELS.anthropic[0].id);
  });
});
