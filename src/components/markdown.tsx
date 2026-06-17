import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  cloneElement,
  isValidElement,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import { Renderer, useMarkdown, type RendererInterface } from 'react-native-marked';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { Fonts, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

/** Stable, content-derived key so a code block isn't remounted on every token. */
function hashKey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** A fenced code block: themed panel, language label, copy button, syntax highlighting. */
export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [copied, setCopied] = useState(false);
  const value = code.replace(/\n$/, '');

  async function copy() {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <View style={[styles.codeContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={[styles.codeHeader, { borderBottomColor: theme.border }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {language || 'code'}
        </ThemedText>
        <Pressable onPress={copy} hitSlop={8} accessibilityLabel="Copy code" style={styles.copyBtn}>
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={14}
            color={theme.textSecondary}
          />
          <ThemedText type="small" themeColor="textSecondary">
            {copied ? 'Copied' : 'Copy'}
          </ThemedText>
        </Pressable>
      </View>
      <CodeHighlighter
        hljsStyle={scheme === 'dark' ? atomOneDark : atomOneLight}
        textStyle={styles.codeText}
        language={language}
        // Neutralize react-syntax-highlighter's default `PreTag` style
        // (`backgroundColor: '#fff'` + an invalid `'0.5em'` padding) that
        // otherwise renders an oversized white box around the snippet.
        customStyle={{ backgroundColor: 'transparent', padding: 0, margin: 0 }}
        scrollViewProps={{ contentContainerStyle: styles.codeScroll }}
      >
        {value}
      </CodeHighlighter>
    </View>
  );
}

/** react-native-marked renderer that swaps fenced code blocks for {@link CodeBlock}
 * and makes the rendered text selectable (long-press to copy). Links are left
 * un-overridden so taps still open them. */
class MarkdownRenderer extends Renderer implements RendererInterface {
  // react-native-marked wraps list/paragraph content in a Text with an empty
  // style, so without a base the wrapper falls back to default font metrics and
  // its text no longer lines up with the (styled) list marker. Merging a base
  // text style onto every text node keeps line height/size consistent.
  constructor(private readonly baseTextStyle: TextStyle) {
    super();
  }

  private selectable(node: ReactNode): ReactNode {
    return isValidElement(node)
      ? cloneElement(node as ReactElement<{ selectable?: boolean }>, { selectable: true })
      : node;
  }

  code(text: string, language?: string): ReactNode {
    return <CodeBlock key={`code-${hashKey(text)}`} code={text} language={language} />;
  }

  text(text: string | ReactNode[], styles?: TextStyle): ReactNode {
    return this.selectable(super.text(text, { ...this.baseTextStyle, ...styles }));
  }

  strong(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return this.selectable(super.strong(children, styles));
  }

  em(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return this.selectable(super.em(children, styles));
  }

  del(children: string | ReactNode[], styles?: TextStyle): ReactNode {
    return this.selectable(super.del(children, styles));
  }

  codespan(text: string, styles?: TextStyle): ReactNode {
    return this.selectable(super.codespan(text, styles));
  }

  heading(text: string | ReactNode[], styles?: TextStyle): ReactNode {
    return this.selectable(super.heading(text, styles));
  }

  // Render lists ourselves: a fixed-width, right-aligned marker plus a flex:1
  // content column. This top-aligns the marker with the first line and lets
  // long text wrap instead of overflowing (the upstream @jsamr layout did not
  // give the content `flex`, which caused misalignment and overlap).
  list(
    ordered: boolean,
    li: ReactNode[],
    _listStyle?: ViewStyle,
    textStyle?: TextStyle,
    startIndex?: number,
  ): ReactNode {
    const start = startIndex ?? 1;
    return (
      <View key={`list-${ordered ? 'o' : 'u'}-${start}-${li.length}`} style={styles.list}>
        {li.map((item, i) => (
          <View key={i} style={styles.listRow}>
            <Text selectable style={[textStyle, styles.listMarker]}>
              {ordered ? `${start + i}.` : '•'}
            </Text>
            {item}
          </View>
        ))}
      </View>
    );
  }

  listItem(children: ReactNode[], itemStyle?: ViewStyle): ReactNode {
    return <View style={[itemStyle, styles.listItemContent]}>{children}</View>;
  }
}

/** Renders assistant message text as markdown with highlighted code blocks. */
export function Markdown({ content }: { content: string }) {
  const theme = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const renderer = useMemo(
    () => new MarkdownRenderer({ color: theme.text, fontSize: 16, lineHeight: 24 }),
    [theme.text],
  );

  const elements = useMarkdown(content, {
    colorScheme: scheme,
    renderer,
    theme: {
      colors: { text: theme.text, link: theme.tint, border: theme.border, code: theme.text },
    },
    styles: {
      text: { color: theme.text, fontSize: 16, lineHeight: 24 },
      // Only bottom spacing: a top margin would push a (loose) list item's
      // paragraph text below its marker number, breaking alignment.
      paragraph: { marginTop: 0, marginBottom: Spacing.two, paddingTop: 0 },
      strong: { fontWeight: '700' },
      em: { fontStyle: 'italic' },
      link: { color: theme.tint },
      h1: { color: theme.text, fontSize: 24, fontWeight: '700' },
      h2: { color: theme.text, fontSize: 20, fontWeight: '700' },
      h3: { color: theme.text, fontSize: 18, fontWeight: '600' },
      codespan: {
        fontFamily: Fonts.mono,
        fontSize: 14,
        color: theme.text,
        backgroundColor: theme.backgroundElement,
      },
      blockquote: { borderLeftColor: theme.border, opacity: 0.85 },
      li: { color: theme.text, fontSize: 16, lineHeight: 24 },
    },
  });

  return <View style={styles.container}>{elements}</View>;
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  list: { width: '100%', marginVertical: Spacing.one, gap: 2 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start' },
  listMarker: { minWidth: 22, textAlign: 'right', marginRight: Spacing.two },
  listItemContent: { flex: 1, flexShrink: 1 },
  codeContainer: {
    borderRadius: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginVertical: Spacing.one,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  codeScroll: { padding: Spacing.three },
  codeText: { fontFamily: Fonts.mono, fontSize: 13 },
});
