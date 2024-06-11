import * as Clipboard from "expo-clipboard";

export const useClipboard = () => {
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const fetchCopiedText = async (onCopy: (text: string) => void) => {
    const text = await Clipboard.getStringAsync();
    onCopy(text);
  };

  return { copyToClipboard, fetchCopiedText };
};
