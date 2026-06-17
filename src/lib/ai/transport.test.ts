jest.mock('ai', () => ({
  streamText: jest.fn(() => ({ toUIMessageStream: () => 'UI_STREAM' })),
  convertToModelMessages: jest.fn(async (messages: unknown) => messages),
}));
jest.mock('./providers', () => ({ resolveModel: jest.fn(() => 'RESOLVED_MODEL') }));

import { convertToModelMessages, streamText } from 'ai';

import { resolveModel } from './providers';
import { LocalChatTransport, type ActiveModel } from './transport';

const mockedStreamText = streamText as unknown as jest.Mock;
const mockedConvert = convertToModelMessages as unknown as jest.Mock;
const mockedResolveModel = resolveModel as unknown as jest.Mock;

beforeEach(() => jest.clearAllMocks());

function sendArgs(messages: unknown[] = []) {
  // The transport only reads `messages`; other fields are required by the type.
  return {
    messages,
    abortSignal: undefined,
    trigger: 'submit-message',
    chatId: 'c1',
    messageId: undefined,
  } as unknown as Parameters<LocalChatTransport['sendMessages']>[0];
}

describe('LocalChatTransport', () => {
  it('throws a helpful error when no model is selected', async () => {
    const transport = new LocalChatTransport(() => null);
    await expect(transport.sendMessages(sendArgs())).rejects.toThrow(/No model selected/);
    expect(mockedStreamText).not.toHaveBeenCalled();
  });

  it('streams text from the resolved model when one is active', async () => {
    const active: ActiveModel = { type: 'openai', modelId: 'gpt-4o', apiKey: 'sk' };
    const transport = new LocalChatTransport(() => active);
    const messages = [{ role: 'user', parts: [] }];

    const stream = await transport.sendMessages(sendArgs(messages));

    expect(mockedResolveModel).toHaveBeenCalledWith('openai', 'gpt-4o', 'sk', undefined);
    expect(mockedConvert).toHaveBeenCalledWith(messages);
    expect(mockedStreamText).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'RESOLVED_MODEL', messages }),
    );
    expect(stream).toBe('UI_STREAM');
  });

  it('forwards a custom base URL to the resolver', async () => {
    const active: ActiveModel = {
      type: 'openai',
      modelId: 'gpt-4o',
      apiKey: 'sk',
      baseUrl: 'https://proxy.example/v1',
    };
    const transport = new LocalChatTransport(() => active);

    await transport.sendMessages(sendArgs([]));

    expect(mockedResolveModel).toHaveBeenCalledWith(
      'openai',
      'gpt-4o',
      'sk',
      'https://proxy.example/v1',
    );
  });

  it('does not support stream reconnection', async () => {
    const transport = new LocalChatTransport(() => null);
    await expect(transport.reconnectToStream()).resolves.toBeNull();
  });
});
