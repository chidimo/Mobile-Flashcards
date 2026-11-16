export type OAuthConfig = {
  clientId: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
  /** Provider-specific extras on the sign-in URL (Dropbox needs token_access_type=offline). */
  extraAuthParams?: Record<string, string>;
};

export type Tokens = {
  accessToken: string;
  refreshToken?: string;
  /** Epoch milliseconds. */
  expiresAt: number;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export type Crypto = {
  randomBytes: (length: number) => Promise<Uint8Array>;
  sha256: (text: string) => Promise<Uint8Array>;
};

/** A one-time secret and its SHA-256 challenge: proves the app that started sign-in is the one finishing it. */
export const makePkce = async (crypto: Crypto) => {
  const verifier = base64Url(await crypto.randomBytes(32));
  const challenge = base64Url(await crypto.sha256(verifier));
  return { verifier, challenge };
};

export const buildAuthUrl = (
  config: OAuthConfig,
  challenge: string,
  state: string,
) => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    ...config.extraAuthParams,
  });
  return `${config.authUrl}?${params}`;
};

/** The code from the redirect, after checking the state matches and the service didn't refuse. */
export const parseRedirect = (url: string, expectedState: string) => {
  const query = new URLSearchParams(url.split("#")[0].split("?")[1] ?? "");
  const error = query.get("error");
  if (error)
    throw new AuthError(
      query.get("error_description") ?? `Sign-in failed (${error}).`,
    );
  if (query.get("state") !== expectedState)
    throw new AuthError("Sign-in didn't match this request. Try again.");
  const code = query.get("code");
  if (!code) throw new AuthError("The service didn't send a sign-in code.");
  return code;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

const requestTokens = async (
  config: OAuthConfig,
  form: Record<string, string>,
  fetchImpl: typeof fetch,
  now: number,
  keepRefreshToken?: string,
): Promise<Tokens> => {
  const response = await fetchImpl(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      ...form,
    }).toString(),
  });
  const body = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok || !body.access_token) {
    // invalid_grant: the refresh token was revoked or expired; the person has to sign in again.
    throw new AuthError(
      body.error_description ??
        body.error ??
        `Sign-in failed (${response.status}).`,
    );
  }
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token ?? keepRefreshToken,
    expiresAt: now + (body.expires_in ?? 3600) * 1000,
  };
};

export const exchangeCode = (
  config: OAuthConfig,
  code: string,
  verifier: string,
  fetchImpl: typeof fetch,
  now: number,
) =>
  requestTokens(
    config,
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
    },
    fetchImpl,
    now,
  );

export const refreshTokens = (
  config: OAuthConfig,
  refreshToken: string,
  fetchImpl: typeof fetch,
  now: number,
) =>
  requestTokens(
    config,
    { grant_type: "refresh_token", refresh_token: refreshToken },
    fetchImpl,
    now,
    refreshToken,
  );
