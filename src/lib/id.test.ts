import { generateId } from './id';

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('returns unique values across many calls', () => {
    const ids = new Set(Array.from({ length: 200 }, () => generateId()));
    expect(ids.size).toBe(200);
  });

  it('falls back to a timestamp/random id when crypto.randomUUID is unavailable', () => {
    const original = globalThis.crypto;
    // @ts-expect-error - intentionally removing crypto for the fallback path
    delete globalThis.crypto;
    try {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });
});
