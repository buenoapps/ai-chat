import { Ionicons } from '@expo/vector-icons';
import type { FileUIPart } from 'ai';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { imagePart, uriToDataUrl } from '@/lib/files';
import { BottomSheet } from './bottom-sheet';
import { ThemedText } from './themed-text';

type AttachmentSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPicked: (file: FileUIPart) => void;
};

/** Half-screen overlay offering Camera / Photo Library / Files image sources. */
export function AttachmentSheet({ visible, onClose, onPicked }: AttachmentSheetProps) {
  const theme = useTheme();

  async function fromAsset(asset: ImagePicker.ImagePickerAsset) {
    const mediaType = asset.mimeType ?? 'image/jpeg';
    const dataUrl = asset.base64
      ? `data:${mediaType};base64,${asset.base64}`
      : await uriToDataUrl(asset.uri);
    onPicked(imagePart(dataUrl, mediaType, asset.fileName ?? undefined));
    onClose();
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in Settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (!result.canceled) await fromAsset(result.assets[0]);
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled) await fromAsset(result.assets[0]);
  }

  async function pickFromFiles() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const dataUrl = await uriToDataUrl(asset.uri);
    onPicked(imagePart(dataUrl, asset.mimeType ?? 'image/jpeg', asset.name));
    onClose();
  }

  const options: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: 'camera-outline', label: 'Take Photo', onPress: takePhoto },
    { icon: 'image-outline', label: 'Photo Library', onPress: pickFromLibrary },
    { icon: 'folder-outline', label: 'Files', onPress: pickFromFiles },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add attachment">
      <View style={styles.list}>
        {options.map((o) => (
          <Pressable
            key={o.label}
            onPress={o.onPress}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}
          >
            <Ionicons name={o.icon} size={22} color={theme.tint} />
            <ThemedText type="default">{o.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
