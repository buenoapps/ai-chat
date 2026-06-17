import { MODELS, PROVIDER_LABELS, PROVIDER_TYPES, defaultModelFor } from './models';

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
});
