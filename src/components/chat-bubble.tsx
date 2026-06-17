import {
  getToolOrDynamicToolName,
  isToolOrDynamicToolUIPart,
  type UIMessage,
} from 'ai';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Markdown } from './markdown';
import {
  FileAttachment,
  ReasoningBlock,
  SourcesList,
  ToolCallCard,
  type Source,
} from './message-parts';
import { ThemedText } from './themed-text';

/** A single chat message bubble; renders every UIMessage part type. */
export function ChatBubble({ message }: { message: UIMessage }) {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const parts = message.parts;

  const images = parts.filter((p) => p.type === 'file' && p.mediaType?.startsWith('image/'));
  const files = parts.filter((p) => p.type === 'file' && !p.mediaType?.startsWith('image/'));
  const text = parts
    .filter((p) => p.type === 'text')
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('');
  const reasoning = parts
    .filter((p) => p.type === 'reasoning')
    .map((p) => (p.type === 'reasoning' ? p.text : ''))
    .join('\n')
    .trim();
  const reasoningStreaming = parts.some((p) => p.type === 'reasoning' && p.state !== 'done');
  const toolParts = parts.filter(isToolOrDynamicToolUIPart);
  const sources: Source[] = parts.flatMap((p) =>
    p.type === 'source-url'
      ? [{ title: p.title || p.url, url: p.url }]
      : p.type === 'source-document'
        ? [{ title: p.title }]
        : [],
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
              key={`img-${i}`}
              source={{ uri: p.url }}
              style={styles.image}
              contentFit="cover"
              transition={150}
            />
          ) : null,
        )}

        {reasoning.length > 0 ? (
          <ReasoningBlock text={reasoning} defaultOpen={reasoningStreaming} />
        ) : null}

        {text.length > 0 ? (
          isUser ? (
            <ThemedText type="default" style={{ color: theme.bubbleUserText }}>
              {text}
            </ThemedText>
          ) : (
            // Assistant responses are rendered as markdown with highlighted code.
            <Markdown content={text} />
          )
        ) : null}

        {toolParts.map((p, i) => (
          <ToolCallCard
            key={`tool-${i}`}
            name={getToolOrDynamicToolName(p)}
            state={p.state}
            input={'input' in p ? p.input : undefined}
            output={'output' in p ? p.output : undefined}
            errorText={'errorText' in p ? p.errorText : undefined}
          />
        ))}

        {files.map((p, i) =>
          p.type === 'file' ? (
            <FileAttachment key={`file-${i}`} url={p.url} filename={p.filename} mediaType={p.mediaType} />
          ) : null,
        )}

        {sources.length > 0 ? <SourcesList sources={sources} /> : null}
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
