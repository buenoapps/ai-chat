import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import type { ModelInfo } from '@/lib/ai/models';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

type Capability = {
  key: 'vision' | 'thinking' | 'tools';
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  a11y: string;
};

const CAPABILITIES: Capability[] = [
  { key: 'vision', icon: 'eye-outline', label: 'Vision', a11y: 'Supports vision' },
  { key: 'thinking', icon: 'bulb-outline', label: 'Thinking', a11y: 'Supports thinking' },
  { key: 'tools', icon: 'construct-outline', label: 'Tools', a11y: 'Supports tools' },
];

function Badge({ icon, label, a11y, compact }: Omit<Capability, 'key'> & { compact?: boolean }) {
  const theme = useTheme();
  return (
    <View accessibilityLabel={a11y} style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}>
      <Ionicons name={icon} size={12} color={theme.textSecondary} />
      {compact ? null : (
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
      )}
    </View>
  );
}

/** Renders a badge for each capability (vision / thinking / tools) the model has. */
export function CapabilityBadges({ model, compact }: { model?: ModelInfo; compact?: boolean }) {
  if (!model) return null;
  const caps = CAPABILITIES.filter((c) => model[c.key]);
  if (caps.length === 0) return null;
  return (
    <View style={styles.row}>
      {caps.map((c) => (
        <Badge key={c.key} icon={c.icon} label={c.label} a11y={c.a11y} compact={compact} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.one },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Spacing.three,
  },
});
