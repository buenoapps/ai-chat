import type { FileUIPart } from 'ai';

/**
 * Convert a local file URI (file://, content://) into a base64 data URL.
 * React Native's fetch can read local URIs into a Blob, and FileReader turns
 * that Blob into a data URL — avoiding an extra filesystem dependency.
 */
export async function uriToDataUrl(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

/** Build a UI file part for an image from a data URL. */
export function imagePart(dataUrl: string, mediaType: string, filename?: string): FileUIPart {
  return { type: 'file', mediaType, url: dataUrl, filename };
}
