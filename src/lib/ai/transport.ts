import {
  convertToModelMessages,
  streamText,
  type ChatTransport,
  type UIMessage,
  type UIMessageChunk,
} from 'ai';

import type { ProviderType } from '@/lib/types';
import { resolveModel } from './providers';

/** Resolved configuration for the model that should answer the next message. */
export type ActiveModel = {
  type: ProviderType;
  modelId: string;
  apiKey: string;
  baseUrl?: string;
};

/**
 * A {@link ChatTransport} that runs the model in-process instead of POSTing to
 * an HTTP endpoint. This lets `useChat` talk to the selected provider directly
 * from the device using the user's own API key — no backend required.
 *
 * `getActiveModel` is read lazily on every send so the chat always uses the
 * model currently selected for the conversation.
 */
export class LocalChatTransport implements ChatTransport<UIMessage> {
  constructor(private readonly getActiveModel: () => ActiveModel | null) {}

  async sendMessages({
    messages,
    abortSignal,
  }: Parameters<ChatTransport<UIMessage>['sendMessages']>[0]): Promise<
    ReadableStream<UIMessageChunk>
  > {
    const active = this.getActiveModel();
    if (!active) {
      throw new Error(
        'No model selected. Tap the model button to pick a provider, or add one in Settings.',
      );
    }

    const model = resolveModel(active.type, active.modelId, active.apiKey, active.baseUrl);
    const result = streamText({
      model,
      messages: await convertToModelMessages(messages),
      abortSignal,
    });

    return result.toUIMessageStream();
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    // Streams are not resumable in a fully on-device setup.
    return null;
  }
}
