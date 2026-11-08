import * as Clipboard from "expo-clipboard";

export const useClipboard = () => {
  /** Copies the text and reads it back, so a write the system dropped is reported, not assumed. */
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    return (await Clipboard.getStringAsync()) === text;
  };

  const fetchCopiedText = async (onCopy: (text: string) => void) => {
    const text = await Clipboard.getStringAsync();
    onCopy(text);
  };

  return { copyToClipboard, fetchCopiedText };
};
