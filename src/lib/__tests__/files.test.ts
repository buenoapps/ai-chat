/**
 * @jest-environment jsdom
 */
import { imagePart, uriToDataUrl } from '../files';

describe('imagePart', () => {
  it('builds a file UI part for an image', () => {
    const part = imagePart('data:image/png;base64,AAAA', 'image/png', 'pic.png');
    expect(part).toEqual({
      type: 'file',
      mediaType: 'image/png',
      url: 'data:image/png;base64,AAAA',
      filename: 'pic.png',
    });
  });

  it('omits the filename when not provided', () => {
    const part = imagePart('data:image/jpeg;base64,BBBB', 'image/jpeg');
    expect(part.filename).toBeUndefined();
    expect(part.type).toBe('file');
  });
});

describe('uriToDataUrl', () => {
  it('reads a local URI into a base64 data URL', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    global.fetch = jest.fn(async () => ({ blob: async () => blob }) as Response);

    const dataUrl = await uriToDataUrl('file:///tmp/file.txt');

    expect(global.fetch).toHaveBeenCalledWith('file:///tmp/file.txt');
    expect(dataUrl.startsWith('data:')).toBe(true);
    expect(dataUrl).toContain('base64,');
  });
});
