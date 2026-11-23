import {
  AuthError,
  buildAuthUrl,
  Crypto,
  exchangeCode,
  makePkce,
  OAuthConfig,
  parseRedirect,
  refreshTokens,
  Tokens,
} from "./oauth";

export type TokenStore = {
  get: () => Promise<Tokens | null>;
  set: (tokens: Tokens) => Promise<void>;
  clear: () => Promise<void>;
};

type Deps = {
  config: OAuthConfig;
  store: TokenStore;
  crypto: Crypto;
  /** Opens the sign-in page and resolves to the redirect URL, or null if the person closed it. */
  openAuth: (url: string, redirectUri: string) => Promise<string | null>;
  fetchImpl?: typeof fetch;
  now?: () => number;
};

/** Refresh a little early so a token never expires mid-request. */
const SKEW_MS = 60_000;

/** One service's sign-in: interactive sign-in, silent refresh, and sign-out. */
export const createSession = ({
  config,
  store,
  crypto,
  openAuth,
  fetchImpl = fetch,
  now = Date.now,
}: Deps) => {
  // Two requests refreshing at once would race on a rotating refresh token: share one.
  let refreshing: Promise<Tokens> | null = null;

  return {
    async signIn() {
      const { verifier, challenge } = await makePkce(crypto);
      const state = (await makePkce(crypto)).verifier;
      const redirect = await openAuth(
        buildAuthUrl(config, challenge, state),
        config.redirectUri,
      );
      if (redirect === null) throw new AuthError("Sign-in was cancelled.");
      const code = parseRedirect(redirect, state);
      await store.set(
        await exchangeCode(config, code, verifier, fetchImpl, now()),
      );
    },

    async hasSession() {
      return (await store.get()) !== null;
    },

    /** A usable access token, refreshing it when it is about to expire or `force` is set. */
    async getToken(force = false) {
      const tokens = await store.get();
      if (!tokens) throw new AuthError("Sign in again to keep syncing.");
      if (!force && tokens.expiresAt - SKEW_MS > now())
        return tokens.accessToken;
      if (!tokens.refreshToken)
        throw new AuthError("Sign in again to keep syncing.");
      const refreshToken = tokens.refreshToken;
      refreshing ??= refreshTokens(config, refreshToken, fetchImpl, now())
        .then(async (fresh) => {
          await store.set(fresh);
          return fresh;
        })
        .finally(() => {
          refreshing = null;
        });
      return (await refreshing).accessToken;
    },

    signOut: () => store.clear(),
  };
};
