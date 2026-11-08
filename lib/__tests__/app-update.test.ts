import {
  checkForUpdate,
  isNewerVersion,
  parsePlayVersion,
} from "../app-update";

describe("isNewerVersion", () => {
  it("compares numerically, not as text", () => {
    expect(isNewerVersion("1.10.0", "1.9.2")).toBe(true);
    expect(isNewerVersion("2.0.0", "1.99.99")).toBe(true);
  });

  it("is false for the same or an older version", () => {
    expect(isNewerVersion("1.1.0", "1.1.0")).toBe(false);
    expect(isNewerVersion("1.0.9", "1.1.0")).toBe(false);
  });

  it("treats missing parts as zero", () => {
    expect(isNewerVersion("1.1", "1.1.0")).toBe(false);
    expect(isNewerVersion("1.1.1", "1.1")).toBe(true);
  });
});

describe("checkForUpdate", () => {
  const respond = (body: unknown, ok = true) => {
    global.fetch = jest.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: async () => body,
    }) as unknown as typeof fetch;
  };
  const options = {
    platform: "ios",
    installedVersion: "1.1.0",
    appId: "com.example.app",
  };

  it("returns the store version when it is newer", async () => {
    respond({
      results: [
        { version: "1.2.0", trackViewUrl: "https://apps.apple.com/app/id1" },
      ],
    });

    await expect(checkForUpdate(options)).resolves.toEqual({
      version: "1.2.0",
      storeUrl: "https://apps.apple.com/app/id1",
    });
  });

  it("returns null when the installed version is current", async () => {
    respond({
      results: [
        { version: "1.1.0", trackViewUrl: "https://apps.apple.com/app/id1" },
      ],
    });

    await expect(checkForUpdate(options)).resolves.toBeNull();
  });

  it("returns null when the app is not in the store yet", async () => {
    respond({ resultCount: 0, results: [] });

    await expect(checkForUpdate(options)).resolves.toBeNull();
  });

  it("throws when the lookup fails", async () => {
    respond({}, false);

    await expect(checkForUpdate(options)).rejects.toThrow("lookup failed");
  });

  it("skips platforms it cannot check", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(
      checkForUpdate({ ...options, platform: "web" }),
    ).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("Google Play", () => {
  const listing = (version: string) =>
    `...,"141":[[["${version}"]],[[[36]],[[[24,"7.0"]]]]],"145":[null,[null,"notes"]]...`;
  const respondWith = (response: object) => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response) as unknown as typeof fetch;
  };
  const options = {
    platform: "android",
    installedVersion: "1.1.0",
    appId: "com.example.app",
  };

  it("reads the version out of the listing page", () => {
    expect(parsePlayVersion(listing("1.2.3"))).toBe("1.2.3");
    expect(parsePlayVersion("<html>nothing here</html>")).toBeUndefined();
  });

  it("returns the store version when it is newer", async () => {
    respondWith({ ok: true, status: 200, text: async () => listing("1.2.0") });

    await expect(checkForUpdate(options)).resolves.toEqual({
      version: "1.2.0",
      storeUrl: "https://play.google.com/store/apps/details?id=com.example.app",
    });
  });

  it("returns null when the installed version is current", async () => {
    respondWith({ ok: true, status: 200, text: async () => listing("1.1.0") });

    await expect(checkForUpdate(options)).resolves.toBeNull();
  });

  it("returns null when the app is not listed", async () => {
    respondWith({ ok: false, status: 404, text: async () => "" });

    await expect(checkForUpdate(options)).resolves.toBeNull();
  });

  it("throws when the page has no version, so a changed page is noticed", async () => {
    respondWith({ ok: true, status: 200, text: async () => "<html></html>" });

    await expect(checkForUpdate(options)).rejects.toThrow("No version found");
  });
});
