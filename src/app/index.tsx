import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Fab } from '@/components/fab';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useChats } from '@/context/chats-context';
import { useProviders } from '@/context/providers-context';
import { useTheme } from '@/hooks/use-theme';
import type { Chat } from '@/lib/types';

function lastMessagePreview(chat: Chat): string {
  const last = chat.messages[chat.messages.length - 1];
  if (!last) return 'No messages yet';
  const text = last.parts
    .map((p) => (p.type === 'text' ? p.text : p.type === 'file' ? '📎 Attachment' : ''))
    .join(' ')
    .trim();
  return text || 'No messages yet';
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(ts).toLocaleDateString();
}

export default function ChatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { chats } = useChats();
  const { providers } = useProviders();

  // Hide brand-new, empty conversations the user never sent a message in.
  const sorted = useMemo(
    () => chats.filter((c) => c.messages.length > 0).sort((a, b) => b.updatedAt - a.updatedAt),
    [chats],
  );

  function startNewChat() {
    const lastUsed = sorted.find((c) => c.providerId)?.providerId;
    const providerId = lastUsed ?? providers[0]?.id ?? '';
    router.push({ pathname: '/chat/[id]', params: { id: 'new', providerId } });
  }

  return (
    <ThemedView style={styles.container}>
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={56} color={theme.textSecondary} />
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No chats yet
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
            Tap the + button to start a new conversation.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
              ]}
            >
              <View style={styles.rowText}>
                <ThemedText type="default" numberOfLines={1} style={styles.rowTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {lastMessagePreview(item)}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary">
                {relativeTime(item.updatedAt)}
              </ThemedText>
            </Pressable>
          )}
        />
      )}

      <Fab onPress={startNewChat} accessibilityLabel="New chat" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.three, gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '600' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  emptyTitle: { marginTop: Spacing.two },
  emptyText: { textAlign: 'center' },
});
