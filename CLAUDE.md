@AGENTS.md

# AI Chat — project guide

A fully client-side Expo (React Native) app for chatting with many LLM providers
(every single-API-key `@ai-sdk/*` family — OpenAI, Anthropic, Google, xAI, Groq,
Mistral, DeepSeek, Cohere, Perplexity, Together.ai, Fireworks, DeepInfra,
Cerebras) using the user's own on-device API keys (BYOK). There is no backend.
Targets iOS and Android.

## Commands

- `npm run start` — Expo dev server (`npm run ios` / `npm run android` for a target)
- `npm test` — Jest unit tests (`npm run test:watch` for watch mode)
- `npx tsc --noEmit` — type-check (test files included)
- `npx expo export --platform ios` — Metro bundle check (CI-friendly smoke test)

> `npx expo install` and `npx expo lint` reach Expo's API and fail in restricted
> network sandboxes. Pin Expo package versions from
> `node_modules/expo/bundledNativeModules.json` and install with plain `npm`.

## Architecture

- **Routing:** expo-router (Stack) under `src/app/`. Screens: `index.tsx`
  (chat history + FAB), `chat/[id].tsx` (conversation), `settings/` (menu,
  providers list, provider form).
- **AI:** `src/lib/ai/`. `LocalChatTransport` (`transport.ts`) is a custom
  `ChatTransport` for `useChat` (`@ai-sdk/react`, AI SDK **v6**). Its
  `sendMessages()` runs `streamText()` in-process and returns
  `toUIMessageStream()`. `providers.ts` maps each `ProviderType` to its
  `@ai-sdk/*` `createX({ apiKey, fetch, baseURL })` factory (a `FACTORIES` record
  checked for completeness via `satisfies`), using `expo/fetch` for native
  streaming. Using a provider instance (not a plain model-id string) means calls
  go **directly to the provider, not the Vercel AI Gateway**; optional
  per-provider `baseUrl` and `headers` override the default endpoint and add
  request headers. To add a provider:
  install its package, add a `ProviderType` (`src/lib/types.ts`), a `FACTORIES`
  entry, and a `MODELS`/`PROVIDER_LABELS` entry (`src/lib/ai/models.ts`).
  `convertToModelMessages` is **async** in v6 — `await` it.
- **State:** React contexts in `src/context/` — `ProvidersProvider` (loads keys
  into memory so the transport can read them synchronously) and `ChatsProvider`.
- **Storage:** `src/lib/storage.ts`. Chats + provider metadata in AsyncStorage;
  **API keys only in `expo-secure-store`**, keyed by provider id.
- **Theming:** `src/constants/theme.ts` (`Colors.light`/`Colors.dark`),
  `src/hooks/use-theme.ts`. Components use `ThemedText`/`ThemedView`.
- **Message parts:** `components/chat-bubble.tsx` renders every `UIMessage`
  part type — text, images, `reasoning` (collapsible), `tool-*`/`dynamic-tool`
  (cards), non-image `file` (chip), and `source-url`/`source-document`
  (`SourcesList`); helpers live in `components/message-parts.tsx`. `step-start`
  and `data-*` are intentionally ignored.
- **Markdown:** assistant messages render via `components/markdown.tsx`
  (`react-native-marked` `useMarkdown` + a `Renderer` whose `code()` returns a
  highlighted `CodeBlock` using `react-native-code-highlighter`). User messages
  stay plain text. In jest these libs are mocked (`jest.setup.js`) and the hljs
  style import is stubbed via `moduleNameMapper`.
- **Path alias:** `@/*` → `src/*` (see tsconfig + jest `moduleNameMapper`).

## Conventions

- Images are attached as `FileUIPart`s (data URLs) and sent as vision input via
  `sendMessage({ text, files })`.
- New chats route to `/chat/new`, which creates the chat then `router.replace`s
  to its real id. Empty chats are filtered out of the history list.
- Keep the UI minimal; reuse `Spacing`, `Colors`, and the themed primitives.

## Testing notes

- Stack: `jest-expo` + React Native Testing Library (**v14, async API** —
  `await render(...)`, `await fireEvent...`, `await renderHook(...)`, and
  `await act(async () => ...)`).
- Native modules and `@/hooks/use-color-scheme` are mocked in `jest.setup.js`;
  CSS imports are stubbed via `jest/css-stub.js`.
- `jest.mock` factories must not reference outer variables unless they are
  prefixed with `mock`; for module mocks, define impls inside the factory and
  import the mocked module to assert (ES imports are hoisted above `const`s).
- Tests are co-located next to the code as `<name>.test.ts(x)` (e.g.
  `src/lib/id.test.ts`). App screens (`src/app/`) and `*.test.*` files are
  excluded from coverage.
