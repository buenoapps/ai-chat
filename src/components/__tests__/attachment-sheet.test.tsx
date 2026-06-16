import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AttachmentSheet } from '../attachment-sheet';

beforeEach(() => jest.clearAllMocks());

describe('AttachmentSheet', () => {
  it('shows the three image sources', async () => {
    await render(<AttachmentSheet visible onClose={jest.fn()} onPicked={jest.fn()} />);
    expect(screen.getByText('Take Photo')).toBeOnTheScreen();
    expect(screen.getByText('Photo Library')).toBeOnTheScreen();
    expect(screen.getByText('Files')).toBeOnTheScreen();
  });

  it('requests the camera when "Take Photo" is pressed', async () => {
    await render(<AttachmentSheet visible onClose={jest.fn()} onPicked={jest.fn()} />);
    await fireEvent.press(screen.getByText('Take Photo'));
    await waitFor(() => expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled());
    expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
  });

  it('opens the photo library', async () => {
    await render(<AttachmentSheet visible onClose={jest.fn()} onPicked={jest.fn()} />);
    await fireEvent.press(screen.getByText('Photo Library'));
    await waitFor(() => expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled());
  });

  it('opens the files picker', async () => {
    await render(<AttachmentSheet visible onClose={jest.fn()} onPicked={jest.fn()} />);
    await fireEvent.press(screen.getByText('Files'));
    await waitFor(() => expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled());
  });

  it('emits a file part when an image is picked from the library', async () => {
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file:///photo.jpg', base64: 'AAAA', mimeType: 'image/jpeg', fileName: 'photo.jpg' },
      ],
    });
    const onPicked = jest.fn();
    await render(<AttachmentSheet visible onClose={jest.fn()} onPicked={onPicked} />);

    await fireEvent.press(screen.getByText('Photo Library'));

    await waitFor(() =>
      expect(onPicked).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'file',
          mediaType: 'image/jpeg',
          url: 'data:image/jpeg;base64,AAAA',
        }),
      ),
    );
  });
});
