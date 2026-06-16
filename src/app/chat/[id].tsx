import { useChat } from '@ai-sdk/react';
import { Ionicons } from '@expo/vector-icons';
import type { FileUIPart } from 'ai';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AttachmentSheet } from '@/components/attachment-sheet';
import { ChatBubble } from '@/components/chat-bubble';
import { ModelPickerSheet } from '@/components/model-picker-sheet';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useChats } from '@/context/chats-context';
import { useProviders } from '@/context/providers-context';
import { useTheme } from '@/hooks/use-theme';
import { MODELS } from '@/lib/ai/models';
import { LocalChatTransport, type ActiveModel } from '@/lib/ai/transport';

export default function ChatScreen() {
  const { id, providerId } = useLocalSearchParams<{ id: string; providerId?: string }>();
  if (id === 'new') return <NewChatRedirect providerId={providerId} />;
  return <Conversation chatId={id} />;
}

/** Creates a fresh chat then redirects to its permanent route. */
function NewChatRedirect({ providerId }: { providerId?: string }) {
  const { createChat } = useChats();
  const router = useRouter();
  const created = useRef(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;
    const chat = createChat(providerId || undefined);
    router.replace({ pathname: '/chat/[id]', params: { id: chat.id } });
  }, [createChat, providerId, router]);

  return (
    <ThemedView style={styles.centered}>
      <ActivityIndicator />
    </ThemedView>
  );
}

function Conversation({ chatId }: { chatId: string }) {
  const theme = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { getChat, setMessages, updateChat } = useChats();
  const { providers, getKey } = useProviders();

  const chat = getChat(chatId);
  const [initialMessages] = useState(() => getChat(chatId)?.messages ?? []);
  const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>(chat?.providerId);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);
  const [attachVisible, setAttachVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Resolve the model + key for the current selection, kept in a ref so the
  // transport always reads the latest value without being recreated.
  const activeModel = useMemo<ActiveModel | null>(() => {
    const p = providers.find((x) => x.id === selectedProviderId);
    const apiKey = p ? getKey(p.id) : undefined;
    if (!p || !apiKey) return null;
    return { type: p.type, modelId: p.model, apiKey };
  }, [providers, selectedProviderId, getKey]);
  const activeModelRef = useRef(activeModel);
  activeModelRef.current = activeModel;

  const transport = useMemo(() => new LocalChatTransport(() => activeModelRef.current), []);

  const { messages, sendMessage, status, error, stop } = useChat({
    id: chatId,
    transport,
    messages: initialMessages,
  });

  // Persist messages whenever the conversation settles (avoids per-token writes).
  useEffect(() => {
    if (status === 'streaming') return;
    if (messages.length === 0) return;
    setMessages(chatId, messages);
  }, [messages, status, chatId, setMessages]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(t);
  }, [messages, status]);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const modelLabel = selectedProvider
    ? (MODELS[selectedProvider.type].find((m) => m.id === selectedProvider.model)?.label ??
      selectedProvider.model)
    : 'Select model';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: chat && chat.title !== 'New chat' ? chat.title : 'Chat',
      headerRight: () => (
        <Pressable
          onPress={() => setPickerVisible(true)}
          style={({ pressed }) => [
            styles.modelChip,
            { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="sparkles-outline" size={14} color={theme.tint} />
          <ThemedText type="small" numberOfLines={1} style={styles.modelChipText}>
            {modelLabel}
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, chat, modelLabel, theme]);

  function chooseProvider(providerId: string) {
    setSelectedProviderId(providerId);
    updateChat(chatId, { providerId });
  }

  function handleSend() {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (!activeModelRef.current) {
      setPickerVisible(true);
      return;
    }
    sendMessage({ text, files: attachments });
    setInput('');
    setAttachments([]);
  }

  const isBusy = status === 'submitted' || status === 'streaming';
  const canSend = (input.trim().length > 0 || attachments.length > 0) && !isBusy;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          keyboardDismissMode="interactive"
        >
          {messages.length === 0 ? (
            <View style={styles.placeholder}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.textSecondary} />
              <ThemedText type="default" themeColor="textSecondary" style={styles.placeholderText}>
                Send a message to start chatting with {modelLabel}.
              </ThemedText>
            </View>
          ) : (
            messages.map((m) => <ChatBubble key={m.id} message={m} />)
          )}
          {status === 'submitted' ? (
            <View style={styles.typing}>
              <ActivityIndicator color={theme.textSecondary} />
            </View>
          ) : null}
        </ScrollView>

        {error ? (
          <View style={[styles.errorBar, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
            <ThemedText type="small" style={{ color: theme.danger, flex: 1 }} numberOfLines={3}>
              {error.message}
            </ThemedText>
          </View>
        ) : null}

        {attachments.length > 0 ? (
          <ScrollView
            horizontal
            style={[styles.thumbBar, { borderTopColor: theme.border }]}
            contentContainerStyle={styles.thumbContent}
            showsHorizontalScrollIndicator={false}
          >
            {attachments.map((a, i) => (
              <View key={i} style={styles.thumbWrap}>
                <Image source={{ uri: a.url }} style={styles.thumb} contentFit="cover" />
                <Pressable
                  onPress={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                  style={[styles.thumbRemove, { backgroundColor: theme.background }]}
                >
                  <Ionicons name="close" size={14} color={theme.text} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View
          style={[
            styles.inputBar,
            { borderTopColor: theme.border, paddingBottom: insets.bottom + Spacing.two },
          ]}
        >
          <Pressable
            onPress={() => setAttachVisible(true)}
            style={styles.iconButton}
            accessibilityLabel="Add attachment"
          >
            <Ionicons name="add-circle-outline" size={28} color={theme.tint} />
          </Pressable>
          <TextInput
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            value={input}
            onChangeText={setInput}
            placeholder="Message"
            placeholderTextColor={theme.textSecondary}
            multiline
          />
          {isBusy ? (
            <Pressable onPress={stop} style={styles.iconButton} accessibilityLabel="Stop">
              <Ionicons name="stop-circle" size={32} color={theme.danger} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              style={styles.iconButton}
              accessibilityLabel="Send"
            >
              <Ionicons
                name="arrow-up-circle"
                size={32}
                color={canSend ? theme.tint : theme.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      <AttachmentSheet
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onPicked={(file) => setAttachments((prev) => [...prev, file])}
      />
      <ModelPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        selectedId={selectedProviderId}
        onSelect={chooseProvider}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messages: { paddingVertical: Spacing.three, gap: Spacing.two, flexGrow: 1 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  placeholderText: { textAlign: 'center' },
  typing: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, alignItems: 'flex-start' },
  errorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
  thumbBar: { borderTopWidth: StyleSheet.hairlineWidth, maxHeight: 92 },
  thumbContent: { padding: Spacing.two, gap: Spacing.two },
  thumbWrap: { position: 'relative' },
  thumb: { width: 64, height: 64, borderRadius: Spacing.two },
  thumbRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconButton: { padding: Spacing.one, justifyContent: 'center', alignItems: 'center', height: 40 },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'ios' ? Spacing.two + 2 : Spacing.two,
    paddingBottom: Platform.OS === 'ios' ? Spacing.two + 2 : Spacing.two,
    fontSize: 16,
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 160,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    borderRadius: Spacing.three,
  },
  modelChipText: { maxWidth: 120 },
});
