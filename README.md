# AI Chat

A modern, minimal Expo (React Native) app for chatting with multiple LLM
providers — **OpenAI** and **Anthropic** — using your own API keys. Configure
as many provider/model entries as you like, switch between them per chat, attach
images, and keep your full chat history on device.

> **Bring your own key (BYOK):** This app has no backend. Your API keys are
> stored securely on the device and used to call the provider APIs directly.
> Because there is no proxy, keys are only as protected as the device they live
> on. The app targets **iOS and Android** (Anthropic's API is blocked by CORS in
> the browser, so web is out of scope).

## Features

- **Chat history** on the start screen; reopen any past conversation. A floating
  action button starts a new chat.
- **Streaming chat** powered by the [Vercel AI SDK](https://ai-sdk.dev) —
  `useChat` from `@ai-sdk/react` with a custom on-device transport.
- **Multiple providers & models.** Save several OpenAI/Anthropic configurations,
  each with its own model and key. Pick one per chat from a half-screen sheet.
- **Image attachments** via Camera, Photo Library, or Files — sent to
  vision-capable models as multimodal input.
- **Light & dark mode**, following the system appearance.
- **Settings**: manage providers/models, share the app, rate the app, and view
  the current version/build number.

## Architecture

Because the app is fully client-side, `useChat` is given a custom
[`ChatTransport`](https://ai-sdk.dev/docs/ai-sdk-ui/transport) — `LocalChatTransport`
(`src/lib/ai/transport.ts`) — instead of an HTTP endpoint. Its `sendMessages()`
runs `streamText()` in-process with the selected provider/model + key and returns
`result.toUIMessageStream()`. Provider clients are created with `expo/fetch` so
token streaming works on native.

| Area | Location |
| --- | --- |
| Routing (expo-router Stack) | `src/app/_layout.tsx` |
| Chat history + FAB | `src/app/index.tsx` |
| Chat screen (messages, input, attachments, model picker) | `src/app/chat/[id].tsx` |
| Settings | `src/app/settings/` |
| AI transport / providers / models | `src/lib/ai/` |
| Persistence (AsyncStorage + SecureStore) | `src/lib/storage.ts` |
| State (providers, chats) | `src/context/` |
| Theming | `src/constants/theme.ts`, `src/hooks/use-theme.ts` |

Chats and provider metadata are stored in `AsyncStorage`; **API keys are stored
separately in `expo-secure-store`**, never in plain storage.

## Getting started

```bash
npm install
npx expo start
```

Then open the project in the Expo Go app or a dev build / simulator (press `i`
for iOS, `a` for Android).

> Some native modules (`expo-secure-store`, `expo-image-picker`) require a
> development build rather than Expo Go for full functionality. Build one with
> `npx expo run:ios` / `npx expo run:android` or EAS.

## Using the app

1. Open **Settings** (gear icon, top-right) → **Providers & Models** → **+** to
   add an OpenAI or Anthropic provider with a name, model, and API key.
2. From the start screen, tap the **+** FAB to start a new chat.
3. Tap the model chip in the chat header to choose which saved model answers.
4. Tap **+** in the input bar to attach an image from the camera, photo library,
   or files. Send a message and watch the response stream in.

## Scripts

- `npm run start` — start the dev server
- `npm run ios` / `npm run android` — start on a simulator/device
- `npx tsc --noEmit` — type-check
