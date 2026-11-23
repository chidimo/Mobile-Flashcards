import * as Linking from "expo-linking";
import { ProviderDefinition, StorageProvider } from "../provider";
import { createDropboxProvider } from "../providers/dropbox";
import { createHttp } from "../providers/http";
import { createOneDriveProvider } from "../providers/onedrive";
import { nativeCrypto, openAuth, secureTokenStore } from "./native";
import { OAuthConfig } from "./oauth";
import { createSession } from "./session";

type Options = {
  id: string;
  label: string;
  /** Empty or missing means this build has no client ID, so the service isn't offered. */
  clientId: string | undefined;
  config: (clientId: string, redirectUri: string) => OAuthConfig;
  makeProvider: (http: ReturnType<typeof createHttp>) => StorageProvider;
};

/** Sign-in with OAuth + PKCE and tokens in secure storage, around one storage client. */
const defineService = ({
  id,
  label,
  clientId,
  config,
  makeProvider,
}: Options): ProviderDefinition => {
  const session = () =>
    createSession({
      config: config(clientId ?? "", Linking.createURL("oauth")),
      store: secureTokenStore(`sync-tokens-${id}`),
      crypto: nativeCrypto,
      openAuth,
    });
  const providerFor = (s: ReturnType<typeof session>) =>
    makeProvider(createHttp({ getToken: (force) => s.getToken(force) }));

  return {
    id,
    label,
    isConfigured: () => !!clientId,
    async connect() {
      const s = session();
      await s.signIn();
      return providerFor(s);
    },
    async restore() {
      const s = session();
      return (await s.hasSession()) ? providerFor(s) : null;
    },
    disconnect: () => session().signOut(),
  };
};

/** Dropbox "App folder" access; the app key comes from EXPO_PUBLIC_DROPBOX_APP_KEY. */
export const dropboxService = (clientId: string | undefined) =>
  defineService({
    id: "dropbox",
    label: "Dropbox",
    clientId,
    makeProvider: createDropboxProvider,
    config: (id, redirectUri) => ({
      clientId: id,
      redirectUri,
      authUrl: "https://www.dropbox.com/oauth2/authorize",
      tokenUrl: "https://api.dropboxapi.com/oauth2/token",
      scopes: ["files.content.read", "files.content.write"],
      // Without this Dropbox sends no refresh token and the person would sign in every few hours.
      extraAuthParams: { token_access_type: "offline" },
    }),
  });

/** OneDrive app folder access; the client ID comes from EXPO_PUBLIC_ONEDRIVE_CLIENT_ID. */
export const oneDriveService = (clientId: string | undefined) =>
  defineService({
    id: "onedrive",
    label: "OneDrive",
    clientId,
    makeProvider: createOneDriveProvider,
    config: (id, redirectUri) => ({
      clientId: id,
      redirectUri,
      authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
      tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      scopes: ["Files.ReadWrite.AppFolder", "offline_access"],
    }),
  });
