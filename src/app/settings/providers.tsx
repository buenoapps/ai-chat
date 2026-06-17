import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Fab } from '@/components/fab';
import { CapabilityBadges } from '@/components/capability-badges';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProviders } from '@/context/providers-context';
import { useTheme } from '@/hooks/use-theme';
import { MODELS, PROVIDER_LABELS, findModel } from '@/lib/ai/models';

export default function ProvidersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { providers } = useProviders();

  return (
    <ThemedView style={styles.container}>
      {providers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={48} color={theme.textSecondary} />
          <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
            Add a provider with your API key to start chatting.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const model =
              MODELS[item.type].find((m) => m.id === item.model)?.label ?? item.model;
            return (
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/settings/provider/[id]', params: { id: item.id } })
                }
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
                ]}
              >
                <View style={styles.rowText}>
                  <View style={styles.rowTitleRow}>
                    <ThemedText type="default" style={styles.rowTitle}>
                      {item.name}
                    </ThemedText>
                    <CapabilityBadges model={findModel(item.type, item.model)} compact />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary">
                    {PROVIDER_LABELS[item.type]} · {model}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </Pressable>
            );
          }}
        />
      )}

      <Fab
        icon="add"
        onPress={() => router.push({ pathname: '/settings/provider/[id]', params: { id: 'new' } })}
        accessibilityLabel="Add provider"
      />
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
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  rowTitle: { fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  emptyText: { textAlign: 'center' },
});
