import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from './themed-text';

/** Small badge marking a model that accepts image (vision) input. */
export function VisionBadge({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  return (
    <View
      accessibilityLabel="Supports vision"
      style={[styles.badge, { backgroundColor: theme.backgroundSelected }]}
    >
      <Ionicons name="eye-outline" size={12} color={theme.textSecondary} />
      {compact ? null : (
        <ThemedText type="small" themeColor="textSecondary">
          Vision
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Spacing.three,
  },
});
