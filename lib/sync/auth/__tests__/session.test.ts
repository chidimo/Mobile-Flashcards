import { queueFetch, res } from "../../providers/__tests__/helpers";
import { AuthError, OAuthConfig, Tokens } from "../oauth";
import { createSession, TokenStore } from "../session";

const config: OAuthConfig = {
  clientId: "client",
  authUrl: "https://auth.example/authorize",
  tokenUrl: "https://auth.example/token",
  scopes: ["s"],
  redirectUri: "myapp://oauth",
};

const crypto = {
  randomBytes: async () => new Uint8Array([1, 2, 3, 4]),
  sha256: async () => new Uint8Array([9, 9]),
};

const memoryStore = (
  initial: Tokens | null = null,
): TokenStore & { value: Tokens | null } => {
  const store = {
    value: initial,
    get: async () => store.value,
    set: async (t: Tokens) => void (store.value = t),
    clear: async () => void (store.value = null),
  };
  return store;
};

const NOW = 1_000_000;
const make = (
  store: TokenStore,
  fetchImpl: typeof fetch,
  openAuth = jest.fn(),
) => ({
  openAuth,
  session: createSession({
    config,
    store,
    crypto,
    openAuth,
    fetchImpl,
    now: () => NOW,
  }),
});

describe("session sign-in", () => {
  it("opens the sign-in page, checks the state and saves the tokens", async () => {
    const store = memoryStore();
    const { fetchImpl, calls } = queueFetch(
      res(200, { access_token: "a", refresh_token: "r", expires_in: 3600 }),
    );
    const openAuth = jest.fn(async (url: string) => {
      const state = new URL(url).searchParams.get("state");
      return `myapp://oauth?code=the-code&state=${state}`;
    });
    const { session } = make(store, fetchImpl, openAuth);

    await session.signIn();

    expect(store.value).toEqual({
      accessToken: "a",
      refreshToken: "r",
      expiresAt: NOW + 3_600_000,
    });
    expect(new URLSearchParams(calls[0].init.body as string).get("code")).toBe(
      "the-code",
    );
    expect(await session.hasSession()).toBe(true);
  });

  it("says so when the person closes the sign-in page", async () => {
    const { session } = make(
      memoryStore(),
      queueFetch().fetchImpl,
      jest.fn(async () => null),
    );
    await expect(session.signIn()).rejects.toThrow("cancelled");
  });

  it("refuses a redirect with the wrong state, saving nothing", async () => {
    const store = memoryStore();
    const openAuth = jest.fn(async () => "myapp://oauth?code=c&state=forged");
    const { session } = make(store, queueFetch().fetchImpl, openAuth);

    await expect(session.signIn()).rejects.toThrow(AuthError);
    expect(store.value).toBeNull();
  });
});

describe("session getToken", () => {
  const fresh: Tokens = {
    accessToken: "live",
    refreshToken: "r",
    expiresAt: NOW + 600_000,
  };

  it("returns the saved token while it is good", async () => {
    const { fetchImpl, calls } = queueFetch();
    const { session } = make(memoryStore(fresh), fetchImpl);

    expect(await session.getToken()).toBe("live");
    expect(calls).toHaveLength(0);
  });

  it("refreshes a token that is about to expire and saves the new one", async () => {
    const store = memoryStore({ ...fresh, expiresAt: NOW + 30_000 });
    const { fetchImpl } = queueFetch(
      res(200, { access_token: "new", expires_in: 3600 }),
    );
    const { session } = make(store, fetchImpl);

    expect(await session.getToken()).toBe("new");
    expect(store.value).toEqual({
      accessToken: "new",
      refreshToken: "r",
      expiresAt: NOW + 3_600_000,
    });
  });

  it("refreshes on demand even when the token looks fine", async () => {
    const { fetchImpl } = queueFetch(
      res(200, { access_token: "forced", expires_in: 3600 }),
    );
    const { session } = make(memoryStore(fresh), fetchImpl);

    expect(await session.getToken(true)).toBe("forced");
  });

  it("shares one refresh between simultaneous requests", async () => {
    const store = memoryStore({ ...fresh, expiresAt: NOW - 1 });
    const { fetchImpl, calls } = queueFetch(
      res(200, { access_token: "new", expires_in: 3600 }),
    );
    const { session } = make(store, fetchImpl);

    const tokens = await Promise.all([
      session.getToken(),
      session.getToken(),
      session.getToken(),
    ]);

    expect(tokens).toEqual(["new", "new", "new"]);
    expect(calls).toHaveLength(1);
  });

  it("asks to sign in again when nothing is saved or it can't be refreshed", async () => {
    const none = make(memoryStore(), queueFetch().fetchImpl).session;
    await expect(none.getToken()).rejects.toThrow("Sign in again");

    const noRefresh = make(
      memoryStore({ accessToken: "a", expiresAt: NOW - 1 }),
      queueFetch().fetchImpl,
    ).session;
    await expect(noRefresh.getToken()).rejects.toThrow("Sign in again");
  });

  it("surfaces a revoked refresh token", async () => {
    const store = memoryStore({ ...fresh, expiresAt: NOW - 1 });
    const { fetchImpl } = queueFetch(
      res(400, { error: "invalid_grant", error_description: "Revoked" }),
    );
    const { session } = make(store, fetchImpl);

    await expect(session.getToken()).rejects.toThrow("Revoked");
  });

  it("forgets the tokens on sign-out", async () => {
    const store = memoryStore(fresh);
    const { session } = make(store, queueFetch().fetchImpl);

    await session.signOut();

    expect(store.value).toBeNull();
    expect(await session.hasSession()).toBe(false);
  });
});
