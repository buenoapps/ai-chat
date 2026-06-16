/**
 * Small collision-resistant id generator. `react-native-get-random-values`
 * (imported in polyfills) makes `crypto.getRandomValues` available, so we use
 * `crypto.randomUUID` when present and fall back to a timestamp + random string.
 */
export function generateId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
