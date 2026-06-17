import { Ionicons } from '@expo/vector-icons';
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

import { CapabilityBadges } from '@/components/capability-badges';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProviders } from '@/context/providers-context';
import { useTheme } from '@/hooks/use-theme';
import { MODELS, PROVIDER_LABELS, PROVIDER_TYPES, defaultModelFor } from '@/lib/ai/models';
import type { ProviderType } from '@/lib/types';

type HeaderRow = { key: string; value: string };

function rowsToHeaders(rows: HeaderRow[]): Record<string, string> | undefined {
  const headers: Record<string, string> = {};
  for (const { key, value } of rows) {
    const k = key.trim();
    if (k) headers[k] = value;
  }
  return Object.keys(headers).length > 0 ? headers : undefined;
}

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
  const [baseUrl, setBaseUrl] = useState(existing?.baseUrl ?? '');
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>(() =>
    Object.entries(existing?.headers ?? {}).map(([key, value]) => ({ key, value })),
  );
  const [apiKey, setApiKey] = useState('');

  function addHeader() {
    setHeaderRows((rows) => [...rows, { key: '', value: '' }]);
  }
  function removeHeader(index: number) {
    setHeaderRows((rows) => rows.filter((_, i) => i !== index));
  }
  function updateHeader(index: number, field: keyof HeaderRow, value: string) {
    setHeaderRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

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
    const input = {
      name: name.trim(),
      type,
      model,
      baseUrl: baseUrl.trim() || undefined,
      headers: rowsToHeaders(headerRows),
    };
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
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
                <View style={styles.modelItemHeader}>
                  <ThemedText type="default" style={styles.flex}>
                    {m.label}
                  </ThemedText>
                  <CapabilityBadges model={m} />
                </View>
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

        <ThemedText type="smallBold" style={styles.label}>
          API BASE URL (OPTIONAL)
        </ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="Leave blank for the provider's default"
          placeholderTextColor={theme.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          inputMode="url"
        />
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Override the endpoint for a proxy or self-hosted / compatible gateway.
        </ThemedText>

        <ThemedText type="smallBold" style={styles.label}>
          HTTP HEADERS (OPTIONAL)
        </ThemedText>
        {headerRows.map((row, i) => (
          <View key={i} style={styles.headerRow}>
            <TextInput
              style={[
                styles.input,
                styles.headerField,
                { color: theme.text, backgroundColor: theme.backgroundElement },
              ]}
              value={row.key}
              onChangeText={(t) => updateHeader(i, 'key', t)}
              placeholder="Header"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={[
                styles.input,
                styles.headerField,
                { color: theme.text, backgroundColor: theme.backgroundElement },
              ]}
              value={row.value}
              onChangeText={(t) => updateHeader(i, 'value', t)}
              placeholder="Value"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              onPress={() => removeHeader(i)}
              accessibilityLabel="Remove header"
              hitSlop={8}
              style={styles.headerRemove}
            >
              <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>
        ))}
        <Pressable onPress={addHeader} style={styles.addHeaderBtn}>
          <Ionicons name="add-circle-outline" size={20} color={theme.tint} />
          <ThemedText type="small" style={{ color: theme.tint, fontWeight: '600' }}>
            Add header
          </ThemedText>
        </Pressable>

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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headerField: { flex: 1 },
  headerRemove: { padding: Spacing.one },
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
  },
  segment: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  segmentItem: {
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  flex: { flex: 1 },
  modelList: { gap: Spacing.two },
  modelItemHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
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
