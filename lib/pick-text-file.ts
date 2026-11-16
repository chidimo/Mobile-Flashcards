import { File } from "expo-file-system";

/** Lets the person choose a JSON or text file and returns its text, or null if they backed out. */
export const pickTextFile = async () => {
  const picked = await File.pickFileAsync({
    mimeTypes: ["application/json", "text/plain"],
  });
  return picked.canceled ? null : picked.result.text();
};
