/**
 * Polyfills required for the Vercel AI SDK to run on React Native / Hermes.
 * This module must be imported before any AI SDK code runs (see app/_layout.tsx).
 */
import 'react-native-get-random-values';
import structuredClonePolyfill from '@ungap/structured-clone';

// Hermes does not always ship `structuredClone`, which the AI SDK relies on
// when cloning UI message chunks while streaming.
if (typeof globalThis.structuredClone !== 'function') {
  (globalThis as { structuredClone: (value: unknown) => unknown }).structuredClone = (
    value: unknown,
  ) => structuredClonePolyfill(value, { lossy: true });
}
