import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useProviders } from '@/context/providers-context';
import { useTheme } from '@/hooks/use-theme';
import { MODELS, PROVIDER_LABELS } from '@/lib/ai/models';
import { BottomSheet } from './bottom-sheet';
import { ThemedText } from './themed-text';

type ModelPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  selectedId?: string;
  onSelect: (providerId: string) => void;
};

function modelLabel(type: keyof typeof MODELS, id: string) {
  return MODELS[type].find((m) => m.id === id)?.label ?? id;
}

/** Half-screen overlay listing saved provider/model configs to use for a chat. */
export function ModelPickerSheet({ visible, onClose, selectedId, onSelect }: ModelPickerSheetProps) {
  const theme = useTheme();
  const router = useRouter();
  const { providers } = useProviders();

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Select a model">
      {providers.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
            No providers configured yet.
          </ThemedText>
          <Pressable
            onPress={() => {
              onClose();
              router.push({ pathname: '/settings/provider/[id]', params: { id: 'new' } });
            }}
            style={({ pressed }) => [styles.addBtn, { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 }]}
          >
            <ThemedText type="smallBold" style={{ color: theme.tintText }}>
              Add a provider
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {providers.map((p) => {
            const selected = p.id === selectedId;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  onSelect(p.id);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: selected
                      ? theme.backgroundSelected
                      : pressed
                        ? theme.backgroundSelected
                        : theme.backgroundElement,
                    borderColor: selected ? theme.tint : 'transparent',
                  },
                ]}
              >
                <View style={styles.rowText}>
                  <ThemedText type="default">{p.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {PROVIDER_LABELS[p.type]} · {modelLabel(p.type, p.model)}
                  </ThemedText>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.tint} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { alignSelf: 'stretch' },
  listContent: { gap: Spacing.two, paddingBottom: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  rowText: { gap: 2, flex: 1 },
  empty: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.four },
  emptyText: { textAlign: 'center' },
  addBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
});
