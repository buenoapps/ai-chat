import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProviders } from '@/context/providers-context';
import { useTheme } from '@/hooks/use-theme';
import { MODELS, PROVIDER_LABELS, PROVIDER_TYPES, defaultModelFor } from '@/lib/ai/models';
import type { ProviderType } from '@/lib/types';

export default function ProviderFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { providers, addProvider, updateProvider, removeProvider } = useProviders();

  const isNew = id === 'new';
  const existing = providers.find((p) => p.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [type, setType] = useState<ProviderType>(existing?.type ?? 'openai');
  const [model, setModel] = useState(existing?.model ?? defaultModelFor('openai'));
  const [apiKey, setApiKey] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: isNew ? 'Add Provider' : 'Edit Provider' });
  }, [navigation, isNew]);

  function changeType(next: ProviderType) {
    setType(next);
    if (!MODELS[next].some((m) => m.id === model)) setModel(defaultModelFor(next));
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please give this provider a name.');
      return;
    }
    if (isNew && !apiKey.trim()) {
      Alert.alert('API key required', 'Please enter the API key for this provider.');
      return;
    }
    const input = { name: name.trim(), type, model };
    if (isNew) {
      await addProvider(input, apiKey.trim());
    } else if (existing) {
      await updateProvider(existing.id, input, apiKey.trim() || undefined);
    }
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    Alert.alert('Delete provider', `Remove "${existing.name}"? This also deletes its stored key.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeProvider(existing.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="smallBold" style={styles.label}>
          NAME
        </ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Work OpenAI"
          placeholderTextColor={theme.textSecondary}
        />

        <ThemedText type="smallBold" style={styles.label}>
          PROVIDER
        </ThemedText>
        <View style={styles.segment}>
          {PROVIDER_TYPES.map((t) => {
            const selected = t === type;
            return (
              <Pressable
                key={t}
                onPress={() => changeType(t)}
                style={[
                  styles.segmentItem,
                  {
                    backgroundColor: selected ? theme.tint : theme.backgroundElement,
                  },
                ]}
              >
                <ThemedText
                  type="small"
                  style={{ color: selected ? theme.tintText : theme.text, fontWeight: '600' }}
                >
                  {PROVIDER_LABELS[t]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText type="smallBold" style={styles.label}>
          MODEL
        </ThemedText>
        <View style={styles.modelList}>
          {MODELS[type].map((m) => {
            const selected = m.id === model;
            return (
              <Pressable
                key={m.id}
                onPress={() => setModel(m.id)}
                style={[
                  styles.modelItem,
                  {
                    backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                    borderColor: selected ? theme.tint : 'transparent',
                  },
                ]}
              >
                <ThemedText type="default">{m.label}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {m.id}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText type="smallBold" style={styles.label}>
          API KEY
        </ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder={isNew ? 'Paste your API key' : 'Leave blank to keep current key'}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Keys are stored securely on this device and sent only to the provider.
        </ThemedText>

        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 }]}
        >
          <ThemedText type="default" style={{ color: theme.tintText, fontWeight: '700' }}>
            {isNew ? 'Add Provider' : 'Save Changes'}
          </ThemedText>
        </Pressable>

        {!isNew ? (
          <Pressable onPress={confirmDelete} style={styles.deleteBtn}>
            <ThemedText type="default" style={{ color: theme.danger, fontWeight: '600' }}>
              Delete Provider
            </ThemedText>
          </Pressable>
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.six },
  label: { marginTop: Spacing.three, marginBottom: Spacing.one, letterSpacing: 0.5 },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  segment: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  segmentItem: {
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  modelList: { gap: Spacing.two },
  modelItem: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
    gap: 2,
  },
  hint: { marginTop: Spacing.one },
  saveBtn: {
    marginTop: Spacing.four,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  deleteBtn: { alignItems: 'center', paddingVertical: Spacing.three, marginTop: Spacing.one },
});
