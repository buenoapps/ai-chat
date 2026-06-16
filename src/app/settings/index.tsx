import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Alert, Pressable, Share, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const APP_STORE_URL = 'https://apps.apple.com/app/id000000000';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.aichat.app';

function SettingsRow({
  icon,
  label,
  onPress,
  isFirst,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
          borderTopLeftRadius: isFirst ? Spacing.three : 0,
          borderTopRightRadius: isFirst ? Spacing.three : 0,
          borderBottomLeftRadius: isLast ? Spacing.three : 0,
          borderBottomRightRadius: isLast ? Spacing.three : 0,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <Ionicons name={icon} size={22} color={theme.tint} />
      <ThemedText type="default" style={styles.rowLabel}>
        {label}
      </ThemedText>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const version = Application.nativeApplicationVersion ?? '1.0.0';
  const build = Application.nativeBuildVersion ?? '1';

  async function shareApp() {
    try {
      await Share.share({
        message: `Check out AI Chat — chat with multiple AI models in one app! ${APP_STORE_URL}`,
      });
    } catch {
      // user cancelled
    }
  }

  async function rateApp() {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
    } else {
      Alert.alert('Rate this app', 'Store review is not available on this device.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.group}>
        <SettingsRow
          icon="cube-outline"
          label="Providers & Models"
          onPress={() => router.push('/settings/providers')}
          isFirst
          isLast
        />
      </View>

      <View style={styles.group}>
        <SettingsRow icon="share-outline" label="Share this app" onPress={shareApp} isFirst />
        <SettingsRow icon="star-outline" label="Rate this app" onPress={rateApp} isLast />
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary">
          AI Chat
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Version {version} ({build})
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.three, gap: Spacing.four },
  group: { borderRadius: Spacing.three, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rowLabel: { flex: 1 },
  footer: { alignItems: 'center', gap: 2, marginTop: 'auto', paddingBottom: Spacing.four },
});
