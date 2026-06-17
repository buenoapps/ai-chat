import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

function pretty(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

/** Collapsible, dimmed reasoning ("thinking") block shown above the answer. */
export function ReasoningBlock({ text, defaultOpen = false }: { text: string; defaultOpen?: boolean }) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={[styles.block, { borderColor: theme.border }]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.blockHeader} accessibilityRole="button">
        <Ionicons name="sparkles-outline" size={14} color={theme.textSecondary} />
        <ThemedText type="small" themeColor="textSecondary" style={styles.flex}>
          Reasoning
        </ThemedText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textSecondary} />
      </Pressable>
      {open ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.reasoningText}>
          {text}
        </ThemedText>
      ) : null}
    </View>
  );
}

/** A generic tool-call card (name, state, input/output). Future-proof; unused until tools are wired. */
export function ToolCallCard({
  name,
  state,
  input,
  output,
  errorText,
}: {
  name: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.block, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
      <View style={styles.blockHeader}>
        <Ionicons name="construct-outline" size={14} color={theme.tint} />
        <ThemedText type="smallBold" style={styles.flex}>
          {name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {state}
        </ThemedText>
      </View>
      {input != null ? <Codeish label="input" value={pretty(input)} /> : null}
      {output != null ? <Codeish label="output" value={pretty(output)} /> : null}
      {errorText ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {errorText}
        </ThemedText>
      ) : null}
    </View>
  );
}

function Codeish({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.codeish}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ThemedText style={[styles.mono, { color: theme.text }]}>{value}</ThemedText>
      </ScrollView>
    </View>
  );
}

/** A tappable chip for a non-image file returned by the model. */
export function FileAttachment({
  url,
  filename,
  mediaType,
}: {
  url: string;
  filename?: string;
  mediaType?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      accessibilityRole="link"
      style={[styles.fileChip, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <Ionicons name="document-outline" size={18} color={theme.tint} />
      <ThemedText type="small" numberOfLines={1} style={styles.flex}>
        {filename || mediaType || 'Attachment'}
      </ThemedText>
      <Ionicons name="open-outline" size={16} color={theme.textSecondary} />
    </Pressable>
  );
}

export type Source = { title: string; url?: string };

/** A "Sources" list of citations shown at the bottom of an answer. */
export function SourcesList({ sources }: { sources: Source[] }) {
  const theme = useTheme();
  return (
    <View style={[styles.block, { borderColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sourcesTitle}>
        Sources
      </ThemedText>
      {sources.map((s, i) => {
        const row = (
          <View style={styles.sourceRow}>
            <ThemedText type="small" themeColor="textSecondary">
              {i + 1}.
            </ThemedText>
            <ThemedText
              type="small"
              numberOfLines={1}
              style={[styles.flex, s.url ? { color: theme.tint } : undefined]}
            >
              {s.title}
            </ThemedText>
          </View>
        );
        return s.url ? (
          <Pressable key={i} onPress={() => Linking.openURL(s.url!)} accessibilityRole="link">
            {row}
          </Pressable>
        ) : (
          <View key={i}>{row}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  block: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    padding: Spacing.two + 2,
    gap: Spacing.two,
  },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  reasoningText: { fontStyle: 'italic' },
  codeish: { gap: 2 },
  mono: { fontFamily: Fonts.mono, fontSize: 12 },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sourcesTitle: { textTransform: 'uppercase', letterSpacing: 0.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
