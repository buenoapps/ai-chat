import '@/lib/polyfills';

import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';
import { ChatsProvider } from '@/context/chats-context';
import { ProvidersProvider } from '@/context/providers-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

function navThemeFor(scheme: 'light' | 'dark') {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const c = Colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.tint,
      background: c.background,
      card: c.background,
      text: c.text,
      border: c.border,
    },
  };
}

function SettingsButton() {
  const router = useRouter();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel="Settings"
      hitSlop={12}
    >
      <Ionicons name="settings-outline" size={22} color={Colors[scheme].text} />
    </Pressable>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProvidersProvider>
        <ChatsProvider>
          <ThemeProvider value={navThemeFor(scheme)}>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShadowVisible: false }}>
              <Stack.Screen
                name="index"
                options={{ title: 'Chats', headerRight: () => <SettingsButton /> }}
              />
              <Stack.Screen name="chat/[id]" options={{ title: 'Chat' }} />
              <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
              <Stack.Screen name="settings/providers" options={{ title: 'Providers & Models' }} />
              <Stack.Screen
                name="settings/provider/[id]"
                options={{ title: 'Provider', presentation: 'modal' }}
              />
            </Stack>
          </ThemeProvider>
        </ChatsProvider>
      </ProvidersProvider>
    </GestureHandlerRootView>
  );
}
