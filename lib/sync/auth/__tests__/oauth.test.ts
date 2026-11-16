import { queueFetch, res } from "../../providers/__tests__/helpers";
import {
  AuthError,
  buildAuthUrl,
  exchangeCode,
  makePkce,
  OAuthConfig,
  parseRedirect,
  refreshTokens,
} from "../oauth";

const config: OAuthConfig = {
  clientId: "client",
  authUrl: "https://auth.example/authorize",
  tokenUrl: "https://auth.example/token",
  scopes: ["files.read", "offline_access"],
  redirectUri: "myapp://oauth",
  extraAuthParams: { token_access_type: "offline" },
};

const fakeCrypto = {
  // 0xfb 0xff 0xfe encodes to "+//+" in base64: checks the URL-safe swap.
  randomBytes: async () => new Uint8Array([0xfb, 0xff, 0xfe, 0xfb, 0xff, 0xfe]),
  sha256: async (text: string) =>
    new Uint8Array([...text].slice(0, 4).map((c) => c.charCodeAt(0))),
};

describe("makePkce", () => {
  it("makes a URL-safe verifier and a challenge derived from it", async () => {
    const { verifier, challenge } = await makePkce(fakeCrypto);

    expect(verifier).toBe("-__--__-");
    expect(verifier).not.toMatch(/[+/=]/);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(challenge).toBe(
      btoa(
        String.fromCharCode(...[..."-__-"].map((c) => c.charCodeAt(0))),
      ).replace(/=+$/, ""),
    );
  });
});

describe("buildAuthUrl", () => {
  it("carries the client, redirect, scopes, state, challenge and extras", () => {
    const url = new URL(buildAuthUrl(config, "chal", "st"));

    expect(url.origin + url.pathname).toBe("https://auth.example/authorize");
    expect(url.searchParams.get("client_id")).toBe("client");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toBe("myapp://oauth");
    expect(url.searchParams.get("scope")).toBe("files.read offline_access");
    expect(url.searchParams.get("state")).toBe("st");
    expect(url.searchParams.get("code_challenge")).toBe("chal");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("token_access_type")).toBe("offline");
  });
});

describe("parseRedirect", () => {
  it("returns the code when the state matches", () => {
    expect(parseRedirect("myapp://oauth?code=abc&state=st", "st")).toBe("abc");
  });

  it("ignores a fragment", () => {
    expect(parseRedirect("myapp://oauth?code=abc&state=st#_=_", "st")).toBe(
      "abc",
    );
  });

  it("explains a refusal", () => {
    expect(() =>
      parseRedirect(
        "myapp://oauth?error=access_denied&error_description=No+thanks&state=st",
        "st",
      ),
    ).toThrow("No thanks");
    expect(() =>
      parseRedirect("myapp://oauth?error=access_denied", "st"),
    ).toThrow("access_denied");
  });

  it("rejects a different state, and a missing code", () => {
    expect(() =>
      parseRedirect("myapp://oauth?code=abc&state=other", "st"),
    ).toThrow(AuthError);
    expect(() => parseRedirect("myapp://oauth?state=st", "st")).toThrow(
      "sign-in code",
    );
  });
});

describe("token requests", () => {
  const NOW = 1_000_000;

  it("exchanges a code, sending the verifier as a form", async () => {
    const { calls, fetchImpl } = queueFetch(
      res(200, { access_token: "a", refresh_token: "r", expires_in: 100 }),
    );

    const tokens = await exchangeCode(config, "code", "verif", fetchImpl, NOW);

    expect(tokens).toEqual({
      accessToken: "a",
      refreshToken: "r",
      expiresAt: NOW + 100_000,
    });
    const body = new URLSearchParams(calls[0].init.body as string);
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("code");
    expect(body.get("code_verifier")).toBe("verif");
    expect(body.get("client_id")).toBe("client");
    expect(body.get("redirect_uri")).toBe("myapp://oauth");
  });

  it("keeps the old refresh token when a refresh doesn't send a new one", async () => {
    const { calls, fetchImpl } = queueFetch(
      res(200, { access_token: "a2", expires_in: 50 }),
    );

    const tokens = await refreshTokens(config, "old", fetchImpl, NOW);

    expect(tokens.refreshToken).toBe("old");
    expect(
      new URLSearchParams(calls[0].init.body as string).get("grant_type"),
    ).toBe("refresh_token");
  });

  it("defaults the lifetime to an hour", async () => {
    const { fetchImpl } = queueFetch(res(200, { access_token: "a" }));
    expect((await refreshTokens(config, "r", fetchImpl, NOW)).expiresAt).toBe(
      NOW + 3_600_000,
    );
  });

  it("reports the service's reason when it refuses", async () => {
    const { fetchImpl } = queueFetch(
      res(400, { error: "invalid_grant", error_description: "Token revoked" }),
    );
    await expect(refreshTokens(config, "r", fetchImpl, NOW)).rejects.toThrow(
      "Token revoked",
    );
  });

  it("copes with a non-JSON error", async () => {
    const { fetchImpl } = queueFetch(res(502, "<html>bad gateway</html>"));
    await expect(refreshTokens(config, "r", fetchImpl, NOW)).rejects.toThrow(
      "502",
    );
  });
});
