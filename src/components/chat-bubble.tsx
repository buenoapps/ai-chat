import type { UIMessage } from 'ai';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

/** A single chat message bubble; renders text and image parts. */
export function ChatBubble({ message }: { message: UIMessage }) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  const text = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('');
  const images = message.parts.filter(
    (p) => p.type === 'file' && p.mediaType?.startsWith('image/'),
  );

  return (
    <View style={[styles.container, isUser ? styles.alignRight : styles.alignLeft]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? theme.bubbleUser : theme.bubbleAssistant,
            borderBottomRightRadius: isUser ? Spacing.one : Spacing.four,
            borderBottomLeftRadius: isUser ? Spacing.four : Spacing.one,
          },
        ]}
      >
        {images.map((p, i) =>
          p.type === 'file' ? (
            <Image
              key={i}
              source={{ uri: p.url }}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
          ) : null,
        )}
        {text.length > 0 ? (
          <ThemedText
            type="default"
            style={{ color: isUser ? theme.bubbleUserText : theme.bubbleAssistantText }}
          >
            {text}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: Spacing.three },
  alignRight: { alignItems: 'flex-end' },
  alignLeft: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    gap: Spacing.two,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: Spacing.three,
  },
});
