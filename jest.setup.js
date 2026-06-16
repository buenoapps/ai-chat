/* eslint-disable @typescript-eslint/no-require-imports */
// Global mocks shared by the test suite.

// Required so React state updates inside hooks/effects are wrapped in act().
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// --- Storage -------------------------------------------------------------
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    __store: store,
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});

// --- Safe area -----------------------------------------------------------
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// --- Icons / images ------------------------------------------------------
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }) => require('react').createElement('Ionicons', { name }),
}));

jest.mock('expo-image', () => ({
  Image: (props) => require('react').createElement('ExpoImage', props),
}));

// --- Native pickers / services ------------------------------------------
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true })),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true })),
}));

jest.mock('expo-store-review', () => ({
  hasAction: jest.fn(async () => true),
  requestReview: jest.fn(async () => {}),
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
  nativeBuildVersion: '1',
}));

// --- Color scheme (deterministic light theme in tests) ------------------
jest.mock('@/hooks/use-color-scheme', () => ({ useColorScheme: () => 'light' }));

// --- Routing -------------------------------------------------------------
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useNavigation: () => ({ setOptions: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Stack: Object.assign(() => null, { Screen: () => null }),
  Link: ({ children }) => children,
}));
