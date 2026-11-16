import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Crypto as CryptoPort, Tokens } from "./oauth";
import { TokenStore } from "./session";

/** expo-crypto as the PKCE source of randomness and SHA-256. */
export const nativeCrypto: CryptoPort = {
  randomBytes: (length) => Crypto.getRandomBytesAsync(length),
  sha256: async (text) => {
    const base64 = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      text,
      {
        encoding: Crypto.CryptoEncoding.BASE64,
      },
    );
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  },
};

/** The sign-in page in the system browser sheet; null when the person closes it. */
export const openAuth = async (url: string, redirectUri: string) => {
  const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
  return result.type === "success" ? result.url : null;
};

/** Tokens in the device's secure storage (Keychain / Keystore), not AsyncStorage. */
export const secureTokenStore = (key: string): TokenStore => ({
  async get() {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  },
  set: (tokens) => SecureStore.setItemAsync(key, JSON.stringify(tokens)),
  clear: () => SecureStore.deleteItemAsync(key),
});
