// Ambient module declarations for assets and untyped packages.
declare module '*.css';

declare module '@ungap/structured-clone' {
  export default function structuredClone<T>(value: T, options?: { lossy?: boolean }): T;
}
